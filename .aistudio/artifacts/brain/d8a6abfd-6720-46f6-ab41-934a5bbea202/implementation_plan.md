# RoamPlan — Smart Trip Planner

RoamPlan adalah aplikasi perencana perjalanan cerdas yang memungkinkan pelancong menyusun rencana perjalanan harian yang terstruktur, memvisualisasikan destinasi di peta interaktif, mengelola estimasi anggaran secara presisi, serta mengoptimalkan urutan kunjungan berdasarkan waktu dan jarak antar lokasi, lengkap dengan fitur berbagi instan kepada rekan perjalanan.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan klarifikasi pada Fase 1, seluruh parameter utama arsitektur telah diselaraskan dengan kebutuhan Anda:

- **Kerangka Kerja**: Menggunakan **React 19 + TypeScript** (bawaan lingkungan proyek) dengan arsitektur modular, state reaktif cepat, dan transisi fluid via Tailwind CSS v4 & Lucide Icons.
- **Peta Interaktif & Rute**: Mengintegrasikan **Leaflet + OpenStreetMap** secara lokal tanpa ketergantungan API key berbayar, dilengkapi kalkulasi jarak (Haversine/OSRM routing) dan algoritma pengurutan rute otomatis (*Smart Route Optimizer*).
- **Berbagi & Kolaborasi**: Tautan instan berbasis kompresi URL query parameter (*zero-friction sharing* untuk teman perjalanan membuka itinerary langsung di peramban mereka) ditambah ekspor dokumen cetak/PDF dan format JSON cadangan.

---

## 1. Overview & Core Concept

- **Apa yang Dibangun**: Sebuah *workspace* perencanaan liburan terpadu yang memadukan panel jadwal hari (*day-by-day itinerary*), kanvas peta interaktif rute perjalanan, kalkulator anggaran terbagi per kategori (transportasi, penginapan, makan, tiket masuk, tak terduga), serta motor pengurut cerdas yang merekomendasikan urutan destinasi paling efisien.
- **Target Pengguna**: Solo traveler, perencana liburan keluarga, *group trip leaders*, dan backpacker yang memerlukan kontrol jadwal dan transparansi bujet tanpa kerumitan spreadsheet.
- **Nilai Utama**:
  1. Menghilangkan waktu terbuang akibat bolak-balik lokasi dengan optimasi jarak & estimasi waktu tempuh otomatis.
  2. Transparansi finansial perjalanan dengan pemantauan pengeluaran vs batas anggaran (*budget cap*).
  3. Kemudahan membagikan rencana ke teman perjalanan dalam satu klik melalui URL atau cetak PDF rapi.

---

## 2. User Experience & Visual Design

### Alur Pengalaman Pengguna (Key User Flows)

1. **Inisiasi & Konfigurasi Perjalanan**:
   - Pengguna dapat membuat perjalanan baru (nama destinasi utama, tanggal mulai - selesai, mata uang seperti IDR/USD, dan total target anggaran) atau memilih dari *sample preset* populer (misalnya *3-Day Cultural & Culinary Yogyakarta*, *4-Day Bali Coastal Explorer*, atau *Jepang Tokyo-Kyoto*).
2. **Penyusunan Jadwal Harian (Day Itinerary)**:
   - Tab navigasi hari (Hari 1, Hari 2, Hari 3, dst.) dengan ringkasan jarak tempuh hari itu dan estimasi total jam perjalanan.
   - Penambahan destinasi dengan mengisi: Nama tempat, waktu mulai - durasi kunjungan, kategori (Wisata, Kuliner, Penginapan, Belanja, Transit), koordinat/titik lokasi, estimasi biaya, dan catatan khusus.
3. **Peta Interaktif & Visualisasi Rute**:
   - Peta Leaflet memetakan pin bernomor urut sesuai urutan destinasi hari terpilih.
   - Garis polylines menghubungkan titik destinasi dengan indikator jarak (km) dan estimasi waktu berkendara/berjalan.
   - Klik pada pin peta langsung menyorot kartu destinasi di panel samping, dan sebaliknya.
4. **Optimasi Urutan Cerdas (Smart Route Optimizer)**:
   - Satu tombol *"Optimalkan Urutan Kunjungan"* yang secara otomatis menyusun ulang jadwal kunjungan dari titik awal berdasarkan jarak terdekat (Nearest Neighbor Traveling Salesperson Heuristic) dan jendela waktu buka, meminimalkan waktu di jalan.
