# WorkSpot ☕

**ベトナム・ハノイで働けるカフェを探す日本人向けプラットフォーム**

🌐 **Live Demo:** [work-spot-alpha.vercel.app](https://work-spot-alpha.vercel.app) &nbsp;|&nbsp; 🇬🇧 [English](./README.md) &nbsp;|&nbsp; 🇻🇳 [Tiếng Việt](./README.vi.md)

---

## 概要

WorkSpotは、ハノイに在住する日本人が仕事や勉強に適したカフェを簡単に見つけられるプラットフォームです。3つのロールに対応しています：

- **カスタマー** — カフェを検索し、詳細を確認してレビューを投稿
- **オーナー** — カフェの登録・情報管理
- **管理者** — カフェの承認、アカウント管理、統計の閲覧

---

## 機能

### カスタマー
- キーワード・距離（GPS）・設備フィルター（WiFi、電源、デスク、軽食など）でカフェを検索
- 距離と平均評価によるスコアリングでカフェをレコメンド
- カフェ詳細の閲覧：説明、写真ギャラリー、営業時間、地図、レビュー
- レビューの投稿・削除（評価 + コメント + 写真）
- メールアドレスとパスワードで登録 / ログイン
- パスワードリセット（メール送信、有効期限15分）
- プロフィール管理：情報更新、パスワード変更、アバター変更

### オーナー
- 新規カフェ登録（住所・説明・設備・営業時間・写真最大5枚）
- カフェ情報の編集 — 変更内容は管理者の承認後に公開
- リアルタイムステータスの更新：空席あり / 普通 / 混雑中
- 承認ステータスの確認：審査中 / 承認済み / 却下 / 非表示
- 却下理由の確認と再申請

### 管理者
- ダッシュボード：総アカウント数、総カフェ数、審査待ち数、月別成長グラフ
- カフェ申請の承認・却下（却下理由の記入）
- カフェ管理：検索・ステータスフィルター・非表示/表示・削除
- アカウント管理：検索・ロール/ステータスフィルター・アカウント無効化/停止・オーナーのカフェ一括非表示

---

## 技術スタック

**フロントエンド**

| | |
|---|---|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS 4 |
| フォーム | React Hook Form + Zod |
| 地図 | React Leaflet（OpenStreetMap + Nominatimジオコーディング） |
| HTTP | Axios |
| UI | Lucide React、Sonner（トースト通知） |

**バックエンド**

| | |
|---|---|
| フレームワーク | NestJS 11 |
| 言語 | TypeScript |
| ORM | TypeORM 0.3 |
| データベース | PostgreSQL（Supabaseホスト） |
| ストレージ | Supabase Storage（cafe-images / review-images / avatars） |
| 認証 | JWT + Passport + Bcrypt |
| メール | Nodemailer（Gmail SMTP） |
| アップロード | Multer（メモリストレージ） |
| バリデーション | class-validator + class-transformer |

---

## インストール

**必要環境：** Node.js v18+、npm v9+、Supabaseプロジェクト

```bash
# 1. リポジトリをクローン
git clone https://github.com/nhidh235802/WorkSpot.git
cd WorkSpot

# 2. 依存関係をインストール
cd backend && npm install
cd ../frontend && npm install

# 3. 環境変数を設定（以下のセクション参照）

# 4. マイグレーションを実行（テーブル作成 + サンプルデータ投入）
cd backend && npm run m:run

# 5. サーバーを起動
# ターミナル1 — バックエンド（ポート 3001）
cd backend && npm run start:dev

# ターミナル2 — フロントエンド（ポート 3000）
cd frontend && npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

**デモアカウント（シード後）**

| ロール | メールアドレス | パスワード |
|---|---|---|
| 管理者 | `admin@workspot.com` | `Admin@123` |
| オーナー | `owner01@workspot.com` | `Owner@123` |
| カスタマー | `customer01@workspot.com` | `Customer@123` |

**マイグレーションコマンド**

| コマンド | 説明 |
|---|---|
| `npm run m:run` | 未適用のマイグレーションをすべて実行 |
| `npm run m:revert` | 最後のマイグレーションを元に戻す |
| `npm run m:drop` | スキーマを全削除 ⚠️ |
| `npm run m:gen` | エンティティの変更からマイグレーションを生成 |

---

## 環境変数

**`backend/.env`**

```env
# データベース — Supabase Transaction Pooler（ポート 6543）
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase Storage（service_role キーを使用）
SUPABASE_URL=https://[ref].supabase.co
SUPABASE_KEY=[service_role_key]

# JWT
JWT_SECRET=your_jwt_secret

# Gmail SMTP（アプリパスワードを使用）
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password

# フロントエンドURL（パスワードリセットメール用）
FRONTEND_URL=https://work-spot-alpha.vercel.app
```

**`frontend/.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> **Supabase Storage:** `cafe-images`、`review-images`、`avatars` の3つの **公開バケット** を作成してください。

---

## プロジェクト構成

```
WorkSpot/
├── backend/
│   └── src/
│       ├── admin/        # ダッシュボード統計、ユーザー・カフェ管理
│       ├── auth/         # 登録、ログイン、JWT、パスワードリセット
│       ├── cafes/        # カフェCRUD、検索、レビュー
│       ├── mail/         # メール通知（Gmail SMTP）
│       ├── migrations/   # TypeORMマイグレーション + サンプルデータ
│       ├── supabase/     # Supabase Storageラッパー（アップロード / 削除）
│       └── users/        # ユーザープロフィール管理
│
└── frontend/
    └── app/
        ├── (auth)/       # ログイン、登録、パスワードリセット
        ├── (main)/       # カスタマーページ（ホーム、検索、カフェ詳細）
        ├── (owner)/      # オーナーページ（ダッシュボード、カフェ作成・編集）
        └── admin/        # 管理者ページ（ダッシュボード、承認、管理）
```

---

## デプロイ

| レイヤー | プラットフォーム | 備考 |
|---|---|---|
| フロントエンド | **Vercel** | `main` ブランチから自動デプロイ |
| バックエンド | **Render / Railway** | プラットフォーム上で環境変数を設定 |
| データベース | **Supabase** | PostgreSQL、Transaction Pooler（ポート 6543） |
| ストレージ | **Supabase Storage** | 公開バケット3つ |

Vercelでフロントエンドをデプロイする際は、`NEXT_PUBLIC_API_URL` にデプロイ済みバックエンドのURLを設定してください。
