package com.james.LMS.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "booking_item_dishes")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class BookingItemDish extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "booking_id", nullable = false)
  private Booking booking;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "dish_id", nullable = false)
  private Dish dish;

  @Column(name = "dish_name", length = 255)
  private String dishName;

  @Column(name = "quantity", nullable = false)
  private Integer quantity;

  @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
  private BigDecimal unitPrice;
}
