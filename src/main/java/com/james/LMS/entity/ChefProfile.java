package com.james.LMS.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "chef_profiles")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class ChefProfile extends BaseEntity {

  @Column(name = "bio", columnDefinition = "TEXT")
  private String bio;

  @Column(name = "experience_years", nullable = false)
  private Integer experienceYears;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user;

  public void addUser(User user) {
    this.user = user;
  }
}
