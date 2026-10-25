# TemuBalik — Lost & Founds (ifs24010-pabwe2026-reactjs)

Aplikasi pelaporan barang hilang & temuan kampus berbasis **ReactJS + Vite**, memakai
REST API Delcom (`/lost-founds`). State dikelola **Redux Toolkit**, routing **React Router**,
UI **Tailwind CSS v4**, pengujian **Vitest + React Testing Library** (coverage 100%).

## Menjalankan

```bash
bun install            # atau: npm install
cp .env.example .env   # opsional; .env bawaan sudah mengarah ke API Delcom
bun run dev            # http://localhost:3000
```

## Pengujian

```bash
bun run test           # semua test
bun run test:coverage  # test + laporan coverage (threshold 100%)
```

## Build

```bash
bun run build && bun run preview
```

## Rute

| Rute | Halaman | Akses |
| ---- | ------- | ----- |
| `/auth/login`, `/auth/register` | Masuk / Daftar | Tamu |
| `/` | Daftar laporan, filter, pencarian, ringkasan | Login |
| `/?tampilan=statistik` | Statistik harian & bulanan | Login |
| `/lost-founds/:id` | Detail laporan | Login |
| `/users` | Daftar pengguna | Login |
| `/profile` | Profil, foto, kata sandi | Login |
