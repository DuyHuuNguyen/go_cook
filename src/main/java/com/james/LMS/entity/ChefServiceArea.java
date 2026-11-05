package com.james.LMS.entity;

import com.james.LMS.entity.location.Province;
import com.james.LMS.entity.location.Ward;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "chef_service_areas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ChefServiceArea extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "chef_profile_id", nullable = false)
  private ChefProfile chefProfile;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "province_code", referencedColumnName = "code")
  private Province province;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "ward_code", referencedColumnName = "code")
  private Ward ward;
}
