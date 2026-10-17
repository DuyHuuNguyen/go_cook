package com.james.LMS.service;

import com.james.LMS.entity.User;
import java.util.Optional;

public interface UserService {
  Optional<User> findByEmail(String email);

  User save(User user);

  Boolean existsUserByEmail(String email);

  Optional<User> findById(Long id);

  Optional<User> findUserAndInstructorById(Long id);
}
