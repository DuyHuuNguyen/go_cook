package com.james.LMS.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "dishes")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Dish extends BaseEntity {

  @ManyToOne
  @JoinColumn(name = "chef_id")
  private User chef;

  @Column(name = "name", nullable = false)
  private String name;
}
