package com.james.LMS.entity;

import com.james.LMS.enums.ChefApplicationStatus;
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

  @Enumerated(EnumType.STRING)
  @Column(name = "review_status", nullable = false)
  @Builder.Default
  private ChefApplicationStatus reviewStatus = ChefApplicationStatus.PENDING;

  @Column(name = "review_reason", length = 1000)
  private String reviewReason;

  @Column(name = "submitted_at")
  private Long submittedAt;

  @Column(name = "status_changed_at")
  private Long statusChangedAt;

  @Column(name = "status_changed_by")
  private Long statusChangedBy;

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
