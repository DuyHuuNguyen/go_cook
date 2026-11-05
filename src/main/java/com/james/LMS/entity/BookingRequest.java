package com.james.LMS.entity;

import com.james.LMS.enums.BookingRequestStatus;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "booking_requests")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class BookingRequest extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "booking_id", nullable = false)
  private Booking booking;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "chef_id", nullable = false)
  private User chef;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 30)
  private BookingRequestStatus status;

  @Column(name = "expires_at")
  private Instant expiresAt;
}
