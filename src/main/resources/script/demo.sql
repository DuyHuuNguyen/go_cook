



CREATE TEMP TABLE seed_chef_users ON COMMIT DROP AS
SELECT id AS user_id, username, email,
       ROW_NUMBER() OVER (ORDER BY username) AS rn
FROM users
WHERE username IN ('chef045','chef046','chef047','chef048','chef049','chef050');

CREATE TEMP TABLE seed_wards ON COMMIT DROP AS
SELECT code, COALESCE(full_name, name) AS ward_name,
       ROW_NUMBER() OVER (ORDER BY code) AS rn
FROM wards
WHERE province_code = '79';

CREATE TEMP TABLE seed_target_location ON COMMIT DROP AS
SELECT code AS ward_code, ward_name
FROM seed_wards
WHERE rn = 1;

-- Assign each chef a valid HCMC home ward and update the displayed address.
UPDATE users u
SET province_code = '79',
    ward_code = w.code,
    address_detail =
        CASE u.username
            WHEN 'chef045' THEN '213 Nguyễn Trãi'
            WHEN 'chef046' THEN '91 Lý Thường Kiệt'
            WHEN 'chef047' THEN '9 Lê Lợi'
            WHEN 'chef048' THEN '22 Phạm Văn Đồng'
            WHEN 'chef049' THEN '46 Võ Văn Tần'
            WHEN 'chef050' THEN '152 Cách Mạng Tháng 8'
            END || ', ' || w.ward_name || ', TP. Hồ Chí Minh',
    is_active = TRUE,
    email_verified = TRUE,
    updated_at = (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
FROM seed_chef_users c
    JOIN seed_wards w ON w.rn = c.rn
WHERE u.id = c.user_id;

-- Grant ROLE_CHEF to all six chef accounts; do not alter other roles.
INSERT INTO user_roles
(user_id, role_id, is_active, version, created_at, updated_at)
SELECT c.user_id, 1, TRUE, 0,
       (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
FROM seed_chef_users c
WHERE NOT EXISTS (
    SELECT 1
    FROM user_roles ur
    WHERE ur.user_id = c.user_id
      AND ur.role_id = 1
      AND ur.is_active = TRUE
);

-- Create/update chef profiles. All six are approved and active for matching tests.
INSERT INTO chef_profiles
(bio, experience_years, user_id, is_active, version,
 created_at, updated_at, review_status, submitted_at, status_changed_at)
SELECT
    CASE c.username
        WHEN 'chef045' THEN 'Đầu bếp chuyên món Việt, có kinh nghiệm nấu tiệc gia đình.'
        WHEN 'chef046' THEN 'Đầu bếp chuyên các món cơm nhà và món Việt truyền thống.'
        WHEN 'chef047' THEN 'Đầu bếp có thế mạnh với món phở và các món nước.'
        WHEN 'chef048' THEN 'Đầu bếp mới tham gia GoCook, đang cập nhật kỹ năng món ăn.'
        WHEN 'chef049' THEN 'Đầu bếp phục vụ linh hoạt trên toàn địa bàn TP. Hồ Chí Minh.'
        WHEN 'chef050' THEN 'Đầu bếp có kinh nghiệm nấu tiệc và thực đơn gia đình.'
        END,
    CASE c.username
        WHEN 'chef045' THEN 8
        WHEN 'chef046' THEN 6
        WHEN 'chef047' THEN 3
        WHEN 'chef048' THEN 2
        WHEN 'chef049' THEN 10
        WHEN 'chef050' THEN 7
        END,
    c.user_id, TRUE, 0,
    (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    'APPROVED',
    (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
FROM seed_chef_users c
    ON CONFLICT (user_id) DO UPDATE
                                 SET bio = EXCLUDED.bio,
                                 experience_years = EXCLUDED.experience_years,
                                 is_active = TRUE,
                                 review_status = 'APPROVED',
                                 review_reason = NULL,
                                 submitted_at = EXCLUDED.submitted_at,
                                 status_changed_at = EXCLUDED.status_changed_at,
                                 updated_at = EXCLUDED.updated_at;

-- Shared catalog dishes. chef_id=NULL makes these common dishes, not chef-owned dishes.
INSERT INTO dishes (name, is_active, version, created_at, updated_at, chef_id)
SELECT d.name, TRUE, 0,
       (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    NULL
FROM (VALUES
          ('Phở bò'),
          ('Cơm tấm sườn'),
          ('Gỏi cuốn tôm thịt'),
          ('Canh chua cá')
     ) AS d(name)
WHERE NOT EXISTS (
    SELECT 1 FROM dishes existing
    WHERE existing.name = d.name AND existing.chef_id IS NULL
);

CREATE TEMP TABLE seed_dishes ON COMMIT DROP AS
SELECT d.name, MIN(d.id) AS dish_id
FROM dishes d
WHERE d.chef_id IS NULL
  AND d.name IN ('Phở bò','Cơm tấm sườn','Gỏi cuốn tôm thịt','Canh chua cá')
GROUP BY d.name;

DO $$
BEGIN
    IF (SELECT COUNT(*) FROM seed_dishes) <> 4 THEN
        RAISE EXCEPTION 'Could not resolve all four shared seed dishes.';
END IF;
END $$;

-- Reset skill mappings for these six fixture chefs only.
DELETE FROM chef_dishes cd
    USING chef_profiles cp, seed_chef_users scu
WHERE cd.chef_profile_id = cp.id
  AND cp.user_id = scu.user_id;

-- Skills:
-- chef045: 4/4; chef046: 3/4; chef047: 1/4; chef048: 0/4;
-- chef049: 4/4; chef050: 4/4 (but has a conflicting confirmed schedule).
INSERT INTO chef_dishes (chef_profile_id, dish_id)
SELECT cp.id, sd.dish_id
FROM chef_profiles cp
         JOIN seed_chef_users scu ON scu.user_id = cp.user_id
         JOIN seed_dishes sd ON
    CASE scu.username
        WHEN 'chef045' THEN sd.name IN ('Phở bò','Cơm tấm sườn','Gỏi cuốn tôm thịt','Canh chua cá')
        WHEN 'chef046' THEN sd.name IN ('Phở bò','Cơm tấm sườn','Gỏi cuốn tôm thịt')
        WHEN 'chef047' THEN sd.name = 'Phở bò'
        WHEN 'chef048' THEN FALSE
        WHEN 'chef049' THEN sd.name IN ('Phở bò','Cơm tấm sườn','Gỏi cuốn tôm thịt','Canh chua cá')
        WHEN 'chef050' THEN sd.name IN ('Phở bò','Cơm tấm sườn','Gỏi cuốn tôm thịt','Canh chua cá')
        END;

-- Reset service areas for these six fixture chefs only.
DELETE FROM chef_service_areas csa
    USING chef_profiles cp, seed_chef_users scu
WHERE csa.chef_profile_id = cp.id
  AND cp.user_id = scu.user_id;

-- Five chefs serve the booking's ward. chef049 serves the whole province (ward_code NULL).
INSERT INTO chef_service_areas
(chef_profile_id, province_code, ward_code, is_active, version, created_at, updated_at)
SELECT cp.id, '79',
       CASE WHEN scu.username = 'chef049' THEN NULL ELSE loc.ward_code END,
       TRUE, 0,
       (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
FROM chef_profiles cp
         JOIN seed_chef_users scu ON scu.user_id = cp.user_id
         CROSS JOIN seed_target_location loc;

-- Create the target booking, scheduled seven days from now at 18:00.
-- Customer is user_id=1. No chef is assigned to this booking initially.
INSERT INTO bookings
(booking_code, customer_id, chef_id, scheduled_at, service_address,
 customer_note, guest_count, total_amount, booking_status, is_active,
 version, created_at, updated_at, province_code, ward_code)
SELECT
    'SEED-MATCHING-HCMC-001',
    1,
    NULL,
    date_trunc('day', NOW()) + INTERVAL '7 days 18 hours',
    'Địa chỉ kiểm thử, ' || loc.ward_name || ', TP. Hồ Chí Minh',
    'Booking dùng để kiểm thử chức năng matching đầu bếp GoCook.',
    4,
    1500000.00,
    'PENDING',
    TRUE,
    0,
    (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    '79',
    loc.ward_code
FROM seed_target_location loc
ON CONFLICT (booking_code) DO UPDATE
                                  SET customer_id = EXCLUDED.customer_id,
                                  chef_id = NULL,
                                  scheduled_at = EXCLUDED.scheduled_at,
                                  service_address = EXCLUDED.service_address,
                                  customer_note = EXCLUDED.customer_note,
                                  guest_count = EXCLUDED.guest_count,
                                  total_amount = EXCLUDED.total_amount,
                                  booking_status = 'PENDING',
                                  is_active = TRUE,
                                  province_code = EXCLUDED.province_code,
                                  ward_code = EXCLUDED.ward_code,
                                  updated_at = EXCLUDED.updated_at;

CREATE TEMP TABLE seed_target_booking ON COMMIT DROP AS
SELECT id AS booking_id
FROM bookings
WHERE booking_code = 'SEED-MATCHING-HCMC-001';

-- Booking contains all four sample dishes.
DELETE FROM booking_item_dishes bid
    USING seed_target_booking stb
WHERE bid.booking_id = stb.booking_id;

INSERT INTO booking_item_dishes
(dish_id, dish_name, quantity, is_active, version, created_at, updated_at, booking_id)
SELECT sd.dish_id, sd.name, 1, TRUE, 0,
       (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    stb.booking_id
FROM seed_dishes sd
         CROSS JOIN seed_target_booking stb;

-- Create a separate confirmed booking assigned to chef050.
-- Its schedule overlaps the target booking, so chef050 should be excluded.
-- Customer user_id=1 is reused to avoid requiring a second customer account.
INSERT INTO bookings
(booking_code, customer_id, chef_id, scheduled_at, service_address,
 customer_note, guest_count, total_amount, booking_status, is_active,
 version, created_at, updated_at, province_code, ward_code)
SELECT
    'SEED-MATCHING-HCMC-BUSY-050',
    1,
    scu.user_id,
    target.scheduled_at,
    'Địa chỉ kiểm thử lịch bận, ' || loc.ward_name || ', TP. Hồ Chí Minh',
    'Booking phụ tạo lịch bận cho chef050.',
    4,
    1200000.00,
    'CONFIRMED',
    TRUE,
    0,
    (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    '79',
    loc.ward_code
FROM bookings target
         JOIN seed_target_booking stb ON stb.booking_id = target.id
         JOIN seed_chef_users scu ON scu.username = 'chef050'
         CROSS JOIN seed_target_location loc
    ON CONFLICT (booking_code) DO UPDATE
SET customer_id = EXCLUDED.customer_id,
    chef_id = EXCLUDED.chef_id,
    scheduled_at = EXCLUDED.scheduled_at,
    service_address = EXCLUDED.service_address,
    booking_status = 'CONFIRMED',
    is_active = TRUE,
    province_code = EXCLUDED.province_code,
    ward_code = EXCLUDED.ward_code,
    updated_at = EXCLUDED.updated_at;

-- Reset and recreate the fixture schedule for chef050.
DELETE FROM chef_schedules
WHERE booking_id = (
    SELECT id FROM bookings
    WHERE booking_code = 'SEED-MATCHING-HCMC-BUSY-050'
);

INSERT INTO chef_schedules
(chef_id, booking_id, start_at, end_at, status, hold_expires_at,
 is_active, version, created_at, updated_at)
SELECT
    scu.user_id,
    busy.id,
    target.scheduled_at - INTERVAL '30 minutes',
    target.scheduled_at + INTERVAL '30 minutes',
    'CONFIRMED',
    NULL,
    TRUE,
    0,
    (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
FROM bookings target
    JOIN seed_target_booking stb ON stb.booking_id = target.id
    JOIN bookings busy
    ON busy.booking_code = 'SEED-MATCHING-HCMC-BUSY-050'
    JOIN seed_chef_users scu ON scu.username = 'chef050';

--thay lại user của chef cho hợp lệ
UPDATE users
SET username = CASE email
                   WHEN 'chef045@gmail.com' THEN 'Nguyễn Văn Thuận'
                   WHEN 'chef046@gmail.com' THEN 'Trần Thanh Hà'
                   WHEN 'chef047@gmail.com' THEN 'Lê Quanh Huy'
                   WHEN 'chef048@gmail.com' THEN 'Phạm Thị Thảo'
                   WHEN 'chef049@gmail.com' THEN 'Võ Hoàng Trâm'
                   WHEN 'chef050@gmail.com' THEN 'Đặng Minh Thư'
    END,
    updated_at = (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
WHERE email IN (
    'chef045@gmail.com',
    'chef046@gmail.com',
    'chef047@gmail.com',
    'chef048@gmail.com',
    'chef049@gmail.com',
    'chef050@gmail.com'
    );

COMMIT;


select * from users
