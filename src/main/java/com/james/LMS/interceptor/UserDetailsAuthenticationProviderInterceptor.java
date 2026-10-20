package com.james.LMS.interceptor;

import com.james.LMS.config.SecurityUserDetails;
import com.james.LMS.entity.Role;
import com.james.LMS.service.RoleService;
import com.james.LMS.service.UserService;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.AbstractUserDetailsAuthenticationProvider;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

@RequiredArgsConstructor
public class UserDetailsAuthenticationProviderInterceptor
    extends AbstractUserDetailsAuthenticationProvider {
  private final UserService userService;
  private final PasswordEncoder passwordEncoder;
  private final RoleService roleService;

  @Override
  protected void additionalAuthenticationChecks(
      UserDetails userDetails, UsernamePasswordAuthenticationToken authentication)
      throws AuthenticationException {}

  @Override
  protected UserDetails retrieveUser(
      String username, UsernamePasswordAuthenticationToken authentication)
      throws AuthenticationException {

    var user =
        this.userService
            .findByEmail(username)
            .orElseThrow(() -> new BadCredentialsException("Email or password is incorrect"));

    var isNotMatchedPassword =
        !this.passwordEncoder.matches(
            authentication.getCredentials().toString(), user.getPassword());

    if (isNotMatchedPassword) throw new BadCredentialsException("Email or password is incorrect");

    List<Role> roles = this.roleService.findAllByUserId(user.getId());
    List<GrantedAuthority> authorityList =
        roles.stream()
            .map(role -> new SimpleGrantedAuthority(role.getRoleName().getContent()))
            .collect(Collectors.toList());
    return SecurityUserDetails.build(user, authorityList);
  }
}