5. **Kalkulator & Manajemen Anggaran**:
   - Kartu metrik keuangan: Total Anggaran, Total Estimasi Terpakai, Sisa Anggaran, dan Rata-rata Biaya Per Hari.
   - Grafik distribusi biaya per kategori (Akomodasi, Tiket & Atraksi, Makanan & Minuman, Transportasi, Logistik/Lainnya).
6. **Berbagi & Ekspor (Share & Export)**:
   - Tombol *"Bagikan ke Teman"* menghasilkan URL yang menyimpan seluruh state perjalanan (bisa langsung dibuka di gawai teman tanpa perlu login).
   - Tampilan *Read-only Mode* untuk teman perjalanan yang membuka tautan, dengan opsi *Clone to Edit*.
   - Fitur *Print / Export PDF* dengan format lembar rencana perjalanan bergaya *editorial travel brief* yang elegan.

### Identitas Visual & Tema

- **Aesthetic Direction**: *Refined Travel Workspace* — bergaya modern utilitarian, bersih, dengan tipografi yang tegas dan tata letak berdensitas tinggi yang mudah dibaca saat merencanakan perjalanan.
- **Palet Warna**:
  - Background: Netral bersih (`#F8FAFC` slate-50 / dark slate `#0B0F17`)
  - Permukaan: Kartu putih bersih dengan garis batas hairline tipis (`border-slate-200 dark:border-slate-800`)
  - Aksen Primer: *Deep Azure Blue* (`#0284C7` sky-600 / `#0369A1`) untuk rute, aksi utama, dan penanda hari
  - Aksen Sekunder: *Emerald Sage* (`#059669`) untuk status anggaran aman, *Amber Gold* (`#D97706`) untuk penanda waktu transit
- **Tipografi**:
  - Headings & Brand: Plus Jakarta Sans / DM Sans untuk kesan modern dan percaya diri.
  - Angka & Keuangan: Monospace Tabular (`font-mono tabular-nums`) untuk jam, menit, jarak km, dan rupiah/dolar agar sejajar rapi.
- **Zero-Pill & Metadata Discipline**:
  - Metadata jam, durasi, dan biaya disajikan dengan pemisah tipografi bersih (`09:00 · 2 jam · Rp 50.000`), bukan kapsul pill warna-warni yang mengalihkan perhatian.

---

## 3. Keputusan Produk & Trade-Offs

- **Keputusan 1: Leaflet OSM vs Google Maps API**
  - *Pendekatan*: Menggunakan Leaflet OpenStreetMap dengan tile server bebas hambatan dan perhitungan jarak geodesik Haversine + OSRM routing helper.
  - *Alasan*: Bebas dari kegagalan API key, tidak memerlukan penagihan Cloud GCP, dan responsif instan dalam lingkungan pratinjau.
  - *Alternatif*: Google Maps SDK memerlukan API key aktif dengan pembatasan domain; jika kunci kadaluarsa maka peta menampilkan layar kosong.
- **Keputusan 2: Mekanisme Berbagi Instan via URL State + LocalStorage**
  - *Pendekatan*: Data perjalanan disimpan di `localStorage` peramban aktif dan diserialisasi ke Base64/compressed URL parameter saat tombol bagikan ditekan.
  - *Alasan*: Teman perjalanan dapat langsung membuka tautan tanpa proses login akun atau otentikasi rumit, sekaligus data pengguna tersimpan aman di perangkatnya.
  - *Alternatif*: Database Supabase/Firebase dapat ditambahkan jika membutuhkan sinkronisasi real-time multi-kursor, namun untuk fungsionalitas berbagi rencana instan, URL sharing adalah solusi paling andal dan tanpa friksi.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          RoamPlan App Shell                            │
