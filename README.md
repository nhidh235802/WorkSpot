# WorkSpot ☕

**A platform for Japanese people to find working-friendly cafes in Hanoi, Vietnam.**

🌐 **Live Demo:** [work-spot-alpha.vercel.app](https://work-spot-alpha.vercel.app) &nbsp;|&nbsp; 🇻🇳 [Tiếng Việt](./README.vi.md) &nbsp;|&nbsp; 🇯🇵 [日本語](./README.ja.md)

---

## Overview

WorkSpot connects Japanese users living in Hanoi with cafes that suit their work and study needs. The platform supports three roles:

- **Customer** — Search cafes, view details, write reviews
- **Owner** — Register and manage their cafe listings
- **Admin** — Approve cafes, manage accounts, view analytics

---

## Features

### Customer
- Search cafes by keyword, distance (GPS), and facility filters (WiFi, power outlets, desks, snacks…)
- View cafe recommendations scored by distance + average rating
- View cafe details: description, photo gallery, operating hours, map, and reviews
- Write and delete reviews (rating + comment + photos)
- Register / Login with email and password
- Forgot password via email (reset link valid for 15 minutes)
- Manage profile: update info, change password, upload avatar

### Owner
- Register a new cafe with address, description, facilities, operating hours, and photos (up to 5)
- Edit cafe info — changes are held for Admin approval before going public
- Update real-time status: Available / Normal / Busy
- View approval status: Pending / Approved / Rejected / Hidden
- View rejection reason and resubmit

### Admin
- Dashboard: total accounts, total cafes, pending cafes count, monthly growth charts
- Review and approve or reject cafe submissions (with reason)
- Manage cafes: search, filter by status, hide/show, delete
- Manage accounts: search, filter by role & status, disable/suspend accounts, auto-hide owner's cafes

---

## Tech Stack

**Frontend**

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Forms | React Hook Form + Zod |
| Maps | React Leaflet (OpenStreetMap + Nominatim geocoding) |
| HTTP | Axios |
| UI | Lucide React, Sonner (toasts) |

**Backend**

| | |
|---|---|
| Framework | NestJS 11 |
| Language | TypeScript |
| ORM | TypeORM 0.3 |
| Database | PostgreSQL (Supabase hosted) |
| Storage | Supabase Storage (cafe-images, review-images, avatars) |
| Auth | JWT + Passport + Bcrypt |
| Email | Nodemailer (Gmail SMTP) |
| Upload | Multer (memory storage) |
| Validation | class-validator + class-transformer |

---

## Installation

**Requirements:** Node.js v18+, npm v9+, a Supabase project

```bash
# 1. Clone the repository
git clone https://github.com/nhidh235802/WorkSpot.git
cd WorkSpot

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Configure environment variables (see section below)

# 4. Run database migrations (creates tables + seeds mock data)
cd backend && npm run m:run

# 5. Start servers
# Terminal 1 — Backend (port 3001)
cd backend && npm run start:dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Demo accounts (after seeding)**

| Role | Email | Password |
|---|---|---|
| Admin | `admin@workspot.com` | `Admin@123` |
| Owner | `owner01@workspot.com` | `Owner@123` |
| Customer | `customer01@workspot.com` | `Customer@123` |

**Migration commands**

| Command | Description |
|---|---|
| `npm run m:run` | Apply all pending migrations |
| `npm run m:revert` | Undo the last migration |
| `npm run m:drop` | Drop entire schema ⚠️ |
| `npm run m:gen` | Generate migration from entity changes |

---

## Environment Variables

**`backend/.env`**

```env
# Database — Supabase Transaction Pooler (port 6543)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase Storage (use service_role key)
SUPABASE_URL=https://[ref].supabase.co
SUPABASE_KEY=[service_role_key]

# JWT
JWT_SECRET=your_jwt_secret

# Gmail SMTP (use App Password)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password

# Frontend URL (used in password reset emails)
FRONTEND_URL=https://work-spot-alpha.vercel.app
```

**`frontend/.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> **Supabase Storage:** Create 3 **public** buckets: `cafe-images`, `review-images`, `avatars`.

---

## Project Structure

```
WorkSpot/
├── backend/
│   └── src/
│       ├── admin/        # Dashboard stats, user & cafe management
│       ├── auth/         # Register, login, JWT, password reset
│       ├── cafes/        # Cafe CRUD, search, reviews
│       ├── mail/         # Email notifications (Gmail SMTP)
│       ├── migrations/   # TypeORM schema migrations + seed data
│       ├── supabase/     # Storage wrapper (upload / delete)
│       └── users/        # User profile management
│
└── frontend/
    └── app/
        ├── (auth)/       # Login, register, forgot/reset password
        ├── (main)/       # Customer pages (home, search, cafe detail)
        ├── (owner)/      # Owner pages (dashboard, create/edit cafe)
        └── admin/        # Admin pages (dashboard, approvals, management)
```

---

## Deployment

| Layer | Platform | Notes |
|---|---|---|
| Frontend | **Vercel** | Auto-deploy from `main` branch |
| Backend | **Render / Railway** | Set all env vars in platform settings |
| Database | **Supabase** | PostgreSQL, Transaction Pooler (port 6543) |
| Storage | **Supabase Storage** | 3 public buckets |

Set `NEXT_PUBLIC_API_URL` to your deployed backend URL in Vercel's environment settings.