package com.james.LMS.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
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

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "category_id", nullable = false)
  private Category category;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "seller_id", nullable = false)
  private User seller;

  @OneToMany(fetch = FetchType.LAZY, mappedBy = "menu")
  @Builder.Default
  private List<MenuAsset> menuAssets = new ArrayList<>();

  @OneToMany(fetch = FetchType.LAZY, mappedBy = "menu")
  @Builder.Default
  private List<MenuDish>  menuDishes = new ArrayList<>();
}
