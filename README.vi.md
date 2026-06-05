# WorkSpot

**Nền tảng tìm kiếm không gian làm việc dành cho người Nhật tại Hà Nội.**

🌐 **Live Demo:** [work-spot-alpha.vercel.app](https://work-spot-alpha.vercel.app) &nbsp;|&nbsp; 🇬🇧 [English](./README.md) &nbsp;|&nbsp; 🇯🇵 [日本語](./README.ja.md)

---

## Tổng quan

WorkSpot giúp người Nhật Bản đang sinh sống tại Hà Nội dễ dàng tìm kiếm các quán cà phê phù hợp với nhu cầu làm việc và học tập. Hệ thống hỗ trợ 3 vai trò:

- **Khách hàng** — Tìm kiếm quán, xem chi tiết, viết đánh giá
- **Chủ quán** — Đăng ký và quản lý thông tin quán
- **Admin** — Duyệt quán, quản lý tài khoản, xem thống kê

---

## Tính năng

### Khách hàng
- Tìm kiếm quán theo từ khóa, bán kính khoảng cách (GPS), bộ lọc tiện ích (WiFi, ổ cắm, bàn làm việc, đồ ăn nhẹ…)
- Xem quán gợi ý được chấm điểm dựa trên khoảng cách + điểm đánh giá trung bình
- Xem chi tiết quán: mô tả, thư viện ảnh, giờ hoạt động, bản đồ, đánh giá
- Viết và xóa đánh giá (sao + bình luận + ảnh đính kèm)
- Đăng ký / Đăng nhập bằng email và mật khẩu
- Quên mật khẩu qua email (link đặt lại có hiệu lực 15 phút)
- Quản lý hồ sơ: cập nhật thông tin, đổi mật khẩu, thay ảnh đại diện

### Chủ quán
- Đăng ký quán mới với địa chỉ, mô tả, tiện ích, giờ hoạt động và ảnh (tối đa 5 ảnh)
- Chỉnh sửa thông tin quán — thay đổi chờ Admin duyệt trước khi hiển thị công khai
- Cập nhật trạng thái thời gian thực: Còn chỗ / Bình thường / Đang đông
- Xem trạng thái phê duyệt: Đang chờ / Đã duyệt / Bị từ chối / Đang ẩn
- Xem lý do bị từ chối và gửi lại yêu cầu

### Admin
- Bảng điều khiển: tổng tài khoản, tổng quán, số quán chờ duyệt, biểu đồ tăng trưởng theo tháng
- Xem và phê duyệt hoặc từ chối yêu cầu đăng ký quán (kèm lý do)
- Quản lý quán: tìm kiếm, lọc theo trạng thái, ẩn/hiện, xóa quán
- Quản lý tài khoản: tìm kiếm, lọc theo vai trò & trạng thái, vô hiệu hóa/khóa tài khoản, tự động ẩn quán của Owner bị xử lý

---

## Tech Stack

**Frontend**

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Ngôn ngữ | TypeScript |
| Styling | Tailwind CSS 4 |
| Form | React Hook Form + Zod |
| Bản đồ | React Leaflet (OpenStreetMap + Nominatim geocoding) |
| HTTP | Axios |
| UI | Lucide React, Sonner (toast) |

**Backend**

| | |
|---|---|
| Framework | NestJS 11 |
| Ngôn ngữ | TypeScript |
| ORM | TypeORM 0.3 |
| Cơ sở dữ liệu | PostgreSQL (Supabase hosted) |
| Lưu trữ ảnh | Supabase Storage (cafe-images, review-images, avatars) |
| Xác thực | JWT + Passport + Bcrypt |
| Email | Nodemailer (Gmail SMTP) |
| Upload | Multer (memory storage) |
| Validation | class-validator + class-transformer |

---

## Cài đặt

**Yêu cầu:** Node.js v18+, npm v9+, tài khoản Supabase

```bash
# 1. Clone dự án
git clone https://github.com/nhidh235802/WorkSpot.git
cd WorkSpot

# 2. Cài đặt dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Cấu hình biến môi trường (xem phần bên dưới)

# 4. Chạy migrations (tạo bảng + seed dữ liệu mẫu)
cd backend && npm run m:run

# 5. Khởi động server
# Terminal 1 — Backend (port 3001)
cd backend && npm run start:dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

**Tài khoản demo (sau khi seed)**

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@workspot.com` | `Admin@123` |
| Chủ quán | `owner01@workspot.com` | `Owner@123` |
| Khách hàng | `customer01@workspot.com` | `Customer@123` |

**Lệnh quản lý migration**

| Lệnh | Mô tả |
|---|---|
| `npm run m:run` | Áp dụng tất cả migration chưa chạy |
| `npm run m:revert` | Hoàn tác migration cuối cùng |
| `npm run m:drop` | Xóa toàn bộ schema ⚠️ |
| `npm run m:gen` | Tạo migration từ thay đổi entity |

---

## Biến môi trường

**`backend/.env`**

```env
# Database — Supabase Transaction Pooler (port 6543)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase Storage (dùng service_role key)
SUPABASE_URL=https://[ref].supabase.co
SUPABASE_KEY=[service_role_key]

# JWT
JWT_SECRET=your_jwt_secret

# Gmail SMTP (dùng App Password)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password

# URL Frontend (dùng trong email đặt lại mật khẩu)
FRONTEND_URL=https://work-spot-alpha.vercel.app
```

**`frontend/.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> **Supabase Storage:** Tạo 3 bucket **Public**: `cafe-images`, `review-images`, `avatars`.

---

## Cấu trúc thư mục

```
WorkSpot/
├── backend/
│   └── src/
│       ├── admin/        # Thống kê dashboard, quản lý user & quán
│       ├── auth/         # Đăng ký, đăng nhập, JWT, reset mật khẩu
│       ├── cafes/        # CRUD quán, tìm kiếm, đánh giá
│       ├── mail/         # Gửi email thông báo (Gmail SMTP)
│       ├── migrations/   # TypeORM migrations + seed dữ liệu mẫu
│       ├── supabase/     # Wrapper Supabase Storage (upload / xóa ảnh)
│       └── users/        # Quản lý hồ sơ người dùng
│
└── frontend/
    └── app/
        ├── (auth)/       # Đăng nhập, đăng ký, quên/đặt lại mật khẩu
        ├── (main)/       # Trang khách hàng (trang chủ, tìm kiếm, chi tiết quán)
        ├── (owner)/      # Trang chủ quán (dashboard, tạo/sửa quán)
        └── admin/        # Trang admin (dashboard, duyệt quán, quản lý)
```

---

## Triển khai

| Thành phần | Nền tảng | Ghi chú |
|---|---|---|
| Frontend | **Vercel** | Tự động deploy từ nhánh `main` |
| Backend | **Render / Railway** | Cấu hình biến môi trường trên platform |
| Cơ sở dữ liệu | **Supabase** | PostgreSQL, Transaction Pooler (port 6543) |
| Lưu trữ ảnh | **Supabase Storage** | 3 bucket public |

Khi deploy frontend trên Vercel, thêm biến môi trường `NEXT_PUBLIC_API_URL` trỏ đến URL backend đã deploy.
