# API E-Commerce — Dokumentasi

Base URL: `http://localhost:8000/api`

Semua endpoint mengembalikan format JSON. Endpoint yang butuh autentikasi menggunakan token Bearer:

```
Authorization: Bearer <token>
```

---

## Autentikasi (Sanctum)

### POST `/register`
Daftar akun baru.

**Request:**
```json
{
  "name": "Budi Santoso",
  "email": "budi@test.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": { "id": 10, "name": "Budi Santoso", "email": "budi@test.com", "role": "customer" },
  "token": "1|qlRgCBnhapPOafI8uxTSNAk..."
}
```

### POST `/login`
Login dengan email & password.

**Request:**
```json
{ "email": "budi@test.com", "password": "password123" }
```

**Response 200:**
```json
{ "success": true, "data": { "...": "..." }, "token": "2|..." }
```

**Error (422):** `{ "message": "Email atau password salah.", "errors": {"email": ["Email atau password salah."]} }`

---

### POST `/logout` 🔒
Logout & hapus token aktif.

**Response:**
```json
{ "success": true, "message": "Logout berhasil." }
```

### GET `/me` 🔒
Ambil data user yang sedang login.

**Response:**
```json
{ "success": true, "data": { "id": 10, "name": "Budi", "email": "budi@test.com", "role": "customer" } }
```

### PUT `/me` 🔒
Update profil (opsional field).

| Field | Tipe | Catatan |
|---|---|---|
| name | string | opsional |
| password | string, min:8 | opsional, wajib `password_confirmation` |

---

## Produk

### GET `/products`
List produk dengan pagination & filter.

**Query Params:**
| Param | Tipe | Deskripsi |
|---|---|---|
| `search` | string | Cari berdasarkan nama / SKU |
| `category` | string | Slug kategori (termasuk sub-kategori) |
| `min_price` | number | Harga minimum |
| `max_price` | number | Harga maksimum |
| `rating` | number | Rating minimum (dari review) |
| `sort` | string | `newest` \| `price_asc` \| `price_desc` \| `name` \| `best_selling` |
| `per_page` | number | Default 12 |

**Response 200:**
```json
{
  "data": [
    {
      "id": 1, "name": "Samsung Galaxy S24 Ultra", "slug": "samsung-galaxy-s24-ultra",
      "description": "...", "price": "19999000.00", "stock": 25, "sku": "SMG-S24U", "is_active": true,
      "category": { "id": 2, "name": "Smartphone", "slug": "smartphone", "parent_id": 1 },
      "images": [ { "id": 1, "url": "https://...", "sort_order": 0 } ],
      "variants": [ { "id": 1, "name": "128GB", "extra_price": "100000.00", "stock": 14 } ],
      "reviews_count": 3, "avg_rating": 4.5
    }
  ],
  "links": { "...": "..." },
  "meta": { "current_page": 1, "last_page": 5, "per_page": 12, "total": 58 }
}
```

### GET `/products/{slug}`
Detail produk.

**Response 200:**
```json
{ "data": { "id": 1, "name": "...", "slug": "...", "images": [...], "variants": [...], "reviews_count": 3, "avg_rating": 4.5 } }
```

### GET `/products/{slug}/related`
Produk terkait (kategori sama, max 4).

**Response 200:** `{ "data": [ { "...": "..." } ] }`

---

## Kategori

### GET `/categories`
List kategori root + sub-kategori + jumlah produk.

**Response:**
```json
{ "data": [ { "id": 1, "name": "Elektronik", "slug": "elektronik", "parent_id": null, "children": [...], "products_count": 0 } ] }
```

### GET `/categories/{slug}`
Detail kategori.

### GET `/categories/{slug}/products`
List produk dalam kategori (termasuk sub-kategori).

---

## Keranjang 🔒

### GET `/cart`
Lihat isi keranjang.

**Response:**
```json
{
  "data": {
    "id": 9, "items_count": 2, "total": 40396000,
    "items": [
      { "id": 20, "product": { "...": "..." }, "variant": { "...": "..." }, "qty": 2, "subtotal": 39998000 }
    ]
  }
}
```

### POST `/cart/items`
Tambah item ke keranjang.

**Request:**
```json
{ "product_id": 1, "variant_id": 1, "qty": 2 }
```
`variant_id` opsional.

### PUT `/cart/items/{item}` 🔒
Update qty item.

**Request:** `{ "qty": 5 }`

### DELETE `/cart/items/{item}` 🔒
Hapus item dari keranjang.

### DELETE `/cart` 🔒
Kosongkan keranjang.

---

## Alamat 🔒

