-- ============================================================
-- datasample.sql  —  Dữ liệu mẫu để test WorkSpot API
-- ============================================================
-- Chạy file này SAU KHI đã chạy migration (npm run migration:run)
-- Lệnh: psql -U <username> -d <database> -f datasample.sql
--
-- Tài khoản mẫu:
--   admin@workspot.vn      / admin123
--   owner1@workspot.vn     / password123
--   owner2@workspot.vn     / password123
--   customer1@workspot.vn  / 123456
--   customer2@workspot.vn  / 123456
--   customer3@workspot.vn  / 123456
-- ============================================================

-- Xóa dữ liệu cũ (theo thứ tự FK)
TRUNCATE TABLE reviews         RESTART IDENTITY CASCADE;
TRUNCATE TABLE operating_hours RESTART IDENTITY CASCADE;
TRUNCATE TABLE cafes           RESTART IDENTITY CASCADE;
TRUNCATE TABLE users           RESTART IDENTITY CASCADE;

-- ============================================================
-- 1. USERS
-- ============================================================

INSERT INTO users (id, "fullName", email, phone, password, avatar, address, bio, role, "createdAt", "updatedAt")
VALUES

-- Admin
(
  'a0000000-0000-0000-0000-000000000001',
  'Quản Trị Viên',
  'admin@workspot.vn',
  '0900000001',
  '$2b$10$Q70GHmriNJG4KU5QtzfphearXIk9V1iGnrbftR5SUBjuqsc3s/d1W',  -- admin123
  NULL,
  'Hà Nội',
  'Tài khoản quản trị hệ thống WorkSpot.',
  'admin',
  NOW(), NOW()
),

-- Owner 1
(
  'a0000000-0000-0000-0000-000000000002',
  'Nguyễn Minh Tuấn',
  'owner1@workspot.vn',
  '0911000001',
  '$2b$10$wl9qtcqoOUn2w.ZAO00C.epaKM4/hX34nQjKlgrp6IydRWzO2tzPS',  -- password123
  NULL,
  '12 Lê Lợi, Quận 1, TP.HCM',
  'Chủ sở hữu chuỗi cafe WorkSpace HCM.',
  'owner',
  NOW(), NOW()
),

-- Owner 2
(
  'a0000000-0000-0000-0000-000000000003',
  'Trần Thị Hoa',
  'owner2@workspot.vn',
  '0922000002',
  '$2b$10$wl9qtcqoOUn2w.ZAO00C.epaKM4/hX34nQjKlgrp6IydRWzO2tzPS',  -- password123
  NULL,
  '45 Hoàn Kiếm, Hà Nội',
  'Chủ cafe The Study Corner.',
  'owner',
  NOW(), NOW()
),

-- Customer 1
(
  'a0000000-0000-0000-0000-000000000004',
  'Phạm Văn An',
  'customer1@workspot.vn',
  '0933000001',
  '$2b$10$8jeza8Cb8ZN5tRLD0UxwguDaAXlXjGqPlpqZ3hRBvcstTvy5OJzH6',  -- 123456
  NULL,
  '78 Nguyễn Huệ, Quận 1, TP.HCM',
  'Freelancer yêu thích làm việc tại cafe.',
  'customer',
  NOW(), NOW()
),

-- Customer 2
(
  'a0000000-0000-0000-0000-000000000005',
  'Lê Thị Bình',
  'customer2@workspot.vn',
  '0944000002',
  '$2b$10$8jeza8Cb8ZN5tRLD0UxwguDaAXlXjGqPlpqZ3hRBvcstTvy5OJzH6',  -- 123456
  NULL,
  '23 Hai Bà Trưng, Hà Nội',
  'Sinh viên đại học, thích không gian yên tĩnh để học.',
  'customer',
  NOW(), NOW()
),

-- Customer 3
(
  'a0000000-0000-0000-0000-000000000006',
  'Hoàng Đức Mạnh',
  'customer3@workspot.vn',
  '0955000003',
  '$2b$10$8jeza8Cb8ZN5tRLD0UxwguDaAXlXjGqPlpqZ3hRBvcstTvy5OJzH6',  -- 123456
  NULL,
  '56 Lý Tự Trọng, Quận 1, TP.HCM',
  'Kỹ sư phần mềm làm remote.',
  'customer',
  NOW(), NOW()
);

