package com.james.LMS.entity;

import com.james.LMS.dto.ModificationMenuDTO;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "menus")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Menu extends BaseEntity {

  @Column(name = "name", nullable = false)
  private String name;

  @Column(name = "temp_price", nullable = false)
  private BigDecimal tempPrice;

  @Column(name = "min_guests", nullable = false)
  private Integer minGuests;

  @Column(name = "max_guests", nullable = false)
  private Integer maxGuests;

  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  @Column(name = "status", length = 100)
  private String status;

  @ManyToOne(
      fetch = FetchType.LAZY,
      optional = false,
      cascade = {CascadeType.PERSIST, CascadeType.MERGE})
  @JoinColumn(name = "category_id", nullable = false)
  private Category category;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "seller_id", nullable = false)
  private User seller;

  @OneToMany(fetch = FetchType.LAZY, mappedBy = "menu")
  @Builder.Default
  private List<MenuAsset> menuAssets = new ArrayList<>();

  @OneToMany(
      fetch = FetchType.LAZY,
      mappedBy = "menu",
      cascade = {CascadeType.PERSIST})
  @Builder.Default
  private List<MenuDish> menuDishes = new ArrayList<>();

  @ManyToMany(cascade = {CascadeType.MERGE, CascadeType.PERSIST})
  @JoinTable(
      name = "menu_dishes",
      joinColumns = @JoinColumn(name = "menu_id"),
      inverseJoinColumns = @JoinColumn(name = "dish_id"))
  @Builder.Default
  private List<Dish> dishes = new ArrayList<>();

  public void addCategory(Category category) {
    this.category = category;
  }

  public void addDish(Dish dish) {
    dishes.add(dish);
  }

  public void changeInfo(ModificationMenuDTO modificationMenuDTO) {
    this.name = modificationMenuDTO.name();
    this.tempPrice = modificationMenuDTO.tempPrice();
    this.minGuests = modificationMenuDTO.minGuests();
    this.maxGuests = modificationMenuDTO.maxGuests();
    this.description = modificationMenuDTO.description();
    this.status = modificationMenuDTO.status();
  }

  public boolean containDishById(Long dishId) {
    return this.dishes.stream().anyMatch(dish -> dish.getId().equals(dishId));
  }

  public void removeDishes(List<Dish> deletableDishes) {
    Iterator<Dish> it = this.dishes.iterator();
    while (it.hasNext()) {
      Dish dish = it.next();
      if (deletableDishes.contains(dish)) {
        it.remove();
      }
    }
  }
}