### GET `/addresses`
List alamat user.

### POST `/addresses`
**Request:**
```json
{
  "label": "Rumah", "recipient_name": "Budi Santoso", "phone": "081234567890",
  "full_address": "Jl. Merdeka No. 45", "city": "Jakarta Selatan", "postal_code": "12345",
  "is_default": true
}
```

### PUT `/addresses/{address}` 🔒
Update alamat.

### DELETE `/addresses/{address}` 🔒
Hapus alamat.

---

## Checkout 🔒

### POST `/checkout`
Konversi keranjang menjadi pesanan.

**Request:**
```json
{ "address_id": 15, "payment_method": "bank_transfer" }
```
`payment_method`: `bank_transfer` | `credit_card` | `ewallet` | `va` | `qris`

**Response 201:**
```json
{
  "success": true, "message": "Pesanan berhasil dibuat.",
  "data": { "id": 10, "invoice_no": "INV-42721407", "status": "pending", "total": "40396000.00", "address": {...}, "items": [...], "payment": {...} },
  "payment": { "order_id": 10, "invoice_no": "INV-42721407", "method": "bank_transfer", "status": "pending", "reference": null, "total": "40396000.00" }
}
```

---

## Pesanan 🔒

### GET `/orders`
Riwayat pesanan user (pagination).

### GET `/orders/{order}` 🔒
Detail pesanan (hanya milik user sendiri).

**Response:**
```json
{
  "data": {
    "id": 10, "invoice_no": "INV-42721407", "status": "pending", "total": "40396000.00",
    "address": {...}, "items": [...], "payment": { "method": "bank_transfer", "status": "pending" }
  }
}
```

### POST `/orders/{order}/cancel` 🔒
Batalkan pesanan (hanya jika status `pending` atau `paid`).

---

## Wishlist 🔒

### GET `/wishlist`
List wishlist user.

### POST `/wishlist`
**Request:** `{ "product_id": 5 }`

### DELETE `/wishlist/{wishlist}` 🔒
Hapus dari wishlist.

---

## Review

### GET `/products/{product}/reviews` (public)
List review sebuah produk (pagination).

### POST `/products/{product}/reviews` 🔒
Submit review. **Hanya user yang sudah membeli produk (order status `completed`).**

**Request:**
```json
{ "rating": 5, "comment": "Produk bagus sekali!" }
```

**Response:**
```json
{ "data": { "id": 1, "user": {...}, "product_id": 5, "rating": 5, "comment": "..." , "created_at": "..."} }
```

> ⚠️ Jika user belum membeli: `422 { "message": "Anda hanya dapat memberikan review untuk produk yang sudah dibeli." }`

---

## Ringkasan Endpoint

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/register` | ✗ | Daftar |
| POST | `/login` | ✗ | Login |
| POST | `/logout` | ✓ | Logout |
| GET | `/me` | ✓ | User profile |
| PUT | `/me` | ✓ | Update profile |
| GET | `/products` | ✗ | List produk |
| GET | `/products/{slug}` | ✗ | Detail produk |
| GET | `/products/{slug}/related` | ✗ | Produk terkait |
| GET | `/categories` | ✗ | List kategori |
| GET | `/categories/{slug}` | ✗ | Detail kategori |
| GET | `/categories/{slug}/products` | ✗ | Produk per kategori |
| GET | `/cart` | ✓ | Isi keranjang |
| POST | `/cart/items` | ✓ | Tambah item |
| PUT | `/cart/items/{item}` | ✓ | Update qty |
| DELETE | `/cart/items/{item}` | ✓ | Hapus item |
| DELETE | `/cart` | ✓ | Kosongkan keranjang |
| GET | `/addresses` | ✓ | List alamat |
| POST | `/addresses` | ✓ | Tambah alamat |
| PUT | `/addresses/{address}` | ✓ | Update alamat |
| DELETE | `/addresses/{address}` | ✓ | Hapus alamat |
| POST | `/checkout` | ✓ | Buat pesanan |
| GET | `/orders` | ✓ | Riwayat pesanan |
| GET | `/orders/{order}` | ✓ | Detail pesanan |
| POST | `/orders/{order}/cancel` | ✓ | Batalkan pesanan |
| GET | `/wishlist` | ✓ | List wishlist |
| POST | `/wishlist` | ✓ | Tambah wishlist |
| DELETE | `/wishlist/{wishlist}` | ✓ | Hapus wishlist |
| GET | `/products/{product}/reviews` | ✗ | List review |
| POST | `/products/{product}/reviews` | ✓ | Submit review |

> 🔒 = butuh `Authorization: Bearer <token>`
