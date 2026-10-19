package com.james.LMS.entity.location;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "wards")
@Getter
@Setter
@NoArgsConstructor
public class Ward {

  @Id
  @Column(name = "code", length = 20)
  private String code;

  @Column(name = "name")
  private String name;

  @Column(name = "name_en")
  private String nameEn;

  @Column(name = "full_name")
  private String fullName;

  @Column(name = "full_name_en")
  private String fullNameEn;

  @Column(name = "code_name")
  private String codeName;

  @Column(name = "postal_code")
  private String postalCode;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "province_code", referencedColumnName = "code")
  private Province province;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "administrative_unit_id")
  private AdministrativeUnit administrativeUnit;
}
