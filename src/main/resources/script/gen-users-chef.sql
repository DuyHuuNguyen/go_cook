-- Seed 100 users: 50 ROLE_USER + 50 ROLE_CHEF
-- Địa chỉ lấy ngẫu nhiên từ bảng wards/provinces có sẵn => province_code/ward_code luôn hợp lệ, JOIN được.
-- Mật khẩu: dùng lại hash bcrypt của systemadmin (đăng nhập bằng cùng mật khẩu với systemadmin).
-- Giả định: bảng nối là user_roles(user_id, role_id). Nếu tên khác thì sửa ở cuối khối INSERT INTO user_roles.

DO $$
DECLARE
streets   text[] := ARRAY['Nguyễn Huệ','Lê Lợi','Trần Hưng Đạo','Hai Bà Trưng','Lý Thường Kiệt',
                              'Nguyễn Trãi','Phạm Văn Đồng','Võ Văn Tần','Điện Biên Phủ','Cách Mạng Tháng 8'];
    pwd       text := '$2a$10$ISvzlDSXHXs79.i4XuZNcueE0PHCFf2qxaBoXMAKzgd.YnymT8MEy';
    r_user    int;
    r_chef    int;
    i         int;
    v_name    text;
    v_role_id int;
    v_user_id bigint;
    w_code    text;
    w_name    text;
    p_code    text;
    p_name    text;
BEGIN
SELECT id INTO r_user FROM roles WHERE role_name = 'ROLE_USER';
SELECT id INTO r_chef FROM roles WHERE role_name = 'ROLE_CHEF';

FOR i IN 1..100 LOOP
        IF i <= 50 THEN
            v_name := 'user' || lpad(i::text, 3, '0');
            v_role_id := r_user;
ELSE
            v_name := 'chef' || lpad((i - 50)::text, 3, '0');
            v_role_id := r_chef;
END IF;

        -- chọn ngẫu nhiên 1 phường/xã + tỉnh tương ứng
SELECT w.code, w.name, p.code, p.name
INTO w_code, w_name, p_code, p_name
FROM wards w
         JOIN provinces p ON p.code = w.province_code
ORDER BY random()
    LIMIT 1;

INSERT INTO users (username, password, phone, email, avatar_url,
                   province_code, ward_code, address_detail)
VALUES (
           v_name,
           pwd,
           '09' || lpad((10000000 + i)::text, 8, '0'),      -- 0910000001 ... duy nhất
           v_name || '@gmail.com',
           'https://i.pravatar.cc/300?img=' || (1 + (i % 70)),
           p_code,
           w_code,
           (1 + floor(random() * 300))::int || ' ' || streets[1 + floor(random() * 10)::int]
               || ', ' || w_name || ', ' || p_name
       )
    RETURNING id INTO v_user_id;

INSERT INTO user_roles (user_id, role_id) VALUES (v_user_id, v_role_id);
END LOOP;
END $$;

-- Kiểm tra: số user theo role + join địa chỉ
-- SELECT r.role_name, count(*) FROM user_roles ur JOIN roles r ON r.id = ur.role_id GROUP BY r.role_name;
-- SELECT u.username, u.address_detail, w.name AS ward, p.name AS province
--   FROM users u
--   JOIN wards w ON w.code = u.ward_code
--   JOIN provinces p ON p.code = u.province_code
--  LIMIT 10;