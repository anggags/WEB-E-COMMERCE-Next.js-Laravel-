<div align="center">

# 🛒 Tokoo — Full-Stack E-Commerce

**Platform toko online lengkap dengan admin panel, integrasi pembayaran Midtrans, dan deploy Docker.**

![Laravel](https://img.shields.io/badge/Laravel-13-FF2D20?style=flat&logo=laravel&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.3-777BB4?style=flat&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat&logo=mysql&logoColor=white)

</div>

---

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Arsitektur](#-arsitektur)
- [Tech Stack](#-tech-stack)
- [Struktur Database](#-struktur-database)
- [API Endpoints](#-api-endpoints)
- [Setup Development](#-setup-development)
- [Docker Deployment](#-docker-deployment)
- [Admin Panel](#-admin-panel)
- [Konfigurasi](#-konfigurasi)

---

## ✨ Fitur

### Customer
| Fitur | Deskripsi |
|-------|-----------|
| Autentikasi | Register, login, logout dengan Sanctum token |
| Product Catalog | Pencarian, filter kategori, harga, rating, sort, pagination |
| Product Detail | Gallery gambar, varian produk, qty selector, review |
| Search | Autocomplete + search history |
| Kategori | Kategori parent/sub, browsing per kategori |
| Keranjang | Slide-out drawer + halaman penuh, update qty, hapus item |
| Wishlist | Toggle favorit di product card & halaman akun |
| Checkout | Pilih/buat alamat, metode bayar, ringkasan pesanan |
| Pembayaran | Midtrans SNAP popup (Transfer Bank, VA, E-Wallet, QRIS, CC) |
| Pesanan | Riwayat pesanan, detail, pembatalan |
| Review | Bintang 1-5 + komentar, hanya pembeli terverifikasi |
| Profil | Edit nama & password, manajemen alamat |

### Admin Panel (`/admin`)
| Fitur | Deskripsi |
|-------|-----------|
| Dashboard | Statistik: total produk, pesanan, revenue, pelanggan |
| Produk | CRUD produk dengan gambar, varian, kategori |
| Kategori | CRUD kategori hierarchical |
| Pesanan | Lihat & edit pesanan, detail item |
| Pembayaran | Daftar pembayaran (read-only) |
| Pengguna | CRUD pengguna |

---

## 🏗 Arsitektur

```
┌─────────────────────────────────────────────────────┐
│                    Docker Compose                     │
│                                                       │
│  ┌─────────┐    ┌──────────┐    ┌──────────────┐     │
│  │  Nginx   │───▶│ Backend  │───▶│    MySQL     │     │
│  │ :80/443  │    │ PHP-FPM  │    │   :3306      │     │
│  │          │    │  :9000   │    │              │     │
│  │          │    └──────────┘    └──────────────┘     │
│  │          │                                         │
│  │          │───▶┌──────────┐                         │
│  │          │    │ Frontend │                         │
│  └─────────┘    │ Next.js  │                         │
│                 │  :3000   │                         │
│                 └──────────┘                         │
│                                                       │
│  ┌─────────┐                                         │
│  │ Certbot │  ← Auto-renew SSL                       │
│  └─────────┘                                         │
└─────────────────────────────────────────────────────┘
```

**Routing Nginx:**
- `/api/*` → Backend (Laravel REST API)
- `/admin/*` → Backend (Filament Admin Panel)
- `/*` → Frontend (Next.js SSR/CSR)

---

## 🛠 Tech Stack

### Backend
| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| Laravel | 13 | Framework PHP |
| PHP | 8.3 | Runtime |
| MySQL | 8.0 | Database |
| Redis | 7 | Cache & Session |
| Sanctum | - | API Token Auth |
| Filament | 3 | Admin Panel |
| Midtrans SDK | - | Payment Gateway |

### Frontend
| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| Next.js | 16 | React Framework (App Router) |
| React | 19 | UI Library |
| TypeScript | ^5 | Type Safety |
| Tailwind CSS | ^4 | Utility-First CSS |
| Zustand | ^5 | State Management |
| Axios | ^1 | HTTP Client |
| GSAP | ^3 | Scroll & Reveal Animations |
| Lenis | ^1 | Smooth Scrolling |

### DevOps
| Teknologi | Keterangan |
|-----------|------------|
| Docker Compose | Multi-container orchestration |
| Nginx | Reverse proxy & static serving |
| Certbot | Let's Encrypt SSL |
| GitHub | Version control |

---

## 🗄 Struktur Database

```
users
├── addresses (1:N)
├── orders (1:N)
│   ├── order_items (1:N)
│   └── payments (1:1)
├── reviews (1:N)
├── wishlists (1:N)
└── carts (1:1)
    └── cart_items (1:N)

categories
├── parent_id (self-referencing)
└── products (1:N)
    ├── product_images (1:N)
    ├── product_variants (1:N)
    ├── reviews (1:N)
    ├── wishlists (1:N)
    ├── cart_items (1:N)
    └── order_items (1:N)
```

**Total tabel: 21** (13 aplikasi + 8 infrastruktur)

| Tabel | Deskripsi |
|-------|-----------|
| `users` | Pengguna (customer & admin) |
| `addresses` | Alamat pengiriman |
| `categories` | Kategori produk (hierarchical) |
| `products` | Produk |
| `product_images` | Gambar produk |
| `product_variants` | Varian produk (ukuran, warna, dll) |
| `carts` | Keranjang belanja |
| `cart_items` | Item dalam keranjang |
| `orders` | Pesanan |
| `order_items` | Item dalam pesanan |
| `payments` | Pembayaran (Midtrans) |
| `reviews` | Ulasan produk |
| `wishlists` | Produk favorit |

---

## 📡 API Endpoints

### Public (8)
```
GET    /api/health                        Health check
POST   /api/register                      Register akun
POST   /api/login                         Login
POST   /api/midtrans/callback             Midtrans webhook
GET    /api/categories                    Daftar kategori
GET    /api/categories/{slug}             Detail kategori
GET    /api/categories/{slug}/products    Produk per kategori
GET    /api/products                      Daftar produk (search, filter, sort, paginate)
GET    /api/products/{slug}               Detail produk
GET    /api/products/{slug}/related       Produk terkait
GET    /api/products/{product}/reviews    Daftar review
```

### Authenticated (17)
```
POST   /api/logout                        Logout
GET    /api/me                            Profil saya
PUT    /api/me                            Update profil
GET    /api/addresses                     Daftar alamat
POST   /api/addresses                     Buat alamat
PUT    /api/addresses/{id}                Update alamat
DELETE /api/addresses/{id}                Hapus alamat
GET    /api/cart                          Lihat keranjang
POST   /api/cart/items                    Tambah item
PUT    /api/cart/items/{id}               Update qty
DELETE /api/cart/items/{id}               Hapus item
DELETE /api/cart                          Kosongkan keranjang
POST   /api/checkout                      Checkout (cart → order)
GET    /api/orders                        Riwayat pesanan
GET    /api/orders/{id}                   Detail pesanan
POST   /api/orders/{id}/cancel            Batalkan pesanan
GET    /api/orders/{id}/pay               Generate SNAP token
GET    /api/wishlist                      Daftar favorit
POST   /api/wishlist                      Tambah favorit
DELETE /api/wishlist/{id}                 Hapus favorit
POST   /api/products/{product}/reviews    Kirim review
```

**Total: 30 endpoints** — Dokumentasi lengkap di `backend/docs/API.md`

---

## 🚀 Setup Development

### Prerequisites
- PHP 8.3+
- Composer
- Node.js 22+
- MySQL 8.0
- Redis

### Backend
```bash
cd backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Configure .env (database credentials)
DB_DATABASE=tokoo
DB_USERNAME=root
DB_PASSWORD=

# Migrate & seed
php artisan migrate
php artisan db:seed

# Start server
php artisan serve
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Start dev server
npm run dev
```

Akses:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api`
- Admin Panel: `http://localhost:8000/admin`

### Default Admin
```
Email: admin@tokoo.com
Password: password
```

---

## 🐳 Docker Deployment

### One-Click Deploy ke VPS

```bash
# 1. SSH ke VPS Ubuntu 22.04
ssh root@YOUR_VPS_IP

# 2. Clone repository
git clone YOUR_REPO_URL /var/www/tokoo
cd /var/www/tokoo

# 3. Run deploy script
bash docker/scripts/deploy.sh yourdomain.com
```

Script otomatis:
- [x] Install Docker & Docker Compose
- [x] Generate password database random
- [x] Build & start semua container (nginx, backend, frontend, mysql, certbot)
- [x] Jalankan Laravel migration
- [x] Buat admin user
- [x] Setup SSL Let's Encrypt

### Setup DNS
Setelah VPS IP diketahui, tambahkan DNS record:
```
yourdomain.com       → A Record → VPS_IP
www.yourdomain.com   → A Record → VPS_IP
```

### Manual Commands
```bash
# Lihat status container
docker compose ps

# Lihat logs
docker compose logs -f

# Jalankan artisan
docker compose exec backend php artisan

# Jalankan migration manual
docker compose exec backend php artisan migrate --force

# Rebuild container
docker compose build --no-cache
docker compose up -d

# Stop semua
docker compose down

# Stop + hapus data
docker compose down -v
```

---

## ⚙️ Konfigurasi

### Environment Variables

**Backend (`backend/.env.production`)**
| Variable | Deskripsi | Default |
|----------|-----------|---------|
| `APP_URL` | URL aplikasi | `https://yourdomain.com` |
| `FRONTEND_URL` | URL frontend | `https://yourdomain.com` |
| `DB_HOST` | Database host | `mysql` (Docker service) |
| `DB_DATABASE` | Database name | `tokoo` |
| `DB_USERNAME` | Database user | `tokoo` |
| `DB_PASSWORD` | Database password | *(generated)* |
| `MIDTRANS_SERVER_KEY` | Midtrans server key | *(isi dari Midtrans dashboard)* |
| `MIDTRANS_CLIENT_KEY` | Midtrans client key | *(isi dari Midtrans dashboard)* |
| `MIDTRANS_IS_PRODUCTION` | Mode production | `true` |

**Frontend (`frontend/.env.local`)**
| Variable | Deskripsi | Default |
|----------|-----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://yourdomain.com/api` |
| `NEXT_PUBLIC_APP_NAME` | Nama aplikasi | `Tokoo` |

### Post-Deploy Checklist
- [ ] Ganti password admin setelah login pertama
- [ ] Update `MIDTRANS_SERVER_KEY` & `MIDTRANS_CLIENT_KEY` di production
- [ ] Pastikan DNS sudah pointing ke VPS IP
- [ ] Test flow checkout dari awal sampai pembayaran
- [ ] Set `MIDTRANS_IS_PRODUCTION=true` setelah Midtrans approved

---

## 📁 Struktur Projek

```
├── backend/                        Laravel 13 API
│   ├── app/
│   │   ├── Filament/               Admin panel resources
│   │   ├── Http/Controllers/       11 API controllers
│   │   ├── Http/Requests/          9 Form request validation
│   │   ├── Http/Resources/         13 API resources (JSON transformation)
│   │   ├── Models/                 13 Eloquent models
│   │   └── Services/               MidtransService
│   ├── config/midtrans.php         Midtrans configuration
│   ├── database/
│   │   ├── migrations/             15 migration files (21 tables)
│   │   └── seeders/                Sample data (60+ products)
│   ├── docs/API.md                 REST API documentation
│   └── routes/api.php             30 API route definitions
│
├── frontend/                       Next.js 16 Application
│   ├── src/
│   │   ├── app/                    14 pages (App Router)
│   │   ├── components/             21 React components
│   │   │   ├── layout/             Header, Footer
│   │   │   ├── home/               Hero, CategorySection, ProductSection
│   │   │   ├── products/           ProductCard, ProductDetail
│   │   │   ├── catalog/            CatalogClient, CategoryDetail
│   │   │   ├── cart/               CartDrawer
│   │   │   ├── checkout/           CheckoutClient, AddressForm
│   │   │   ├── account/            Profile, Orders, Addresses, Wishlist
│   │   │   ├── providers/          AuthProvider, AnimationProvider
│   │   │   └── ui/                 ToastContainer
│   │   ├── hooks/                  useAsyncData, useReveal
│   │   ├── lib/                    api, format, midtrans, search
│   │   ├── store/                  5 Zustand stores
│   │   └── types/                  TypeScript interfaces
│   └── next.config.ts              output: "standalone" (Docker)
│
├── docker/                         Docker Configuration
│   ├── backend.Dockerfile          PHP 8.3-FPM multi-stage
│   ├── frontend.Dockerfile         Next.js standalone multi-stage
│   ├── nginx/default.conf          Reverse proxy config
│   ├── php/www.conf                PHP-FPM tuning
│   └── scripts/deploy.sh           Automated deploy script
│
├── docker-compose.yml              Service orchestration
├── .env.docker                     Docker environment variables
├── .dockerignore                   Docker build exclusions
└── .gitignore                      Git exclusions
```

---

## 📊 Statistik

| Komponen | Jumlah |
|----------|--------|
| Backend Controllers | 11 |
| Backend Models | 13 |
| API Endpoints | 30 |
| Database Tables | 21 |
| Frontend Pages | 14 |
| Frontend Components | 21 |
| Zustand Stores | 5 |
| Docker Services | 5 |
| Form Requests | 9 |
| API Resources | 13 |
| Filament Resources | 5 |

---

## 📄 License

MIT
