# Rumah Susu Indonesia - Inventory Dashboard

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Google Sheets](https://img.shields.io/badge/Google_Sheets-API-green?style=for-the-badge&logo=google-sheets)](https://www.google.com/sheets/about/)

**Inventory Dashboard** untuk Rumah Susu Indonesia — manajemen stok real-time dengan integrasi Google Sheets sebagai database backend.

---

## Fitur Utama

### Inventory Management

- **11 Kategori Stok** — Susu, Cup, Plastik Logo, Plastik Roll, Box, Tray
- **CRUD Operations** — Tambah, Edit, Hapus transaksi langsung dari dashboard
- **Real-time Data** — Data langsung dari Google Sheets via Google Apps Script
- **Kolom Lengkap** — No, Tanggal, Masuk, Keluar, Stock, Keterangan, Request By, No. SJ

### UI/UX

- **Dark Mode Only** — Gold accent (#F59E0B) sesuai branding RSI
- **Responsive** — Optimal di Desktop (Admin) dan Mobile (Gudang)
- **PWA Installable** — Bisa di-install sebagai app di HP/PC
- **Premium Sidebar Navigation** — 11 inventory pages + dashboard

### Teknis

- **SWR Caching** — Auto-refresh data tanpa reload halaman
- **Offline Resilience** — Service Worker caching untuk koneksi tidak stabil
- **i18n** — Bahasa Indonesia (ID) dan English (EN)
- **PDF Export** — Export laporan per kategori

---

## Teknologi

| Teknologi              | Kegunaan                            |
| ---------------------- | ----------------------------------- |
| **Next.js 16**         | Framework React dengan Turbopack    |
| **TypeScript**         | Type safety throughout              |
| **Tailwind 4**         | Utility-first styling via Shadcn UI |
| **Zustand**            | State management                    |
| **SWR**                | Data fetching & caching             |
| **next-intl**          | Internationalization                |
| **Google Apps Script** | Backend bridge ke Google Sheets     |

---

## Cara Kerja Sistem

```
Dashboard (Next.js)
    ↓ fetch/POST
Google Apps Script (GAS)
    ↓ read/write
Google Sheets (Database)
```

---

## Instalasi

```bash
# Clone repo
git clone https://github.com/hafizhmaulidan15/Rumah-Susu-Dashboard.git
cd Rumah-Susu-Dashboard

# Install dependensi
npm install

# Jalankan development server
npm run dev

# Buka http://localhost:3000/en
```

---

## Konfigurasi Google Sheets

1. Buat Google Apps Script project
2. Deploy sebagai web app (Anyone can access)
3. Copy deployment URL
4. Paste ke `src/lib/data.ts` → `GOOGLE_SCRIPT_URL`

---

## Deploy ke Vercel

```bash
npm run build
```

Vercel auto-detects Next.js. Set environment variable `GOOGLE_SCRIPT_URL` jika perlu.

---

## Struktur Project

```
src/
├── app/[locale]/         # Pages (App Router)
│   └── (protected)/       # RSI inventory pages
├── components/
│   ├── views/homepage/   # RSIDashboardView
│   ├── views/tables/     # RSIInventoryView
│   └── common/dialogs/   # Add/Edit/Delete dialogs
├── lib/
│   └── data.ts           # SWR hooks + Google Sheets API
└── hooks/
    └── usePWA.ts         # PWA service worker registration
```

---

## Screens

- **Dashboard** — 4 kategori inventory dengan total stock per kategori
- **Inventory Pages** — Tabel transaksi per kategori (susu, cup, plastik, box, tray)
- **Add/Edit/Delete Dialogs** — Modal untuk CRUD operations
- **PWA Install** — Install sebagai standalone app
