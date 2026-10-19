-- GOCook - dữ liệu mẫu cho menus, menu_dishes, menu_assets.
-- Sinh dựa trên chính file gocook_200_mon_an_co_id.sql: dish_id 1..200.
-- YÊU CẦU: bảng menus, menu_dishes, menu_assets đã tồn tại (không tạo lại),
--           bảng dishes đã có đủ 200 ID, seller_id đang cấu hình phải tồn tại.
-- CẢNH BÁO: ý nghĩa category_id CHƯA ĐƯỢC CUNG CẤP. 1..6 chỉ là ví dụ.
-- Chỉnh lại 6 ID danh mục dưới đây để khớp tên category thật trong DB.
-- temp_price được hiểu là giá tham khảo CẢ GÓI, đơn vị đồng Việt Nam (VND).
-- status = 'ACTIVE' chỉ là trạng thái mẫu; chỉnh theo enum/trạng thái backend.
-- URL ảnh /images/menus/... nằm trong ZIP: copy thư mục public vào root React/Vite.
-- Script có kiểm tra trùng ID; nếu đã có dữ liệu sẽ ROLLBACK, không xóa dữ liệu cũ.

BEGIN;

-- CONFIG: chỉnh 7 số sau trước khi chạy trên dữ liệu thật.
CREATE TEMP TABLE _gocook_menu_seed_cfg ON COMMIT DROP AS
SELECT
  1::BIGINT AS seller_id,
  1::BIGINT AS family_category_id,
  2::BIGINT AS office_category_id,
  3::BIGINT AS healthy_category_id,
  4::BIGINT AS traditional_category_id,
  5::BIGINT AS party_category_id,
  6::BIGINT AS vegetarian_category_id;

DO $gocook$
BEGIN
    IF EXISTS (SELECT 1 FROM menus WHERE id BETWEEN 1 AND 48) OR
       EXISTS (SELECT 1 FROM menu_assets WHERE id BETWEEN 1 AND 96) OR
       EXISTS (SELECT 1 FROM menu_dishes WHERE id BETWEEN 1 AND 206) THEN
        RAISE EXCEPTION 'Đã có bản ghi trùng ID trong menus/menu_assets/menu_dishes. Hãy dùng DB seed trống hoặc sửa khoảng ID trước khi chạy.';
    END IF;
    IF (SELECT count(*) FROM dishes WHERE id BETWEEN 1 AND 200) <> 200 THEN
        RAISE EXCEPTION 'Thiếu bảng dishes ID 1..200. Hãy chạy file seed 200 món trước.';
    END IF;
END
$gocook$;

-- 1. MENUS (48 bản ghi)
INSERT INTO "menus"
    ("id", "name", "temp_price", "min_guests", "max_guests", "description", "status", "category_id", "seller_id")
SELECT v.id, v.name, v.temp_price, v.min_guests, v.max_guests, v.description,
       'ACTIVE',
       CASE v.group_code
         WHEN 'family' THEN cfg.family_category_id
         WHEN 'office' THEN cfg.office_category_id
         WHEN 'healthy' THEN cfg.healthy_category_id
         WHEN 'traditional' THEN cfg.traditional_category_id
         WHEN 'party' THEN cfg.party_category_id
         WHEN 'vegetarian' THEN cfg.vegetarian_category_id
       END,
       cfg.seller_id
