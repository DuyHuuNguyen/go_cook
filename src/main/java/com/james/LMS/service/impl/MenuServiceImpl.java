package com.james.LMS.service.impl;

import com.james.LMS.entity.Menu;
import com.james.LMS.entity.MenuAsset;
import com.james.LMS.repository.MenuAssetRepository;
import com.james.LMS.repository.MenuDishRepository;
import com.james.LMS.repository.MenuRepository;
import com.james.LMS.repository.specification.MenuSpecifications;
import com.james.LMS.request.MenuSearchRequest;
import com.james.LMS.response.MenuResponse;
import com.james.LMS.service.MenuService;

import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuServiceImpl implements MenuService {
    private final MenuRepository menuRepository;
    private final MenuDishRepository menuDishRepository;
    private final MenuAssetRepository menuAssetRepository;

    @Override
    public Page<MenuResponse> findMenus(MenuSearchRequest request) {
        validateRequest(request);
        // Page only the aggregate roots: fetching a collection here would break SQL pagination.
        var menus =
                menuRepository.findAll(
                        MenuSpecifications.listedMenus(request),
                        PageRequest.of(request.getPage() - 1, request.getSize(), buildSort(request)));
        if (menus.isEmpty()) {
            return new PageImpl<>(List.of(), menus.getPageable(), menus.getTotalElements());
        }
        var ids = menus.getContent().stream().map(menu -> menu.getId()).toList();
        var dishes =
                menuDishRepository.findListedDishes(ids).stream()
                        .collect(
                                Collectors.groupingBy(
                                        md -> md.getMenu().getId(),
                                        Collectors.mapping(
                                                md ->
                                                        new MenuResponse.DishSummary(
                                                                md.getDish().getId(), md.getDish().getName()),
                                                Collectors.toList())));
        var images =
                menuAssetRepository.findByMenuIdInAndIsActiveTrueOrderByIdAsc(ids).stream()
                        .collect(
                                Collectors.groupingBy(
                                        asset -> asset.getMenu().getId(),
                                        Collectors.mapping(MenuAsset::getUrl, Collectors.toList())));
        return menus.map(
                menu ->
                        new MenuResponse(
                                menu.getId(),
                                menu.getName(),
                                menu.getDescription(),
                                menu.getTempPrice(),
                                menu.getMinGuests(),
                                menu.getMaxGuests(),
                                menu.getStatus(),
                                menu.getCreatedAt(),
                                new MenuResponse.CategorySummary(
                                        menu.getCategory().getId(), menu.getCategory().getName()),
                                new MenuResponse.SellerSummary(
                                        menu.getSeller().getId(),
                                        menu.getSeller().getUsername(),
                                        menu.getSeller().getAvatarUrl()),
                                dishes.getOrDefault(menu.getId(), List.of()),
                                images.getOrDefault(menu.getId(), List.of())));
    }

    @Override
    public Page<MenuResponse> findAllMenuByChefId(Long chefId, Pageable pageable) {

        var menus = this.menuRepository.findAllByChefId(chefId, pageable);
        if (menus.isEmpty()) {
            return new PageImpl<>(List.of(), menus.getPageable(), menus.getTotalElements());
        }

        var ids = menus.getContent().stream().map(menu -> menu.getId()).toList();
        var dishes =
                menuDishRepository.findListedDishes(ids).stream()
                        .collect(
                                Collectors.groupingBy(
                                        md -> md.getMenu().getId(),
                                        Collectors.mapping(
                                                md ->
                                                        new MenuResponse.DishSummary(
                                                                md.getDish().getId(), md.getDish().getName()),
                                                Collectors.toList())));
        var images =
                menuAssetRepository.findByMenuIdInAndIsActiveTrueOrderByIdAsc(ids).stream()
                        .collect(
                                Collectors.groupingBy(
                                        asset -> asset.getMenu().getId(),
                                        Collectors.mapping(MenuAsset::getUrl, Collectors.toList())));
        return menus.map(
                menu ->
                        new MenuResponse(
                                menu.getId(),
                                menu.getName(),
                                menu.getDescription(),
                                menu.getTempPrice(),
                                menu.getMinGuests(),
                                menu.getMaxGuests(),
                                menu.getStatus(),
                                menu.getCreatedAt(),
                                new MenuResponse.CategorySummary(
                                        menu.getCategory().getId(), menu.getCategory().getName()),
                                new MenuResponse.SellerSummary(
                                        menu.getSeller().getId(),
                                        menu.getSeller().getUsername(),
                                        menu.getSeller().getAvatarUrl()),
                                dishes.getOrDefault(menu.getId(), List.of()),
                                images.getOrDefault(menu.getId(), List.of())));
    }

    @Override
    public Optional<Menu> findByIdAndChefIdAndFetchDishesAndCategory(Long id, Long chefId) {
        return this.menuRepository.findByIdAndChefIdAndIsActiveTrueAndFetchDishesAndCategory(id,chefId);
    }

    @Override
    public List<MenuResponse> findByIdGreaterThanOrderByChefId(Long lastMenuId, Long chefId) {

        List<Menu>  menus = this.menuRepository.findByIdGreaterThanAndSeller_IdOrderByIdAsc(lastMenuId,chefId);

        var ids = menus.stream().map(menu -> menu.getId()).toList();
        var dishes =
                menuDishRepository.findListedDishes(ids).stream()
                        .collect(
                                Collectors.groupingBy(
                                        md -> md.getMenu().getId(),
                                        Collectors.mapping(
                                                md ->
                                                        new MenuResponse.DishSummary(
                                                                md.getDish().getId(), md.getDish().getName()),
                                                Collectors.toList())));
        var images =
                menuAssetRepository.findByMenuIdInAndIsActiveTrueOrderByIdAsc(ids).stream()
                        .collect(
                                Collectors.groupingBy(
                                        asset -> asset.getMenu().getId(),
                                        Collectors.mapping(MenuAsset::getUrl, Collectors.toList())));
        return menus.stream().map(
                menu ->
                        new MenuResponse(
                                menu.getId(),
                                menu.getName(),
                                menu.getDescription(),
                                menu.getTempPrice(),
                                menu.getMinGuests(),
                                menu.getMaxGuests(),
                                menu.getStatus(),
                                menu.getCreatedAt(),
                                new MenuResponse.CategorySummary(
                                        menu.getCategory().getId(), menu.getCategory().getName()),
                                new MenuResponse.SellerSummary(
                                        menu.getSeller().getId(),
                                        menu.getSeller().getUsername(),
                                        menu.getSeller().getAvatarUrl()),
                                dishes.getOrDefault(menu.getId(), List.of()),
                                images.getOrDefault(menu.getId(), List.of()))).toList();
    }

    @Override
    public Optional<Boolean> hasMenuByChefId(Long chefId,Long menuId) {
        return this.menuRepository.hasMenuByChefId( chefId, menuId);
    }

    private Sort buildSort(MenuSearchRequest request) {
        Sort primary =
                switch (request.getSort()) {
                    case PRICE_ASC -> Sort.by(Sort.Direction.ASC, "tempPrice");
                    case PRICE_DESC -> Sort.by(Sort.Direction.DESC, "tempPrice");
                    case NAME_ASC -> Sort.by(new Sort.Order(Sort.Direction.ASC, "name").ignoreCase());
                    case NAME_DESC -> Sort.by(new Sort.Order(Sort.Direction.DESC, "name").ignoreCase());
                    case LATEST -> Sort.by(Sort.Direction.DESC, "createdAt");
                };
        return primary.and(Sort.by(Sort.Direction.DESC, "id"));
    }

    private void validateRequest(MenuSearchRequest request) {
        if (request.getPage() < 1 || request.getSize() < 1 || request.getSize() > 100) {
            throw new IllegalArgumentException("page must be >= 1 and size must be between 1 and 100");
        }
        if (!request.isPriceRangeValid()) {
            throw new IllegalArgumentException("minPrice must be less than or equal to maxPrice");
        }
    }

    @Override
    public void save(Menu menu) {
        this.menuRepository.save(menu);
    }

    @Override
    public Optional<Menu> findByIdAndChefId(Long id, Long chefId) {
        return this.menuRepository.findByIdAndSeller_idAndIsActiveTrue(id, chefId);
    }
}
