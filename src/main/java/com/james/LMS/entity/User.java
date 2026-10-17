package com.james.LMS.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

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

    @Column(name = "province_code", length = 20)
    private String provinceCode;

    @Column(name = "ward_code", length = 20)
    private String wardCode;

    @Column(name = "address_detail", length = 500)
    private String addressDetail;

    @OneToOne(mappedBy = "user")
    private ChefProfile chefProfile;

    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.MERGE)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    @Builder.Default
    private List<Role> roles = new ArrayList<>();



    public void addRole(Role role) {
        this.roles.add(role);
    }

    public void changePassword(String newPasswordEncoded){
      this.password = newPasswordEncoded;
    }

  public void addAvatarUrl(String avatarUrl) {
      this.avatarUrl = avatarUrl;
  }

  public void changeUsername(String username) {
      this.username = username;
  }
}
