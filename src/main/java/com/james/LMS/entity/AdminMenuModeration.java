package com.james.LMS.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "admin_menu_moderations")
@Getter
@Setter
@NoArgsConstructor
public class AdminMenuModeration {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "menu_id", nullable = false)
  private Menu menu;

  @Column(name = "reason", nullable = false, length = 1000)
  private String reason;

  @Column(name = "hidden_by", nullable = false)
  private Long hiddenBy;

  @Column(name = "hidden_at", nullable = false)
  private Long hiddenAt;

  @Column(name = "restored_by")
  private Long restoredBy;

  @Column(name = "restored_at")
  private Long restoredAt;
}
