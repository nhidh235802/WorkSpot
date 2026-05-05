-- =========================================================
-- FILE KHỞI TẠO CƠ SỞ DỮ LIỆU - DỰ ÁN WORKSPOT
-- HỆ QUẢN TRỊ: PostgreSQL
-- =========================================================

-- 1. KÍCH HOẠT EXTENSION BẢN ĐỒ
-- Bắt buộc chạy lệnh này để sử dụng tính năng tìm kiếm bán kính (P_ID: 7)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. TẠO CÁC KIỂU DỮ LIỆU RÀNG BUỘC (ENUM)
CREATE TYPE user_role AS ENUM ('remote_worker', 'owner', 'admin');
CREATE TYPE cafe_status AS ENUM ('pending', 'approved', 'rejected');

-- 3. KHỞI TẠO CÁC BẢNG (TABLES) THỨ TỰ CHUẨN

-- Bảng Người dùng
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Quán Cafe
CREATE TABLE cafes (
    id SERIAL PRIMARY KEY,
    owner_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    business_hours VARCHAR(255) NOT NULL,
    
    -- Trạng thái và phê duyệt (P_ID: 6)
    status cafe_status DEFAULT 'pending',
    rejection_reason VARCHAR(500), 
    
    -- Tọa độ bản đồ (P_ID: 7, 8)
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location GEOMETRY(Point, 4326), 
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Hình ảnh quán (Ràng buộc 1-5 ảnh xử lý ở backend)
CREATE TABLE cafe_images (
    id SERIAL PRIMARY KEY,
    cafe_id INT NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Tiện ích (Lưu 8 bộ lọc lõi)
CREATE TABLE facilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Bảng Trung gian: Quán Cafe - Tiện ích
CREATE TABLE cafe_facilities (
    cafe_id INT NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    facility_id INT NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    PRIMARY KEY (cafe_id, facility_id)
);

-- Bảng Đánh giá & Chấm điểm
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    cafe_id INT NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- 4. CHÈN DỮ LIỆU MẪU (SEED DATA) ĐỂ BẮT ĐẦU TEST
-- =========================================================

-- Thêm tự động 8 tiêu chí cốt lõi (P_ID: 7)
INSERT INTO facilities (name) VALUES 
('Wi-Fi mạnh'), 
('Nhiều ổ cắm'), 
('Không gian yên tĩnh'), 
('Ghế làm việc thoải mái'), 
('Phòng họp / Buồng điện thoại'), 
('Cho phép ngồi lâu'), 
('Điều hòa mát mẻ'), 
('Có chỗ để xe');

-- Thêm một tài khoản Admin mặc định
INSERT INTO users (full_name, email, password_hash, role) 
VALUES ('Quản trị viên WorkSpot', 'admin@workspot.com', 'hashed_password_here', 'admin');