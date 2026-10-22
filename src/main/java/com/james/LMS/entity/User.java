package com.james.LMS.entity;

import com.james.LMS.entity.location.Province;
import com.james.LMS.entity.location.Ward;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class User extends BaseEntity {

  @Column(name = "username", nullable = false)
  private String username;

  @Column(name = "password", nullable = false)
  private String password;

  @Column(name = "phone", nullable = false, length = 15)
  private String phone;

  @Column(name = "email", nullable = false, unique = true)
  private String email;

  @Column(name = "avatar_url")
  private String avatarUrl;

  @ManyToOne(
      fetch = FetchType.LAZY,
      cascade = {CascadeType.MERGE, CascadeType.PERSIST})
  @JoinColumn(name = "province_code")
  private Province province;

  @ManyToOne(
      fetch = FetchType.LAZY,
      cascade = {CascadeType.MERGE, CascadeType.PERSIST})
  @JoinColumn(name = "ward_code")
  private Ward ward;

  @Column(name = "address_detail", length = 500)
  private String addressDetail;

  @OneToOne(
      mappedBy = "user",
      cascade = {CascadeType.MERGE, CascadeType.PERSIST})
  private ChefProfile chefProfile;

  @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.MERGE)
  @JoinTable(
      name = "user_roles",
      joinColumns = @JoinColumn(name = "user_id"),
      inverseJoinColumns = @JoinColumn(name = "role_id"))
  @Builder.Default
  private List<Role> roles = new ArrayList<>();

  @OneToMany(
      mappedBy = "chef",
      cascade = {CascadeType.PERSIST, CascadeType.MERGE})
  private List<Dish> dishes = new ArrayList<>();

  public void addRole(Role role) {
    this.roles.add(role);
  }

  public void changePassword(String newPasswordEncoded) {
    this.password = newPasswordEncoded;
  }

  public void addAvatarUrl(String avatarUrl) {
    this.avatarUrl = avatarUrl;
  }

  public void changeUsername(String username) {
    this.username = username;
  }

  public void addChefProfile(ChefProfile chefProfile) {
    this.chefProfile = chefProfile;
    this.chefProfile.addUser(this);
  }

  public void addProvince(Province province) {
    this.province = province;
  }

  public void addWard(Ward ward) {
    this.ward = ward;
  }
}
