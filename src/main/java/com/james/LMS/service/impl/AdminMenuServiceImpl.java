package com.james.LMS.service.impl;

import com.james.LMS.entity.AdminMenuModeration;
import com.james.LMS.entity.Category;
import com.james.LMS.entity.Menu;
import com.james.LMS.entity.MenuAsset;
import com.james.LMS.enums.ErrorCode;
import com.james.LMS.exception.EntityNotFoundException;
import com.james.LMS.repository.AdminMenuModerationRepository;
import com.james.LMS.repository.CategoryRepository;
import com.james.LMS.repository.MenuAssetRepository;
import com.james.LMS.repository.MenuDishRepository;
import com.james.LMS.repository.MenuRepository;
import com.james.LMS.request.MenuSearchRequest;
import com.james.LMS.request.AdminMenuUpdateRequest;
import com.james.LMS.response.AdminMenuResponse;
import com.james.LMS.response.MenuResponse;
import com.james.LMS.service.AdminMenuService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminMenuServiceImpl implements AdminMenuService {
    private final MenuRepository menus;
    private final CategoryRepository categories;
    private final MenuDishRepository menuDishes;
    private final MenuAssetRepository menuAssets;
    private final AdminMenuModerationRepository moderations;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Page<AdminMenuResponse> list(MenuSearchRequest request, String status, Boolean isActive) {
        if (request.getPage() < 1 || request.getSize() < 1 || request.getSize() > 100
                || !request.isPriceRangeValid()) {
            throw new IllegalArgumentException("Thông số phân trang hoặc khoảng giá không hợp lệ.");
        }
        if (request.getKeyword() != null && request.getKeyword().length() > 100) {
            throw new IllegalArgumentException("Từ khóa quá dài.");
        }
        if (status != null && status.length() > 100) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ.");
        }
        Page<Menu> result = menus.findAll(specification(request, status, isActive),
                PageRequest.of(request.getPage() - 1, request.getSize(), sort(request)));
        List<Long> ids = result.getContent().stream().map(Menu::getId).toList();
        if (ids.isEmpty()) return result.map(menu -> response(menu, null, List.of(), List.of()));
        Map<Long, AdminMenuModeration> moderationMap = currentModerations(ids);
        Map<Long, List<MenuResponse.DishSummary>> dishesByMenu = menuDishes.findListedDishes(ids)
                .stream().collect(Collectors.groupingBy(link -> link.getMenu().getId(),
                        Collectors.mapping(link -> new MenuResponse.DishSummary(
                                link.getDish().getId(), link.getDish().getName()), Collectors.toList())));
        Map<Long, List<String>> imagesByMenu = menuAssets
                .findByMenuIdInAndIsActiveTrueOrderByIdAsc(ids).stream()
                .collect(Collectors.groupingBy(asset -> asset.getMenu().getId(),
                        Collectors.mapping(MenuAsset::getUrl, Collectors.toList())));
        return result.map(menu -> response(menu, moderationMap.get(menu.getId()),
                dishesByMenu.getOrDefault(menu.getId(), List.of()),
                imagesByMenu.getOrDefault(menu.getId(), List.of())));
    }

    @Override
    public AdminMenuResponse detail(Long id) {
        Menu menu = menus.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.MENU_NOT_FOUND));
        AdminMenuModeration moderation = moderations
                .findFirstByMenu_IdAndRestoredAtIsNullOrderByIdDesc(id).orElse(null);
        var dishes = menuDishes.findListedDishes(List.of(id)).stream()
                .map(link -> new MenuResponse.DishSummary(link.getDish().getId(), link.getDish().getName()))
                .toList();
        var images = menuAssets.findByMenuIdInAndIsActiveTrueOrderByIdAsc(List.of(id)).stream()
                .map(MenuAsset::getUrl).toList();
        return response(menu, moderation, dishes, images);
    }

    @Override
    @Transactional
    public AdminMenuResponse update(Long id, AdminMenuUpdateRequest request) {
        if (id == null || id < 1) {
            throw new IllegalArgumentException("Mã thực đơn không hợp lệ.");
        }
        if (request.minGuests() == null || request.maxGuests() == null
                || request.minGuests() > request.maxGuests()) {
            throw new IllegalArgumentException("Khách tối đa phải lớn hơn hoặc bằng khách tối thiểu.");
        }

        Menu menu = entityManager.find(Menu.class, id, LockModeType.PESSIMISTIC_WRITE);
        if (menu == null) {
            throw new EntityNotFoundException(ErrorCode.MENU_NOT_FOUND);
        }
        Category category = categories.findByIdAndIsActiveTrue(request.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Danh mục không tồn tại hoặc đã ngừng hoạt động."));

        menu.setName(request.name().trim());
        menu.setDescription(request.description() == null ? "" : request.description().trim());
        menu.setCategory(category);
        menu.setTempPrice(request.tempPrice());
        menu.setMinGuests(request.minGuests());
        menu.setMaxGuests(request.maxGuests());
        entityManager.flush();
        return detail(id);
    }

    @Override
    @Transactional
    public AdminMenuResponse updateStatus(Long id, Long actorId, Boolean isActive, String reason) {
        if (isActive == null) throw new IllegalArgumentException("Thiếu isActive.");
        Menu menu = entityManager.find(Menu.class, id, LockModeType.PESSIMISTIC_WRITE);
        if (menu == null) throw new EntityNotFoundException(ErrorCode.MENU_NOT_FOUND);
        AdminMenuModeration current = moderations
                .findFirstByMenu_IdAndRestoredAtIsNullOrderByIdDesc(id).orElse(null);
        long now = System.currentTimeMillis();

        if (!isActive) {
            String normalized = reason == null ? "" : reason.trim();
            if (normalized.isEmpty() || normalized.length() > 1000) {
                throw new IllegalArgumentException("Lý do ẩn phải có từ 1 đến 1000 ký tự.");
            }
            if (!menu.isActive() || current != null) {
                throw new IllegalArgumentException("Thực đơn đã bị ẩn.");
            }
            AdminMenuModeration moderation = new AdminMenuModeration();
            moderation.setMenu(menu);
            moderation.setReason(normalized);
            moderation.setHiddenAt(now);
            moderation.setHiddenBy(actorId);
            moderations.save(moderation);
        } else {
            if (menu.isActive() || current == null) {
                throw new IllegalArgumentException("Chỉ khôi phục được thực đơn do Admin ẩn.");
            }
            current.setRestoredAt(now);
            current.setRestoredBy(actorId);
        }
        entityManager.flush();
        entityManager.createQuery("update Menu m set m.isActive = :active, "
                + "m.version = m.version + 1, m.updatedAt = :now where m.id = :id")
                .setParameter("active", isActive)
                .setParameter("now", now)
                .setParameter("id", id)
                .executeUpdate();
        entityManager.clear();
        return detail(id);
    }

    private Specification<Menu> specification(
            MenuSearchRequest request, String status, Boolean isActive) {
        return (root, query, cb) -> {
            List<Predicate> conditions = new ArrayList<>();
            if (isActive != null) conditions.add(cb.equal(root.get("isActive"), isActive));
            if (status != null && !status.isBlank()) {
                conditions.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase(Locale.ROOT)));
            }
            if (request.getCategoryId() != null) {
                conditions.add(cb.equal(root.get("category").get("id"), request.getCategoryId()));
            }
            if (request.getMinPrice() != null) {
                conditions.add(cb.greaterThanOrEqualTo(root.get("tempPrice"), request.getMinPrice()));
            }
            if (request.getMaxPrice() != null) {
                conditions.add(cb.lessThanOrEqualTo(root.get("tempPrice"), request.getMaxPrice()));
            }
            if (request.getDiners() != null) {
                conditions.add(cb.lessThanOrEqualTo(root.get("minGuests"), request.getDiners()));
                conditions.add(cb.greaterThanOrEqualTo(root.get("maxGuests"), request.getDiners()));
            }
            if (request.getKeyword() != null && !request.getKeyword().isBlank()) {
                String text = request.getKeyword().trim().toLowerCase(Locale.ROOT)
                        .replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
                String pattern = "%" + text + "%";
                conditions.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern, '\\'),
                        cb.like(cb.lower(root.get("description")), pattern, '\\'),
                        cb.like(cb.lower(root.get("seller").get("username")), pattern, '\\')));
            }
            return cb.and(conditions.toArray(Predicate[]::new));
        };
    }

    private Sort sort(MenuSearchRequest request) {
        Sort main = switch (request.getSort()) {
            case PRICE_ASC -> Sort.by(Sort.Direction.ASC, "tempPrice");
            case PRICE_DESC -> Sort.by(Sort.Direction.DESC, "tempPrice");
            case NAME_ASC -> Sort.by(new Sort.Order(Sort.Direction.ASC, "name").ignoreCase());
            case NAME_DESC -> Sort.by(new Sort.Order(Sort.Direction.DESC, "name").ignoreCase());
            case LATEST -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
        return main.and(Sort.by(Sort.Direction.DESC, "id"));
    }

    private Map<Long, AdminMenuModeration> currentModerations(List<Long> ids) {
        if (ids.isEmpty()) return Map.of();
        Map<Long, AdminMenuModeration> map = new HashMap<>();
        for (AdminMenuModeration moderation : moderations.findActiveForMenuIds(ids)) {
            map.put(moderation.getMenu().getId(), moderation);
        }
        return map;
    }

    private AdminMenuResponse response(Menu menu, AdminMenuModeration moderation,
            List<MenuResponse.DishSummary> dishes, List<String> images) {
        Long id = menu.getId();
        return new AdminMenuResponse(
                id, menu.getName(), menu.getDescription(), menu.getTempPrice(),
                menu.getMinGuests(), menu.getMaxGuests(), menu.getStatus(), menu.isActive(),
                menu.getCreatedAt(), menu.getUpdatedAt(),
                new MenuResponse.CategorySummary(menu.getCategory().getId(), menu.getCategory().getName()),
                new MenuResponse.SellerSummary(menu.getSeller().getId(), menu.getSeller().getUsername(),
                        menu.getSeller().getAvatarUrl()),
                dishes, images,
                moderation == null ? null : "ADMIN",
                moderation == null ? null : moderation.getReason());
    }
}
