package com.james.LMS.entity;

import com.james.LMS.enums.ChefScheduleStatus;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "chef_schedules")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class ChefSchedule extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "chef_id", nullable = false)
  private User chef;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "booking_id", nullable = false)
  private Booking booking;

  @Column(name = "start_at", nullable = false)
  private Instant startAt;

  @Column(name = "end_at", nullable = false)
  private Instant endAt;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 30)
  @Builder.Default
  private ChefScheduleStatus status = ChefScheduleStatus.HELD;

  @Column(name = "hold_expires_at")
  private Instant holdExpiresAt;
}
