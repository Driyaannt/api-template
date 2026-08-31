# backend-driya

Starter API Express + TypeScript dengan PostgreSQL raw query dan dashboard API Explorer berbasis React. Explorer menampilkan katalog endpoint, mengirim request, menyimpan body/path/hasil request per pengguna, dan menyediakan pencarian endpoint.

## Fitur saat ini

- Express 5 + TypeScript strict + raw PostgreSQL (`pg` pool dan parameterized query).
- Login JWT, refresh token HTTP-only cookie, register, logout, dan profil aktif.
- API Explorer dengan login wajib, sidebar searchable/scrollable, request body template, Bearer token otomatis, copy response, serta request history per user.
- Katalog endpoint tersimpan di database (`api_endpoints`) dan disinkronkan dari source metadata.
- Modul Products, Master Shoes, dan Master Helm.
- Raw SQL migration, rollback, status, seed idempotent, dan Docker Compose.

## Prasyarat

- Node.js 24+ (atau LTS yang mendukung project).
- PostgreSQL aktif di `localhost:5432`.
- Corepack. Pada Windows tanpa hak Administrator, gunakan `corepack pnpm` di setiap command.

## Instalasi lokal

```powershell
cd C:\Data\code\backend-driya-template
corepack pnpm install
Copy-Item .env.example .env
```

Buat database PostgreSQL bila belum ada:

```sql
CREATE DATABASE backend_driya;
```

Atur `.env` sesuai PostgreSQL lokal Anda. Untuk user `postgres` tanpa password:

```env
DATABASE_URL=postgresql://postgres@localhost:5432/backend_driya
```

Lalu siapkan schema dan data awal:

```powershell
corepack pnpm db:migrate
corepack pnpm db:seed
corepack pnpm dev
```

Dashboard: `http://localhost:5173`  
API: `http://localhost:3000/api/v1`  
Health check: `http://localhost:3000/api/v1/health`

Login development:

```text
Email: admin@example.test
Password: ChangeMe123!
```

Ubah credential dan semua JWT secret sebelum deployment.

## API Explorer

Masuk melalui `/login`, kemudian buka `/explorer`.

- Pilih endpoint pada sidebar atau cari berdasarkan nama, path, method, maupun modul.
- Untuk endpoint POST/PUT/PATCH non-autentikasi, body draft disimpan otomatis setelah Anda berhenti mengetik.
- Hasil request, body, serta path terakhir disimpan per user di `api_request_history`.
- Request Login/Register dan respons autentikasi tidak disimpan demi mencegah password/token tersimpan di database.
- Untuk endpoint dengan `{id}`, ganti placeholder dengan UUID dari endpoint list.

## Endpoint utama

| Method | Path | Keterangan |
| --- | --- | --- |
| POST | `/auth/register` | Registrasi pengguna |
| POST | `/auth/login` | Login dan access token |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Profil aktif (Bearer token) |
| GET/POST | `/products` | List dan tambah product |
| GET | `/products/{id}` | Detail product |
| GET/POST | `/master/shoes` | Master sepatu |
| GET | `/master/shoes/{id}` | Detail sepatu |
| GET/POST | `/master/helm` | Master helm |
| GET | `/api-catalog` | Endpoint untuk sidebar Explorer |
| GET/PUT | `/api-history` | Riwayat request Explorer |

Semua path di atas memakai prefix `/api/v1`.

## Database dan migration

Migration berada di `database/migrations/raw`. Migration yang sudah ada membuat users/roles, products, katalog API, history request, master shoes, serta master helm.

```powershell
corepack pnpm db:migrate
corepack pnpm db:migrate:status
corepack pnpm db:migrate:rollback
corepack pnpm db:seed
```

Tabel penting:

- `api_endpoints`: metadata endpoint untuk sidebar Explorer.
- `api_request_history`: body draft, path, status, dan respons terakhir per user + endpoint.
- `shoe_masters`: database master sepatu.
- `helm`: database master helm.

## Menambahkan API baru

1. Buat migration bila API membutuhkan tabel baru.
2. Tambahkan route/module backend lalu mount di `apps/api/src/app.ts`.
3. Tambahkan metadata endpoint ke `apps/api/src/modules/catalog/catalog.definition.ts`.
4. Sinkronkan katalog:

```powershell
corepack pnpm api:catalog:sync
```

Endpoint tersebut kemudian muncul otomatis di Explorer. `requestExample` di katalog menjadi body template yang terlihat di UI.

## Command

```powershell
corepack pnpm dev
corepack pnpm build
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test
corepack pnpm db:migrate
corepack pnpm db:seed
corepack pnpm api:catalog:sync
corepack pnpm docker:up
corepack pnpm docker:down
```

Jika `pnpm` global tersedia, awalan `corepack` dapat dihilangkan. Untuk mengaktifkannya di Windows, jalankan PowerShell sebagai Administrator dan gunakan `corepack enable`.

## Arsitektur dan keamanan

Alur backend adalah `route → service → repository contract → adapter`. Adapter raw yang aktif memakai PostgreSQL pool, query parameterized, transaksi, dan graceful shutdown. Prisma/Sequelize belum menjadi adapter fungsional.

Password disimpan dengan Argon2; refresh token disimpan dalam bentuk hash; akses database menggunakan parameter binding. Jangan memasukkan secret nyata ke repository atau body template katalog.