-- ============================================================
-- 2. CAFES
-- ============================================================

INSERT INTO cafes (id, name, description, address, latitude, longitude, avatar, images, facilities, "isClosedOnHolidays", status, "createdAt", "updatedAt", owner_id)
VALUES

-- Cafe 1 (owner1) — đã được duyệt
(
  'c0000000-0000-0000-0000-000000000001',
  'WorkSpace Cafe Quận 1',
  'Không gian làm việc hiện đại, yên tĩnh ngay trung tâm Quận 1. Wifi tốc độ cao, nhiều ổ cắm điện, đồ uống ngon.',
  '12 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM',
  10.7769,
  106.7009,
  'https://example.com/cafes/workspace-q1-avatar.jpg',
  ARRAY[
    'https://example.com/cafes/workspace-q1-1.jpg',
    'https://example.com/cafes/workspace-q1-2.jpg'
  ]::text[],
  ARRAY['wifi','socket','workspace','desk','snack']::"public"."cafes_facilities_enum"[],
  false,
  'approved',
  NOW(), NOW(),
  'a0000000-0000-0000-0000-000000000002'
),

-- Cafe 2 (owner1) — đang chờ duyệt
(
  'c0000000-0000-0000-0000-000000000002',
  'Cà Phê Sách Sài Gòn',
  'Cafe kết hợp thư viện sách, không gian chill và làm việc nhẹ nhàng. Có khu hút thuốc riêng ngoài trời.',
  '88 Đinh Tiên Hoàng, Phường 3, Bình Thạnh, TP.HCM',
  10.8027,
  106.7146,
  'https://example.com/cafes/book-cafe-avatar.jpg',
  ARRAY[
    'https://example.com/cafes/book-cafe-1.jpg'
  ]::text[],
  ARRAY['wifi','desk','snack','smoking_rule']::"public"."cafes_facilities_enum"[],
  true,
  'pending',
  NOW(), NOW(),
  'a0000000-0000-0000-0000-000000000002'
),

-- Cafe 3 (owner2) — đã được duyệt
(
  'c0000000-0000-0000-0000-000000000003',
  'The Study Corner Hà Nội',
  'Góc học bài lý tưởng cho sinh viên và dân văn phòng tại Hà Nội. Không gian sạch sẽ, điều hòa mát mẻ.',
  '45 Hàng Bài, Hoàn Kiếm, Hà Nội',
  21.0285,
  105.8542,
  'https://example.com/cafes/study-corner-avatar.jpg',
  ARRAY[
    'https://example.com/cafes/study-corner-1.jpg',
    'https://example.com/cafes/study-corner-2.jpg',
    'https://example.com/cafes/study-corner-3.jpg'
  ]::text[],
  ARRAY['wifi','socket','workspace','desk','cleanliness']::"public"."cafes_facilities_enum"[],
  false,
  'approved',
  NOW(), NOW(),
  'a0000000-0000-0000-0000-000000000003'
);

-- ============================================================
-- 3. OPERATING HOURS
-- ============================================================

-- Cafe 1: mở T2–T6 07:00–22:00, T7–CN 08:00–23:00
INSERT INTO operating_hours (id, "dayOfWeek", "openTime", "closeTime", "isDayOff", cafe_id)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'monday',    '07:00', '22:00', false, 'c0000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000002', 'tuesday',   '07:00', '22:00', false, 'c0000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000003', 'wednesday', '07:00', '22:00', false, 'c0000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000004', 'thursday',  '07:00', '22:00', false, 'c0000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000005', 'friday',    '07:00', '22:00', false, 'c0000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000006', 'saturday',  '08:00', '23:00', false, 'c0000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000007', 'sunday',    '08:00', '23:00', false, 'c0000000-0000-0000-0000-000000000001');

