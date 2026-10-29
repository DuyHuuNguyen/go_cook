package com.james.LMS.service.impl;

import com.james.LMS.entity.AdminDishModeration;
import com.james.LMS.entity.Dish;
import com.james.LMS.repository.AdminDishModerationRepository;
import com.james.LMS.repository.DishRepository;
import com.james.LMS.response.AdminDishResponse;
import com.james.LMS.service.AdminDishService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDishServiceImpl implements AdminDishService {
    private final DishRepository dishes;
    private final AdminDishModerationRepository moderations;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Page<AdminDishResponse> list(String keyword, Boolean isActive, String ownership,
                                        Long chefId, int page, int size, String sortBy,
                                        String sortDirection) {
        if (page < 1 || size < 1 || size > 100) {
            throw new IllegalArgumentException("Phân trang không hợp lệ.");
        }
        if (keyword != null && keyword.length() > 100) {
            throw new IllegalArgumentException("Từ khóa quá dài.");
        }
        if (chefId != null && chefId <= 0) {
            throw new IllegalArgumentException("Mã đầu bếp không hợp lệ.");
        }
        String ownershipValue = ownership == null ? "" : ownership.trim().toUpperCase(Locale.ROOT);
        if (!List.of("", "SHARED", "CHEF").contains(ownershipValue)) {
            throw new IllegalArgumentException("Nguồn món không hợp lệ.");
        }
        String field = switch (sortBy == null ? "id" : sortBy) {
            case "id" -> "id";
            case "name" -> "name";
            case "createdAt" -> "createdAt";
            default -> throw new IllegalArgumentException("Cột sắp xếp không hợp lệ.");
        };
        if (!"asc".equalsIgnoreCase(sortDirection) && !"desc".equalsIgnoreCase(sortDirection)) {
            throw new IllegalArgumentException("Chiều sắp xếp không hợp lệ.");
        }
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDirection)
                ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort order = Sort.by(direction, field);
        if (!"id".equals(field)) order = order.and(Sort.by(Sort.Direction.ASC, "id"));
        String search = keyword == null ? "" : keyword.trim().toLowerCase(Locale.ROOT);
        Specification<Dish> filters = (root, query, cb) -> {
            List<Predicate> conditions = new ArrayList<>();
            if (isActive != null) conditions.add(cb.equal(root.get("isActive"), isActive));
            if ("SHARED".equals(ownershipValue)) conditions.add(cb.isNull(root.get("chef")));
            if ("CHEF".equals(ownershipValue)) conditions.add(cb.isNotNull(root.get("chef")));
            if (chefId != null) conditions.add(cb.equal(root.get("chef").get("id"), chefId));
            if (!search.isEmpty()) {
                String escaped = search.replace("\\", "\\\\").replace("%", "\\%")
                        .replace("_", "\\_");
                conditions.add(cb.like(cb.lower(root.get("name")), "%" + escaped + "%", '\\'));
            }
            return cb.and(conditions.toArray(Predicate[]::new));
        };
        Page<Dish> result = dishes.findAll(filters, PageRequest.of(page - 1, size, order));
        List<Long> ids = result.getContent().stream().map(Dish::getId).toList();
        Map<Long, AdminDishModeration> active = new HashMap<>();
        if (!ids.isEmpty()) {
            for (AdminDishModeration record : moderations.findActiveForDishIds(ids)) {
                active.put(record.getDish().getId(), record);
            }
        }
        return result.map(dish -> response(dish, active.get(dish.getId())));
    }

    @Override
    public AdminDishResponse detail(Long id) {
        Dish dish = dishes.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy món ăn."));
        var active = moderations.findFirstByDish_IdAndRestoredAtIsNullOrderByIdDesc(id).orElse(null);
        return response(dish, active);
    }

    @Override
    @Transactional
    public AdminDishResponse update(Long id, String name) {
        String normalized = name == null ? "" : name.trim();
        if (normalized.isBlank() || normalized.length() > 255) {
            throw new IllegalArgumentException("Tên món phải có từ 1 đến 255 ký tự.");
        }
        Dish dish = entityManager.find(Dish.class, id, LockModeType.PESSIMISTIC_WRITE);
        if (dish == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy món ăn.");
        dish.setName(normalized);
        entityManager.flush();
        entityManager.clear();
        return detail(id);
    }

    @Override
    @Transactional
    public AdminDishResponse updateStatus(Long id, Long actorId, Boolean isActive, String reason) {
        if (isActive == null) throw new IllegalArgumentException("Thiếu isActive.");
        Dish dish = entityManager.find(Dish.class, id, LockModeType.PESSIMISTIC_WRITE);
        if (dish == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy món ăn.");
        AdminDishModeration active = moderations
                .findFirstByDish_IdAndRestoredAtIsNullOrderByIdDesc(id).orElse(null);
        long now = System.currentTimeMillis();
        if (!isActive) {
            String normalized = reason == null ? "" : reason.trim();
            if (normalized.isEmpty() || normalized.length() > 1000) {
                throw new IllegalArgumentException("Lý do ẩn phải có từ 1 đến 1000 ký tự.");
            }
            if (!dish.isActive() || active != null) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Món ăn đã bị ẩn.");
            }
            AdminDishModeration audit = new AdminDishModeration();
            audit.setDish(dish);
            audit.setReason(normalized);
            audit.setHiddenBy(actorId);
            audit.setHiddenAt(now);
            moderations.save(audit);
        } else {
            if (dish.isActive() || active == null) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Chỉ khôi phục được món do Admin ẩn.");
            }
            active.setRestoredBy(actorId);
            active.setRestoredAt(now);
        }
        entityManager.flush();
        entityManager.createQuery("update Dish d set d.isActive = :active, "
                + "d.version = d.version + 1, d.updatedAt = :now where d.id = :id")
                .setParameter("active", isActive)
                .setParameter("now", now)
                .setParameter("id", id)
                .executeUpdate();
        entityManager.clear();
        return detail(id);
    }

    private AdminDishResponse response(Dish dish, AdminDishModeration moderation) {
        return new AdminDishResponse(
                dish.getId(), dish.getName(), dish.isActive(),
                dish.getChef() == null ? null : dish.getChef().getId(),
                dish.getChef() == null ? null : dish.getChef().getUsername(),
                dish.getCreatedAt(), dish.getUpdatedAt(),
                moderation == null ? null : "ADMIN",
                moderation == null ? null : moderation.getReason());
    }
}
