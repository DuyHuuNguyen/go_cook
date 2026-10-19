SELECT
    u.id,
    u.username,
    u.phone,
    u.email,
    u.avatar_url,
    u.address_detail,
    w.code      AS ward_code,
    w.name      AS ward_name,
    p.code      AS province_code,
    p.name      AS province_name,
    CONCAT_WS(', ', u.address_detail, w.name, p.name) AS full_address

FROM users u
         LEFT JOIN provinces p ON p.code = u.province_code
         LEFT JOIN wards w     ON w.code = u.ward_code

GROUP BY u.id, w.code, w.name, p.code, p.name
ORDER BY u.id;