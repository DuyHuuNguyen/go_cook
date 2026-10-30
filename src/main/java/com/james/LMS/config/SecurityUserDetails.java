package com.james.LMS.config;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.james.LMS.entity.User;
import com.james.LMS.enums.RoleEnum;
import java.util.Collection;
import java.util.List;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

@Builder
@AllArgsConstructor
@RequiredArgsConstructor
public class SecurityUserDetails implements UserDetails {
  @Getter @Setter public Long id;
  @Getter private String email;
  @JsonIgnore private String password;
  private String username;
  @Getter private String avatarUrl;
  @Builder.Default private boolean enabled = true;
  private Collection<? extends GrantedAuthority> authorities;

  public static SecurityUserDetails build(User user, List<GrantedAuthority> authorities) {
    return SecurityUserDetails.builder()
        .id(user.getId())
        .email(user.getEmail())
        .password(user.getPassword())
        .username(user.getUsername())
        .avatarUrl(user.getAvatarUrl())
        .enabled(user.isActive())
        .authorities(authorities)
        .build();
  }

  public static SecurityUserDetails build(User user) {
    return SecurityUserDetails.builder()
        .id(user.getId())
        .email(user.getEmail())
        .password(user.getPassword())
        .username(user.getUsername())
        .avatarUrl(user.getAvatarUrl())
        .enabled(user.isActive())
        .build();
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return this.authorities;
  }

  @Override
  public String getPassword() {
    return this.password;
  }

  @Override
  public String getUsername() {
    return this.email;
  }

  @Override
  public boolean isEnabled() {
    return enabled;
  }

  public String getDisplayName() {
    return this.username;
  }

  public String getRememberInfo() {
    StringBuilder rememberSb = new StringBuilder();
    rememberSb
        .append(RoleEnum.ROLE_USER)
        .append("_")
        .append(this.email)
        .append("_")
        .append(this.username)
        .append("_")
        .append(this.avatarUrl);
    return rememberSb.toString();
  }

  public boolean isChef() {
    return this.authorities.stream()
        .map(GrantedAuthority::getAuthority)
        .anyMatch(role -> role.equals(RoleEnum.ROLE_CHEF.getContent()));
  }

  public static SecurityUserDetails getPrincipal() {
    return (SecurityUserDetails)
        SecurityContextHolder.getContext().getAuthentication().getPrincipal();
  }
}
