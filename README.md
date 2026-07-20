# HiperCare Backend API 

Backend API untuk aplikasi **HiperCare** — Mobile Health Hipertensi Berbasis Family Centered Nursing.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT
- **Push Notification**: Firebase Cloud Messaging (FCM)
- **Dokumentasi**: Swagger (OpenAPI 3.0)

## Struktur Folder

```
hipercare-backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   ├── database.js       # Prisma client
│   │   ├── jwt.js            # JWT config
│   │   └── swagger.js        # Swagger config
│   ├── middlewares/
│   │   ├── auth.middleware.js   # Verify JWT
│   │   └── role.middleware.js   # Role-based access
│   ├── modules/
│   │   ├── auth/
│   │   ├── pasien/
│   │   ├── obat/
│   │   ├── tekanan-darah/
│   │   ├── diet-dash/
│   │   ├── keluhan/
│   │   ├── jadwal-kontrol/
│   │   ├── edukasi/
│   │   ├── notifikasi/
│   │   └── badge/
│   ├── utils/
│   │   ├── response.js       # Standard API response
│   │   └── fcm.js            # FCM helper
│   ├── app.js
│   └── index.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Setup & Instalasi

### 1. Clone & Install

```bash
npm install
```

### 2. Konfigurasi Environment

```bash
cp .env.example .env
```

Edit `.env` dan isi nilai yang sesuai:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/hipercare"
JWT_SECRET="your_jwt_secret_key"
JWT_EXPIRES_IN="7d"
PORT=3000
FIREBASE_PROJECT_ID="your_firebase_project_id"
FIREBASE_CLIENT_EMAIL="your_firebase_client_email"
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
```

### 3. Setup Database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Jalankan Server

```bash
# Development
npm run dev

# Production
npm start
```

## Dokumentasi API

Setelah server berjalan, buka browser dan akses:

```
http://localhost:3000/api-docs
```

## Role & Hak Akses

| Role | Deskripsi |
|---|---|
| `admin` | Akses penuh ke semua CMS dan master data |
| `perawat` | Kelola pasien, master obat, diet, monitoring |
| `pasien` | Input data pribadi, obat, TD, diet, keluhan |
| `keluarga` | Read-only monitoring data pasien |

## Endpoint Utama

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/auth/login` | Login semua role |
| GET | `/api/auth/me` | Data user aktif |
| PATCH | `/api/auth/update-device` | Update FCM token |
| GET | `/api/pasien` | Daftar pasien |
| POST | `/api/pasien` | Registrasi pasien baru |
| GET | `/api/obat/master` | Master data obat |
| POST | `/api/obat/kepatuhan/:pasienId` | Konfirmasi minum obat |
| POST | `/api/tekanan-darah/:pasienId` | Input tekanan darah |
| POST | `/api/keluhan/:pasienId` | Input keluhan klinis |
| GET | `/api/edukasi` | Materi edukasi |
| GET | `/api/notifikasi` | Riwayat notifikasi |

Dokumentasi lengkap tersedia di Swagger UI.