FROM (VALUES
    (1, 'Mâm cơm nhà giản dị', 239000, 2, 3, 'Cơm gia đình. Gồm 4 món: Thịt kho tàu, Canh rau ngót nấu thịt bằm, Rau muống xào tỏi, Trứng chiên hành. Giá tham khảo cho cả menu.', 'family'),
    (2, 'Mâm cơm miền Nam', 319000, 3, 4, 'Cơm gia đình. Gồm 4 món: Cá lóc kho tộ, Canh chua cá lóc, Rau lang xào tỏi, Trứng chiên thịt bằm. Giá tham khảo cho cả menu.', 'family'),
    (3, 'Mâm cơm cá kho tiêu', 279000, 2, 4, 'Cơm gia đình. Gồm 4 món: Cá basa kho tiêu, Canh bầu nấu tôm, Đậu đũa xào tỏi, Đậu hũ sốt cà chua. Giá tham khảo cho cả menu.', 'family'),
    (4, 'Bữa cơm thịt kho trứng', 359000, 3, 5, 'Cơm gia đình. Gồm 4 món: Thịt kho tàu, Canh bí xanh nấu tôm, Cải ngọt xào tỏi, Bắp cải xào trứng. Giá tham khảo cho cả menu.', 'family'),
    (5, 'Mâm cơm sườn rim', 389000, 3, 5, 'Cơm gia đình. Gồm 4 món: Sườn non rim nước dừa, Canh sườn nấu củ cải, Rau muống xào tỏi, Trứng chiên hành. Giá tham khảo cho cả menu.', 'family'),
    (6, 'Mâm cơm gà kho gừng', 369000, 3, 5, 'Cơm gia đình. Gồm 4 món: Gà kho gừng, Canh bí đỏ nấu xương, Su su xào tỏi, Trứng chiên thịt bằm. Giá tham khảo cho cả menu.', 'family'),
    (7, 'Mâm cơm canh cua đồng', 329000, 3, 4, 'Cơm gia đình. Gồm 4 món: Canh cua rau đay, Thịt ba chỉ rang cháy cạnh, Rau củ luộc chấm kho quẹt, Trứng chiên hành. Giá tham khảo cho cả menu.', 'family'),
    (8, 'Bữa cơm tôm rim', 359000, 3, 4, 'Cơm gia đình. Gồm 4 món: Tôm rim thịt ba chỉ, Canh rau dền nấu tôm, Cải thìa xào nấm, Đậu hũ sốt cà chua. Giá tham khảo cho cả menu.', 'family'),
    (9, 'Mâm cơm cá thu sốt cà', 399000, 3, 5, 'Cơm gia đình. Gồm 4 món: Cá thu sốt cà chua, Canh cà chua trứng, Rau muống xào tỏi, Trứng chiên hành. Giá tham khảo cho cả menu.', 'family'),
    (10, 'Mâm cơm cá lóc kho tộ', 389000, 3, 5, 'Cơm gia đình. Gồm 4 món: Cá lóc kho tộ, Canh cải xanh nấu thịt bằm, Đậu đũa xào tỏi, Trứng chiên hành. Giá tham khảo cho cả menu.', 'family'),
    (11, 'Bữa cơm gà rô ti', 469000, 4, 6, 'Cơm gia đình. Gồm 4 món: Gà rô ti, Canh gà nấu nấm, Cải ngọt xào tỏi, Trứng hấp thịt. Giá tham khảo cho cả menu.', 'family'),
    (12, 'Mâm cơm rau củ và đậu', 269000, 2, 4, 'Cơm gia đình. Gồm 4 món: Đậu hũ sốt cà chua, Canh hẹ nấu đậu hũ, Cải thìa xào nấm, Bí đỏ xào tỏi. Giá tham khảo cho cả menu.', 'family'),
    (13, 'Combo cơm sườn nướng', 119000, 1, 2, 'Cơm văn phòng. Gồm 3 món: Cơm sườn nướng, Canh cà chua trứng, Cải ngọt xào tỏi. Giá tham khảo cho cả menu.', 'office'),
    (14, 'Combo cơm gà xối mỡ', 129000, 1, 2, 'Cơm văn phòng. Gồm 3 món: Cơm gà xối mỡ, Canh bí xanh nấu tôm, Rau muống xào tỏi. Giá tham khảo cho cả menu.', 'office'),
    (15, 'Combo cơm bò lúc lắc', 149000, 1, 2, 'Cơm văn phòng. Gồm 3 món: Cơm bò lúc lắc, Canh bí đỏ nấu xương, Su su xào tỏi. Giá tham khảo cho cả menu.', 'office'),
    (16, 'Combo cơm gà rô ti', 139000, 1, 2, 'Cơm văn phòng. Gồm 3 món: Cơm gà rô ti, Canh rong biển nấu thịt bằm, Cải thìa xào nấm. Giá tham khảo cho cả menu.', 'office'),
    (17, 'Combo cơm thịt kho', 119000, 1, 2, 'Cơm văn phòng. Gồm 3 món: Cơm thịt kho trứng, Canh rau ngót nấu thịt bằm, Rau muống xào tỏi. Giá tham khảo cho cả menu.', 'office'),
    (18, 'Combo cơm cá kho', 129000, 1, 2, 'Cơm văn phòng. Gồm 3 món: Cơm cá kho tộ, Canh rau muống nấu tôm, Cải ngọt xào tỏi. Giá tham khảo cho cả menu.', 'office'),
    (19, 'Combo cơm chiên hải sản', 149000, 1, 2, 'Cơm văn phòng. Gồm 3 món: Cơm chiên hải sản, Canh chua nghêu, Đậu hũ sốt cà chua. Giá tham khảo cho cả menu.', 'office'),
    (20, 'Combo cơm chiên dương châu', 129000, 1, 2, 'Cơm văn phòng. Gồm 3 món: Cơm chiên dương châu, Canh cà chua trứng, Rau củ luộc chấm kho quẹt. Giá tham khảo cho cả menu.', 'office'),
    (21, 'Thực đơn rau củ thanh đạm', 249000, 2, 3, 'Ăn lành mạnh. Gồm 4 món: Cơm chay thập cẩm, Canh rong biển nấu thịt bằm, Cải thìa xào nấm, Đậu hũ sốt cà chua. Giá tham khảo cho cả menu.', 'healthy'),
    (22, 'Bữa ăn nhẹ nhàng ít dầu', 279000, 2, 4, 'Ăn lành mạnh. Gồm 4 món: Canh bầu nấu tôm, Rau củ luộc chấm kho quẹt, Trứng hấp thịt, Đậu hũ sốt cà chua. Giá tham khảo cho cả menu.', 'healthy'),
    (23, 'Mâm cơm xanh gia đình', 319000, 3, 4, 'Ăn lành mạnh. Gồm 4 món: Canh rau ngót nấu thịt bằm, Rau muống xào tỏi, Bông cải trắng xào tôm, Đậu hũ chiên sả ớt. Giá tham khảo cho cả menu.', 'healthy'),
    (24, 'Thực đơn nấm và đậu hũ', 289000, 2, 4, 'Ăn lành mạnh. Gồm 4 món: Canh nấm nấu thịt bằm, Nấm rơm xào tỏi, Đậu hũ sốt cà chua, Cà tím nướng mỡ hành. Giá tham khảo cho cả menu.', 'healthy'),
    (25, 'Bữa ăn rau xanh và thịt bò', 339000, 2, 3, 'Ăn lành mạnh. Gồm 4 món: Bông cải xanh xào thịt bò, Canh bí xanh nấu tôm, Rau củ luộc chấm kho quẹt, Trứng chiên hành. Giá tham khảo cho cả menu.', 'healthy'),
    (26, 'Thực đơn hải sản nhẹ nhàng', 429000, 2, 4, 'Ăn lành mạnh. Gồm 4 món: Canh chua tôm, Tôm xào bông cải, Cá diêu hồng chiên giòn, Cải ngọt xào tỏi. Giá tham khảo cho cả menu.', 'healthy'),
    (27, 'Mâm vị Bắc thân quen', 459000, 3, 5, 'Món vùng miền. Gồm 4 món: Bún chả Hà Nội, Bún đậu mắm tôm, Gỏi cuốn tôm thịt, Chả giò. Giá tham khảo cho cả menu.', 'traditional'),
    (28, 'Mâm hương vị xứ Huế', 469000, 3, 5, 'Món vùng miền. Gồm 4 món: Bún bò Huế, Bánh bèo chén, Bánh nậm, Bánh bột lọc. Giá tham khảo cho cả menu.', 'traditional'),
    (29, 'Mâm đặc sản miền Trung', 489000, 3, 5, 'Món vùng miền. Gồm 4 món: Mì Quảng gà, Mì Quảng tôm thịt, Bánh xèo, Gỏi cuốn tôm thịt. Giá tham khảo cho cả menu.', 'traditional'),
    (30, 'Mâm cơm vị miền Tây', 569000, 4, 6, 'Món vùng miền. Gồm 4 món: Bún mắm, Lẩu mắm, Tôm rim thịt ba chỉ, Gỏi cuốn tôm thịt. Giá tham khảo cho cả menu.', 'traditional'),
    (31, 'Bữa ngon Hội An', 479000, 3, 5, 'Món vùng miền. Gồm 4 món: Cơm gà Hội An, Mì Quảng tôm thịt, Bánh cuốn nóng, Gỏi cuốn tôm thịt. Giá tham khảo cho cả menu.', 'traditional'),
    (32, 'Bữa sáng truyền thống Hà Nội', 289000, 2, 4, 'Món vùng miền. Gồm 4 món: Phở bò tái, Bánh cuốn nóng, Bánh giò, Xôi xéo. Giá tham khảo cho cả menu.', 'traditional'),
    (33, 'Bữa sáng kiểu Sài Gòn', 299000, 2, 4, 'Món vùng miền. Gồm 4 món: Cơm tấm sườn nướng, Hủ tiếu Nam Vang, Bánh mì thịt, Xôi gà. Giá tham khảo cho cả menu.', 'traditional'),
    (34, 'Bữa ngon miền biển', 529000, 3, 5, 'Món vùng miền. Gồm 4 món: Bún cá, Bún sứa, Tôm rang muối, Canh chua nghêu. Giá tham khảo cho cả menu.', 'traditional'),
    (35, 'Tiệc gia đình ấm cúng', 899000, 5, 8, 'Tiệc & họp mặt. Gồm 6 món: Sườn xào chua ngọt, Tôm rang muối, Gỏi gà xé phay, Canh gà nấu nấm, Chả giò, Cơm chiên dương châu. Giá tham khảo cho cả menu.', 'party'),
    (36, 'Tiệc sinh nhật thân mật', 1290000, 6, 10, 'Tiệc & họp mặt. Gồm 6 món: Cá diêu hồng chiên giòn, Sườn xào chua ngọt, Chả giò, Mực xào chua ngọt, Canh gà nấu nấm, Cơm chiên dương châu. Giá tham khảo cho cả menu.', 'party'),
    (37, 'Mâm tiệc quê nhà', 989000, 5, 8, 'Tiệc & họp mặt. Gồm 6 món: Thịt kho tàu, Cá lóc kho tộ, Canh cua rau đay, Rau muống xào tỏi, Gỏi cuốn tôm thịt, Chả giò. Giá tham khảo cho cả menu.', 'party'),
    (38, 'Tiệc lẩu cuối tuần', 1190000, 5, 10, 'Tiệc & họp mặt. Gồm 5 món: Lẩu gà lá é, Gỏi cuốn tôm thịt, Chả giò, Tôm rang muối, Rau củ luộc chấm kho quẹt. Giá tham khảo cho cả menu.', 'party'),
    (39, 'Tiệc hải sản sum vầy', 1590000, 6, 10, 'Tiệc & họp mặt. Gồm 6 món: Tôm rang muối, Mực xào chua ngọt, Tôm xào bông cải, Canh chua nghêu, Cá diêu hồng chiên giòn, Cơm chiên hải sản. Giá tham khảo cho cả menu.', 'party'),
    (40, 'Tiệc gặp mặt bạn bè', 1490000, 6, 12, 'Tiệc & họp mặt. Gồm 6 món: Bánh xèo, Nem nướng Nha Trang, Bò lá lốt, Chả giò, Sườn xào chua ngọt, Cơm chiên dương châu. Giá tham khảo cho cả menu.', 'party'),
    (41, 'Tiệc món ngon ba miền', 1890000, 8, 12, 'Tiệc & họp mặt. Gồm 6 món: Bún bò Huế, Bún chả Hà Nội, Mì Quảng gà, Gỏi cuốn tôm thịt, Chả giò, Cá diêu hồng chiên giòn. Giá tham khảo cho cả menu.', 'party'),
    (42, 'Tiệc lẩu mắm miền Tây', 1390000, 6, 10, 'Tiệc & họp mặt. Gồm 5 món: Lẩu mắm, Lẩu cá kèo, Tôm rim thịt ba chỉ, Gỏi cuốn tôm thịt, Rau củ luộc chấm kho quẹt. Giá tham khảo cho cả menu.', 'party'),
    (43, 'Mâm chay thanh đạm', 259000, 2, 4, 'Món chay. Gồm 5 món: Cơm chay thập cẩm, Canh hẹ nấu đậu hũ, Cải thìa xào nấm, Bí đỏ xào tỏi, Đậu hũ sốt cà chua. Giá tham khảo cho cả menu.', 'vegetarian'),
    (44, 'Mâm chay rau củ bốn mùa', 349000, 3, 5, 'Món chay. Gồm 5 món: Cơm chay thập cẩm, Nấm rơm xào tỏi, Nấm đùi gà xào sa tế, Bí đỏ xào tỏi, Đậu hũ chiên sả ớt. Giá tham khảo cho cả menu.', 'vegetarian'),
    (45, 'Bữa chay nấm thơm', 289000, 2, 3, 'Món chay. Gồm 5 món: Cơm chay thập cẩm, Canh hẹ nấu đậu hũ, Nấm rơm xào tỏi, Cải thìa xào nấm, Đậu hũ sốt cà chua. Giá tham khảo cho cả menu.', 'vegetarian'),
    (46, 'Bữa chay đậu hũ', 279000, 2, 4, 'Món chay. Gồm 5 món: Cơm chay thập cẩm, Canh hẹ nấu đậu hũ, Đậu hũ sốt cà chua, Đậu hũ chiên sả ớt, Cải thìa xào nấm. Giá tham khảo cho cả menu.', 'vegetarian'),
    (47, 'Thực đơn chay gia đình', 429000, 4, 6, 'Món chay. Gồm 6 món: Cơm chay thập cẩm, Cải thìa xào nấm, Bí đỏ xào tỏi, Cà tím nướng mỡ hành, Đậu hũ sốt cà chua, Đậu hũ chiên sả ớt. Giá tham khảo cho cả menu.', 'vegetarian'),
    (48, 'Thực đơn chay cuối tuần', 459000, 4, 6, 'Món chay. Gồm 6 món: Cơm chay thập cẩm, Canh hẹ nấu đậu hũ, Nấm rơm xào tỏi, Nấm đùi gà xào sa tế, Cà tím nướng mỡ hành, Đậu đũa xào tỏi. Giá tham khảo cho cả menu.', 'vegetarian')
    ) AS v(id, name, temp_price, min_guests, max_guests, description, group_code)
