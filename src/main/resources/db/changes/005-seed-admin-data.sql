--liquibase formatted sql

--changeset hoang:005-seed-admin-data.sql
BEGIN;

INSERT INTO roles (role_name)
SELECT seed.role_name
FROM (VALUES
          ('ROLE_USER'),
          ('ROLE_SYSTEM_ADMIN'),
          ('ROLE_CHEF')
     ) AS seed(role_name)
WHERE NOT EXISTS (
    SELECT 1
    FROM roles existing_role
    WHERE existing_role.role_name = seed.role_name
);

INSERT INTO users (
    username,
    password,
    phone,
    email,
    is_active
)
VALUES (
'systemadmin',
'$2a$10$4t6.zGSZ6OrYb.bwdhk4NOOxOa6JewG/CsGih4C5chiX9/UhrYcba',
'0900000000',
'systemadmin@gmail.com',
TRUE
)
ON CONFLICT (email) DO NOTHING;


INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.role_name = 'ROLE_SYSTEM_ADMIN'
WHERE u.email = 'systemadmin@gmail.com'
  AND NOT EXISTS (
    SELECT 1
    FROM user_roles ur
    WHERE ur.user_id = u.id
      AND ur.role_id = r.id
      AND ur.is_active = TRUE
);

COMMIT;