├────────────────────────────────────────────────────────────────────────┤
│  Top Bar: Judul Trip · Destinasi · Tanggal · Total Budget · [Bagikan]  │
├──────────────────────────────────┬─────────────────────────────────────┤
│      Sidebar / Itinerary View    │        Interactive Map Canvas       │
│                                  │                                     │
│  ┌────────────────────────────┐  │  ┌───────────────────────────────┐  │
│  │ Day Tabs (Hari 1, 2, 3...) │  │  │ Leaflet OpenStreetMap Engine  │  │
│  ├────────────────────────────┤  │  │                               │  │
│  │ Metric Strip: Jarak, Waktu │  │  │  [Marker 1] ─── (5.2 km)      │  │
│  │ [⚡ Optimalkan Rute]        │  │  │      \                       │  │
│  ├────────────────────────────┤  │  │       \─── [Marker 2]         │  │
│  │ List Destinasi Terurut:    │  │  │                 \             │  │
│  │  1. Candi Prambanan        │  │  │                  [Marker 3]   │  │
│  │     08:30 · 2j · Rp 50rb   │  │  │                               │  │
│  │     [Drag / Naik / Turun]  │  │  │  - Fit Bounds to Day Markers  │  │
│  │  2. Gudeg Yu Djum          │  │  │  - Distance Polyline Layer    │  │
│  │     11:30 · 1.5j · Rp 35rb │  │  │  - Interactive Pin Popups     │  │
│  │  [+ Tambah Destinasi Baru] │  │  └───────────────────────────────┘  │
│  └────────────────────────────┘  │                                     │
├──────────────────────────────────┴─────────────────────────────────────┤
│  Bottom / Collapsible Drawer:                                          │
│  - Tab 1: Ringkasan Anggaran & Grafik Komposisi Biaya                  │
│  - Tab 2: Matriks Jarak & Waktu Tempuh Antar Destinasi                 │
│  - Tab 3: Modal Berbagi Tautan / Salin URL / Ekspor PDF Ringkas        │
└────────────────────────────────────────────────────────────────────────┘
```

### Entitas Data Utama (TypeScript Interfaces)

```typescript
export interface Destination {
  id: string;
  title: string;
  category: 'sightseeing' | 'culinary' | 'hotel' | 'shopping' | 'transit';
  startTime: string; // e.g. "09:00"
  durationMinutes: number; // e.g. 90
  cost: number;
  lat: number;
  lng: number;
  address?: string;
  notes?: string;
}

export interface DayPlan {
  id: string;
  dayNumber: number;
  date: string;
  themeTitle?: string;
  destinations: Destination[];
}

export interface TripPlan {
  id: string;
  title: string;
  destinationCity: string;
  startDate: string;
  endDate: string;
  currency: string;
  totalBudget: number;
  days: DayPlan[];
}
```

### Logika Optimasi Rute (Algorithm)

1. **Kalkulasi Jarak Haversine**: Menghitung jarak garis lurus bola bumi antar koordinat `(lat1, lng1)` dan `(lat2, lng2)`.
2. **Estimasi Waktu Tempuh**: Memproyeksikan kecepatan rata-rata perkotaan (30 km/jam dengan faktor lalu lintas) untuk menentukan estimasi durasi antar titik.
3. **Optimasi Urutan (Greedy Nearest Neighbor)**:
   - Mulai dari destinasi awal (biasanya hotel/titik kumpul).
   - Cari destinasi berikutnya yang belum dikunjungi dengan jarak terpendek.
   - Atur ulang `startTime` secara otomatis memperhitungkan durasi kunjungan + waktu perjalanan di jalan.

---

## 5. Rencana Langkah Implementasi

1. **Setup Leaflet & Dependencies**:
   - Memasang `leaflet` dan tipe TypeScript terkait.
   - Menghubungkan CSS Leaflet untuk rendering peta yang mulus.
2. **State Management & Data Presets**:
   - Membuat store kustom React hook untuk state `TripPlan` dengan sinkronisasi `localStorage`.
   - Menyediakan 2 template perjalanan siap pakai (Yogyakarta 3 Hari & Bali 4 Hari) agar pengguna langsung melihat keindahan visual saat aplikasi dibuka.
3. **Komponen Peta (Interactive Leaflet Map)**:
   - Menampilkan marker bernomor dengan ikon kategori.
   - Menggambar garis rute antar destinasi per hari.
   - Fit-bounds otomatis ke semua titik di hari yang aktif.
4. **Editor Itinerary Harian & Modals**:
   - Penambahan/pengeditan destinasi dengan form input rapi, pencarian koordinat cepat/klik di peta, dan pengaturan waktu.
   - Tombol pengurutan manual (naik/turun/reorder) serta tombol *Optimize Route*.
5. **Panel Anggaran & Analisis Biaya**:
   - Kalkulasi real-time pengeluaran per hari dan per kategori vs batas anggaran.
   - Indikator persentase pemakaian bujet dan peringatan ramah jika melebihi anggaran.
6. **Sistem Berbagi & Ekspor**:
   - Modal share dengan pembuatan tautan terenkripsi (URL query param).
   - Fitur salin tautan instan dengan notifikasi toast.
   - Tampilan cetak ramah printer (CSS print stylesheet) untuk dokumen perjalanan fisik/PDF.