CROSS JOIN _gocook_menu_seed_cfg AS cfg;

-- 2. MENU_DISHES (206 bản ghi, liên kết dish_id đã có)
INSERT INTO "menu_dishes" ("id", "menu_id", "dish_id") VALUES
    (1, 1, 61), -- Thịt kho tàu
    (2, 1, 33), -- Canh rau ngót nấu thịt bằm
    (3, 1, 91), -- Rau muống xào tỏi
    (4, 1, 113), -- Trứng chiên hành
    (5, 2, 72), -- Cá lóc kho tộ
    (6, 2, 26), -- Canh chua cá lóc
    (7, 2, 92), -- Rau lang xào tỏi
    (8, 2, 114), -- Trứng chiên thịt bằm
    (9, 3, 73), -- Cá basa kho tiêu
    (10, 3, 39), -- Canh bầu nấu tôm
    (11, 3, 99), -- Đậu đũa xào tỏi
    (12, 3, 110), -- Đậu hũ sốt cà chua
    (13, 4, 61), -- Thịt kho tàu
    (14, 4, 38), -- Canh bí xanh nấu tôm
    (15, 4, 94), -- Cải ngọt xào tỏi
    (16, 4, 101), -- Bắp cải xào trứng
    (17, 5, 71), -- Sườn non rim nước dừa
    (18, 5, 44), -- Canh sườn nấu củ cải
    (19, 5, 91), -- Rau muống xào tỏi
    (20, 5, 113), -- Trứng chiên hành
    (21, 6, 86), -- Gà kho gừng
    (22, 6, 37), -- Canh bí đỏ nấu xương
    (23, 6, 97), -- Su su xào tỏi
    (24, 6, 114), -- Trứng chiên thịt bằm
    (25, 7, 36), -- Canh cua rau đay
    (26, 7, 66), -- Thịt ba chỉ rang cháy cạnh
    (27, 7, 124), -- Rau củ luộc chấm kho quẹt
    (28, 7, 113), -- Trứng chiên hành
    (29, 8, 82), -- Tôm rim thịt ba chỉ
    (30, 8, 34), -- Canh rau dền nấu tôm
    (31, 8, 93), -- Cải thìa xào nấm
    (32, 8, 110), -- Đậu hũ sốt cà chua
    (33, 9, 74), -- Cá thu sốt cà chua
    (34, 9, 49), -- Canh cà chua trứng
    (35, 9, 91), -- Rau muống xào tỏi
    (36, 9, 113), -- Trứng chiên hành
    (37, 10, 72), -- Cá lóc kho tộ
    (38, 10, 31), -- Canh cải xanh nấu thịt bằm
    (39, 10, 99), -- Đậu đũa xào tỏi
    (40, 10, 113), -- Trứng chiên hành
    (41, 11, 88), -- Gà rô ti
    (42, 11, 53), -- Canh gà nấu nấm
    (43, 11, 94), -- Cải ngọt xào tỏi
    (44, 11, 115), -- Trứng hấp thịt
    (45, 12, 110), -- Đậu hũ sốt cà chua
    (46, 12, 48), -- Canh hẹ nấu đậu hũ
    (47, 12, 93), -- Cải thìa xào nấm
    (48, 12, 104), -- Bí đỏ xào tỏi
    (49, 13, 11), -- Cơm sườn nướng
    (50, 13, 49), -- Canh cà chua trứng
    (51, 13, 94), -- Cải ngọt xào tỏi
    (52, 14, 3), -- Cơm gà xối mỡ
    (53, 14, 38), -- Canh bí xanh nấu tôm
    (54, 14, 91), -- Rau muống xào tỏi
    (55, 15, 14), -- Cơm bò lúc lắc
    (56, 15, 37), -- Canh bí đỏ nấu xương
    (57, 15, 97), -- Su su xào tỏi
    (58, 16, 15), -- Cơm gà rô ti
    (59, 16, 46), -- Canh rong biển nấu thịt bằm
    (60, 16, 93), -- Cải thìa xào nấm
    (61, 17, 12), -- Cơm thịt kho trứng
    (62, 17, 33), -- Canh rau ngót nấu thịt bằm
    (63, 17, 91), -- Rau muống xào tỏi
    (64, 18, 13), -- Cơm cá kho tộ
    (65, 18, 55), -- Canh rau muống nấu tôm
    (66, 18, 94), -- Cải ngọt xào tỏi
    (67, 19, 7), -- Cơm chiên hải sản
    (68, 19, 29), -- Canh chua nghêu
    (69, 19, 110), -- Đậu hũ sốt cà chua
    (70, 20, 6), -- Cơm chiên dương châu
    (71, 20, 49), -- Canh cà chua trứng
    (72, 20, 124), -- Rau củ luộc chấm kho quẹt
    (73, 21, 25), -- Cơm chay thập cẩm
    (74, 21, 46), -- Canh rong biển nấu thịt bằm
    (75, 21, 93), -- Cải thìa xào nấm
    (76, 21, 110), -- Đậu hũ sốt cà chua
    (77, 22, 39), -- Canh bầu nấu tôm
    (78, 22, 124), -- Rau củ luộc chấm kho quẹt
    (79, 22, 115), -- Trứng hấp thịt
    (80, 22, 110), -- Đậu hũ sốt cà chua
    (81, 23, 33), -- Canh rau ngót nấu thịt bằm
    (82, 23, 91), -- Rau muống xào tỏi
    (83, 23, 96), -- Bông cải trắng xào tôm
    (84, 23, 111), -- Đậu hũ chiên sả ớt
    (85, 24, 47), -- Canh nấm nấu thịt bằm
    (86, 24, 106), -- Nấm rơm xào tỏi
    (87, 24, 110), -- Đậu hũ sốt cà chua
    (88, 24, 108), -- Cà tím nướng mỡ hành
    (89, 25, 95), -- Bông cải xanh xào thịt bò
    (90, 25, 38), -- Canh bí xanh nấu tôm
    (91, 25, 124), -- Rau củ luộc chấm kho quẹt
    (92, 25, 113), -- Trứng chiên hành
    (93, 26, 28), -- Canh chua tôm
    (94, 26, 121), -- Tôm xào bông cải
    (95, 26, 80), -- Cá diêu hồng chiên giòn
    (96, 26, 94), -- Cải ngọt xào tỏi
    (97, 27, 131), -- Bún chả Hà Nội
    (98, 27, 136), -- Bún đậu mắm tôm
    (99, 27, 176), -- Gỏi cuốn tôm thịt
    (100, 27, 177), -- Chả giò
    (101, 28, 129), -- Bún bò Huế
    (102, 28, 166), -- Bánh bèo chén
    (103, 28, 167), -- Bánh nậm
    (104, 28, 168), -- Bánh bột lọc
    (105, 29, 150), -- Mì Quảng gà
    (106, 29, 151), -- Mì Quảng tôm thịt
    (107, 29, 163), -- Bánh xèo
    (108, 29, 176), -- Gỏi cuốn tôm thịt
    (109, 30, 133), -- Bún mắm
    (110, 30, 200), -- Lẩu mắm
    (111, 30, 82), -- Tôm rim thịt ba chỉ
    (112, 30, 176), -- Gỏi cuốn tôm thịt
    (113, 31, 5), -- Cơm gà Hội An
    (114, 31, 151), -- Mì Quảng tôm thịt
    (115, 31, 161), -- Bánh cuốn nóng
    (116, 31, 176), -- Gỏi cuốn tôm thịt
    (117, 32, 126), -- Phở bò tái
    (118, 32, 161), -- Bánh cuốn nóng
    (119, 32, 170), -- Bánh giò
    (120, 32, 191), -- Xôi xéo
    (121, 33, 1), -- Cơm tấm sườn nướng
    (122, 33, 146), -- Hủ tiếu Nam Vang
    (123, 33, 156), -- Bánh mì thịt
    (124, 33, 189), -- Xôi gà
    (125, 34, 134), -- Bún cá
    (126, 34, 144), -- Bún sứa
    (127, 34, 83), -- Tôm rang muối
    (128, 34, 29), -- Canh chua nghêu
    (129, 35, 69), -- Sườn xào chua ngọt
    (130, 35, 83), -- Tôm rang muối
    (131, 35, 180), -- Gỏi gà xé phay
    (132, 35, 53), -- Canh gà nấu nấm
    (133, 35, 177), -- Chả giò
    (134, 35, 6), -- Cơm chiên dương châu
    (135, 36, 80), -- Cá diêu hồng chiên giòn
    (136, 36, 69), -- Sườn xào chua ngọt
    (137, 36, 177), -- Chả giò
    (138, 36, 120), -- Mực xào chua ngọt
    (139, 36, 53), -- Canh gà nấu nấm
    (140, 36, 6), -- Cơm chiên dương châu
    (141, 37, 61), -- Thịt kho tàu
    (142, 37, 72), -- Cá lóc kho tộ
    (143, 37, 36), -- Canh cua rau đay
    (144, 37, 91), -- Rau muống xào tỏi
    (145, 37, 176), -- Gỏi cuốn tôm thịt
    (146, 37, 177), -- Chả giò
    (147, 38, 198), -- Lẩu gà lá é
    (148, 38, 176), -- Gỏi cuốn tôm thịt
    (149, 38, 177), -- Chả giò
    (150, 38, 83), -- Tôm rang muối
    (151, 38, 124), -- Rau củ luộc chấm kho quẹt
    (152, 39, 83), -- Tôm rang muối
    (153, 39, 120), -- Mực xào chua ngọt
    (154, 39, 121), -- Tôm xào bông cải
    (155, 39, 29), -- Canh chua nghêu
    (156, 39, 80), -- Cá diêu hồng chiên giòn
    (157, 39, 7), -- Cơm chiên hải sản
    (158, 40, 163), -- Bánh xèo
    (159, 40, 178), -- Nem nướng Nha Trang
    (160, 40, 179), -- Bò lá lốt
    (161, 40, 177), -- Chả giò
    (162, 40, 69), -- Sườn xào chua ngọt
    (163, 40, 6), -- Cơm chiên dương châu
    (164, 41, 129), -- Bún bò Huế
    (165, 41, 131), -- Bún chả Hà Nội
    (166, 41, 150), -- Mì Quảng gà
    (167, 41, 176), -- Gỏi cuốn tôm thịt
    (168, 41, 177), -- Chả giò
    (169, 41, 80), -- Cá diêu hồng chiên giòn
    (170, 42, 200), -- Lẩu mắm
    (171, 42, 199), -- Lẩu cá kèo
    (172, 42, 82), -- Tôm rim thịt ba chỉ
    (173, 42, 176), -- Gỏi cuốn tôm thịt
    (174, 42, 124), -- Rau củ luộc chấm kho quẹt
    (175, 43, 25), -- Cơm chay thập cẩm
    (176, 43, 48), -- Canh hẹ nấu đậu hũ
    (177, 43, 93), -- Cải thìa xào nấm
    (178, 43, 104), -- Bí đỏ xào tỏi
    (179, 43, 110), -- Đậu hũ sốt cà chua
    (180, 44, 25), -- Cơm chay thập cẩm
    (181, 44, 106), -- Nấm rơm xào tỏi
    (182, 44, 107), -- Nấm đùi gà xào sa tế
    (183, 44, 104), -- Bí đỏ xào tỏi
    (184, 44, 111), -- Đậu hũ chiên sả ớt
    (185, 45, 25), -- Cơm chay thập cẩm
    (186, 45, 48), -- Canh hẹ nấu đậu hũ
    (187, 45, 106), -- Nấm rơm xào tỏi
    (188, 45, 93), -- Cải thìa xào nấm
    (189, 45, 110), -- Đậu hũ sốt cà chua
    (190, 46, 25), -- Cơm chay thập cẩm
    (191, 46, 48), -- Canh hẹ nấu đậu hũ
    (192, 46, 110), -- Đậu hũ sốt cà chua
    (193, 46, 111), -- Đậu hũ chiên sả ớt
    (194, 46, 93), -- Cải thìa xào nấm
    (195, 47, 25), -- Cơm chay thập cẩm
    (196, 47, 93), -- Cải thìa xào nấm
    (197, 47, 104), -- Bí đỏ xào tỏi
    (198, 47, 108), -- Cà tím nướng mỡ hành
    (199, 47, 110), -- Đậu hũ sốt cà chua
    (200, 47, 111), -- Đậu hũ chiên sả ớt
    (201, 48, 25), -- Cơm chay thập cẩm
    (202, 48, 48), -- Canh hẹ nấu đậu hũ
    (203, 48, 106), -- Nấm rơm xào tỏi
    (204, 48, 107), -- Nấm đùi gà xào sa tế
    (205, 48, 108), -- Cà tím nướng mỡ hành
    (206, 48, 99); -- Đậu đũa xào tỏi

