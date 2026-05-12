# WorkSpot

**Hệ thống tìm kiếm không gian làm việc cho người Nhật tại Hà Nội.**

Dự án WorkSpot cung cấp nền tảng giúp người Nhật Bản dễ dàng tìm kiếm và lựa chọn các không gian làm việc (quán cafe, coworking space,...) phù hợp tại khu vực Hà Nội.

## 🚀 Tech Stack

- **Frontend:** Next.js, Tailwind CSS
- **Backend:** NestJS, TypeORM
- **Database:** PostgreSQL

## 📋 Yêu cầu phần mềm (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các phần mềm sau:

- **Node.js:** v18.x trở lên (LTS)
- **PostgreSQL:** v14.x trở lên
- **Git:** Phiên bản mới nhất
- **VS Code Extensions (Khuyên dùng):**
  - ESLint, Prettier (Format và check code)
  - Tailwind CSS IntelliSense (Hỗ trợ class CSS)
  - TypeORM (Hỗ trợ làm việc với database)

## 🛠 Hướng dẫn cài đặt (Getting Started)

### 1. Clone dự án

Mở Terminal và chạy lệnh sau để tải source code về máy:

```bash
git clone https://github.com/nhidh235802/WorkSpot.git
cd WorkSpot
```

### 2. Cài đặt thư viện (Dependencies)

Bạn cần cài đặt các gói thư viện cho cả Backend và Frontend. Khuyến nghị mở 2 tab Terminal:

**Tab 1 - Backend:**
```bash
cd backend
npm install
```

**Tab 2 - Frontend:**
```bash
cd frontend
npm install
```

## 🗄 Cấu hình Database & Biến môi trường

1. Mở **pgAdmin** hoặc công cụ quản lý PostgreSQL của bạn.
2. Tạo một Database trống với tên: `workspot_db` *(Không cần tạo bảng hay chạy file SQL)*.
3. Chạy câu lệnh Query sau để cài đặt extension tạo UUID (giúp tăng cường bảo mật):
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```
4. Di chuyển vào thư mục `backend`, copy file `dev.env.example` và đổi tên thành `.env` (đặt cùng cấp với thư mục `src`).
5. Mở file `.env` và cập nhật `DB_USERNAME` cùng `DB_PASSWORD` cho khớp với tài khoản PostgreSQL trên máy của bạn.

## 🔄 Đồng bộ cấu trúc Database (Migration)

Hệ thống sử dụng TypeORM để tự động tạo bảng. Trong Terminal, chuyển vào thư mục `backend` và chạy:

```bash
cd backend
npm run m:run
```

## 🚀 Khởi động Server

Để chạy dự án, bạn cần khởi động cả 2 server chạy song song.

**1. Khởi động Backend (NestJS):**
```bash
cd backend
npm run start:dev
```
*(Chờ đến khi Terminal hiển thị: "Application is running")*

**2. Khởi động Frontend (Next.js):**
```bash
cd frontend
npm run dev
```
*(Mở trình duyệt và truy cập [http://localhost:3000](http://localhost:3000) để xem giao diện)*

## ⚠️ LƯU Ý QUAN TRỌNG KHI PULL CODE

Ngay sau khi pull code mới nhất từ repository về (`git pull`), **BẮT BUỘC** thực hiện 2 bước sau trước khi tiếp tục code:

1. **Cập nhật thư viện:**
   Mở Terminal ở cả thư mục `frontend` và `backend`, chạy lại lệnh:
   ```bash
   npm install
   ```
   *(Để đảm bảo cập nhật các package mới nếu có người khác vừa thêm vào).*

2. **Đồng bộ lại Database:**
   Tại thư mục `backend`, chạy lần lượt:
   ```bash
   npm run m:drop  # Xóa database hiện tại
   npm run m:run   # Tạo lại và chạy các migration mới nhất
   ```
   *(Thao tác này giúp cấu trúc database trên máy bạn khớp hoàn toàn với bản mới nhất trên git).*

## 🌿 Quy trình làm việc với Git & Tiêu chuẩn Code

### Git Workflow
- **Nhánh `main`:** Chỉ chứa code đã chạy ổn định và hoàn thiện.
- **Nhánh tính năng (Feature branch):** Luôn tạo nhánh mới từ `main` khi bắt đầu code một tính năng.
  ```bash
  git checkout -b feature/ten-tinh-nang
  ```
  *(Lưu ý: Nếu không quen dùng branch, bạn có thể push thẳng lên `main` NHƯNG phải test thật kỹ và tự xử lý conflict nếu có).*
- **Commit Messages:** Ghi rõ ràng, ngắn gọn nội dung thay đổi để các thành viên dễ theo dõi.

### Tiêu chuẩn Code
- **Backend:** Tuân thủ chặt chẽ kiến trúc **Controller -> Service -> Entity**.
- **Validation:** Luôn kiểm tra tính hợp lệ của dữ liệu đầu vào bằng **DTO** và `class-validator`.