-- Cafe 2: mở T2–T7 08:00–21:00, nghỉ CN
INSERT INTO operating_hours (id, "dayOfWeek", "openTime", "closeTime", "isDayOff", cafe_id)
VALUES
  ('b2000000-0000-0000-0000-000000000001', 'monday',    '08:00', '21:00', false, 'c0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000002', 'tuesday',   '08:00', '21:00', false, 'c0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000003', 'wednesday', '08:00', '21:00', false, 'c0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000004', 'thursday',  '08:00', '21:00', false, 'c0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000005', 'friday',    '08:00', '21:00', false, 'c0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000006', 'saturday',  '09:00', '21:00', false, 'c0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000007', 'sunday',    NULL,    NULL,    true,  'c0000000-0000-0000-0000-000000000002');

-- Cafe 3: mở cả tuần 06:30–21:30
INSERT INTO operating_hours (id, "dayOfWeek", "openTime", "closeTime", "isDayOff", cafe_id)
VALUES
  ('b3000000-0000-0000-0000-000000000001', 'monday',    '06:30', '21:30', false, 'c0000000-0000-0000-0000-000000000003'),
  ('b3000000-0000-0000-0000-000000000002', 'tuesday',   '06:30', '21:30', false, 'c0000000-0000-0000-0000-000000000003'),
  ('b3000000-0000-0000-0000-000000000003', 'wednesday', '06:30', '21:30', false, 'c0000000-0000-0000-0000-000000000003'),
  ('b3000000-0000-0000-0000-000000000004', 'thursday',  '06:30', '21:30', false, 'c0000000-0000-0000-0000-000000000003'),
  ('b3000000-0000-0000-0000-000000000005', 'friday',    '06:30', '21:30', false, 'c0000000-0000-0000-0000-000000000003'),
  ('b3000000-0000-0000-0000-000000000006', 'saturday',  '07:00', '22:00', false, 'c0000000-0000-0000-0000-000000000003'),
  ('b3000000-0000-0000-0000-000000000007', 'sunday',    '07:00', '22:00', false, 'c0000000-0000-0000-0000-000000000003');

-- ============================================================
-- 4. REVIEWS
-- ============================================================

INSERT INTO reviews (id, rating, comment, images, "createdAt", user_id, cafe_id)
VALUES

-- Customer 1 → Cafe 1
(
  'r0000000-0000-0000-0000-000000000001',
  5,
  'Wifi siêu nhanh, ổ cắm đầy đủ, nhạc nhẹ nhàng. Đây là địa điểm yêu thích của mình để làm việc!',
  ARRAY[]::text[],
  NOW(),
  'a0000000-0000-0000-0000-000000000004',
  'c0000000-0000-0000-0000-000000000001'
),

-- Customer 2 → Cafe 1
(
  'r0000000-0000-0000-0000-000000000002',
  4,
  'Không gian đẹp, thức uống ngon. Hơi đông vào buổi trưa nhưng buổi sáng rất yên tĩnh.',
  ARRAY['https://example.com/reviews/r2-1.jpg']::text[],
  NOW(),
  'a0000000-0000-0000-0000-000000000005',
  'c0000000-0000-0000-0000-000000000001'
),

-- Customer 1 → Cafe 2
(
  'r0000000-0000-0000-0000-000000000003',
  4,
  'Nhiều sách hay để đọc, không khí thoải mái. Cà phê hơi đắt nhưng chất lượng tốt.',
  ARRAY[]::text[],
  NOW(),
  'a0000000-0000-0000-0000-000000000004',
  'c0000000-0000-0000-0000-000000000002'
),

-- Customer 3 → Cafe 3
(
  'r0000000-0000-0000-0000-000000000004',
  5,
  'The Study Corner là lựa chọn tốt nhất ở Hà Nội để học bài. Rất sạch, điều hòa mát, không ồn.',
  ARRAY['https://example.com/reviews/r4-1.jpg', 'https://example.com/reviews/r4-2.jpg']::text[],
  NOW(),
  'a0000000-0000-0000-0000-000000000006',
  'c0000000-0000-0000-0000-000000000003'
),

-- Customer 2 → Cafe 3
(
  'r0000000-0000-0000-0000-000000000005',
  3,
  'Không gian ổn, nhưng ghế hơi cứng ngồi lâu mỏi lưng. Wifi đôi khi bị chập chờn.',
  ARRAY[]::text[],
  NOW(),
  'a0000000-0000-0000-0000-000000000005',
  'c0000000-0000-0000-0000-000000000003'
);