-- 3. MENU_ASSETS (96 bản ghi: 2 ảnh minh họa/menu)
INSERT INTO "menu_assets" ("id", "url", "menu_id") VALUES
    (1, '/images/menus/menu-001-cover.svg', 1),
    (2, '/images/menus/menu-001-detail.svg', 1),
    (3, '/images/menus/menu-002-cover.svg', 2),
    (4, '/images/menus/menu-002-detail.svg', 2),
    (5, '/images/menus/menu-003-cover.svg', 3),
    (6, '/images/menus/menu-003-detail.svg', 3),
    (7, '/images/menus/menu-004-cover.svg', 4),
    (8, '/images/menus/menu-004-detail.svg', 4),
    (9, '/images/menus/menu-005-cover.svg', 5),
    (10, '/images/menus/menu-005-detail.svg', 5),
    (11, '/images/menus/menu-006-cover.svg', 6),
    (12, '/images/menus/menu-006-detail.svg', 6),
    (13, '/images/menus/menu-007-cover.svg', 7),
    (14, '/images/menus/menu-007-detail.svg', 7),
    (15, '/images/menus/menu-008-cover.svg', 8),
    (16, '/images/menus/menu-008-detail.svg', 8),
    (17, '/images/menus/menu-009-cover.svg', 9),
    (18, '/images/menus/menu-009-detail.svg', 9),
    (19, '/images/menus/menu-010-cover.svg', 10),
    (20, '/images/menus/menu-010-detail.svg', 10),
    (21, '/images/menus/menu-011-cover.svg', 11),
    (22, '/images/menus/menu-011-detail.svg', 11),
    (23, '/images/menus/menu-012-cover.svg', 12),
    (24, '/images/menus/menu-012-detail.svg', 12),
    (25, '/images/menus/menu-013-cover.svg', 13),
    (26, '/images/menus/menu-013-detail.svg', 13),
    (27, '/images/menus/menu-014-cover.svg', 14),
    (28, '/images/menus/menu-014-detail.svg', 14),
    (29, '/images/menus/menu-015-cover.svg', 15),
    (30, '/images/menus/menu-015-detail.svg', 15),
    (31, '/images/menus/menu-016-cover.svg', 16),
    (32, '/images/menus/menu-016-detail.svg', 16),
    (33, '/images/menus/menu-017-cover.svg', 17),
    (34, '/images/menus/menu-017-detail.svg', 17),
    (35, '/images/menus/menu-018-cover.svg', 18),
    (36, '/images/menus/menu-018-detail.svg', 18),
    (37, '/images/menus/menu-019-cover.svg', 19),
    (38, '/images/menus/menu-019-detail.svg', 19),
    (39, '/images/menus/menu-020-cover.svg', 20),
    (40, '/images/menus/menu-020-detail.svg', 20),
    (41, '/images/menus/menu-021-cover.svg', 21),
    (42, '/images/menus/menu-021-detail.svg', 21),
    (43, '/images/menus/menu-022-cover.svg', 22),
    (44, '/images/menus/menu-022-detail.svg', 22),
    (45, '/images/menus/menu-023-cover.svg', 23),
    (46, '/images/menus/menu-023-detail.svg', 23),
    (47, '/images/menus/menu-024-cover.svg', 24),
    (48, '/images/menus/menu-024-detail.svg', 24),
    (49, '/images/menus/menu-025-cover.svg', 25),
    (50, '/images/menus/menu-025-detail.svg', 25),
    (51, '/images/menus/menu-026-cover.svg', 26),
    (52, '/images/menus/menu-026-detail.svg', 26),
    (53, '/images/menus/menu-027-cover.svg', 27),
    (54, '/images/menus/menu-027-detail.svg', 27),
    (55, '/images/menus/menu-028-cover.svg', 28),
    (56, '/images/menus/menu-028-detail.svg', 28),
    (57, '/images/menus/menu-029-cover.svg', 29),
    (58, '/images/menus/menu-029-detail.svg', 29),
    (59, '/images/menus/menu-030-cover.svg', 30),
    (60, '/images/menus/menu-030-detail.svg', 30),
    (61, '/images/menus/menu-031-cover.svg', 31),
    (62, '/images/menus/menu-031-detail.svg', 31),
    (63, '/images/menus/menu-032-cover.svg', 32),
    (64, '/images/menus/menu-032-detail.svg', 32),
    (65, '/images/menus/menu-033-cover.svg', 33),
    (66, '/images/menus/menu-033-detail.svg', 33),
    (67, '/images/menus/menu-034-cover.svg', 34),
    (68, '/images/menus/menu-034-detail.svg', 34),
    (69, '/images/menus/menu-035-cover.svg', 35),
    (70, '/images/menus/menu-035-detail.svg', 35),
    (71, '/images/menus/menu-036-cover.svg', 36),
    (72, '/images/menus/menu-036-detail.svg', 36),
    (73, '/images/menus/menu-037-cover.svg', 37),
    (74, '/images/menus/menu-037-detail.svg', 37),
    (75, '/images/menus/menu-038-cover.svg', 38),
    (76, '/images/menus/menu-038-detail.svg', 38),
    (77, '/images/menus/menu-039-cover.svg', 39),
    (78, '/images/menus/menu-039-detail.svg', 39),
    (79, '/images/menus/menu-040-cover.svg', 40),
    (80, '/images/menus/menu-040-detail.svg', 40),
    (81, '/images/menus/menu-041-cover.svg', 41),
    (82, '/images/menus/menu-041-detail.svg', 41),
    (83, '/images/menus/menu-042-cover.svg', 42),
    (84, '/images/menus/menu-042-detail.svg', 42),
    (85, '/images/menus/menu-043-cover.svg', 43),
    (86, '/images/menus/menu-043-detail.svg', 43),
    (87, '/images/menus/menu-044-cover.svg', 44),
    (88, '/images/menus/menu-044-detail.svg', 44),
    (89, '/images/menus/menu-045-cover.svg', 45),
    (90, '/images/menus/menu-045-detail.svg', 45),
    (91, '/images/menus/menu-046-cover.svg', 46),
    (92, '/images/menus/menu-046-detail.svg', 46),
    (93, '/images/menus/menu-047-cover.svg', 47),
    (94, '/images/menus/menu-047-detail.svg', 47),
    (95, '/images/menus/menu-048-cover.svg', 48),
    (96, '/images/menus/menu-048-detail.svg', 48);

-- 4. Đồng bộ bộ đếm BIGSERIAL cho những lần INSERT tiếp theo không chỉ định ID.
SELECT setval(pg_get_serial_sequence('menus', 'id'), (SELECT MAX(id) FROM menus), true);
SELECT setval(pg_get_serial_sequence('menu_assets', 'id'), (SELECT MAX(id) FROM menu_assets), true);
SELECT setval(pg_get_serial_sequence('menu_dishes', 'id'), (SELECT MAX(id) FROM menu_dishes), true);

COMMIT;

-- Sau khi chạy, kiểm tra:
-- SELECT COUNT(*) FROM menus WHERE id BETWEEN 1 AND 48;
-- SELECT COUNT(*) FROM menu_dishes WHERE menu_id BETWEEN 1 AND 48;
-- SELECT COUNT(*) FROM menu_assets WHERE menu_id BETWEEN 1 AND 48;
-- SELECT m.id,m.name,m.temp_price,m.min_guests,m.max_guests,
--        (SELECT ma.url FROM menu_assets ma WHERE ma.menu_id=m.id AND ma.is_active ORDER BY ma.id LIMIT 1) AS cover_url
--   FROM menus m WHERE m.is_active ORDER BY m.id;
