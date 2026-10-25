import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
} from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createReport() {
  const primaryColor = 'EA580C'; // Terracotta / Warm Orange (#ea580c)
  const secondaryColor = '1C1917'; // Stone 900

  // Helper for headings
  const createTitle = (text) =>
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: text,
          bold: true,
          size: 32, // 16pt
          font: 'Times New Roman',
          color: secondaryColor,
        }),
      ],
    });

  const createHeading1 = (text) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 360, after: 180 },
      children: [
        new TextRun({
          text: text,
          bold: true,
          size: 28, // 14pt
          font: 'Times New Roman',
          color: secondaryColor,
        }),
      ],
    });

  const createHeading2 = (text) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: text,
          bold: true,
          size: 24, // 12pt
          font: 'Times New Roman',
          color: primaryColor,
        }),
      ],
    });

  const createHeading3 = (text) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 180, after: 90 },
      children: [
        new TextRun({
          text: text,
          bold: true,
          italic: true,
          size: 24, // 12pt
          font: 'Times New Roman',
          color: secondaryColor,
        }),
      ],
    });

  const createBodyParagraph = (text, options = {}) =>
    new Paragraph({
      alignment: AlignmentType.JUSTIFY,
      spacing: { before: 60, after: 120, line: 360 }, // 1.5 line spacing
      children: [
        new TextRun({
          text: text,
          size: 24, // 12pt
          font: 'Times New Roman',
          bold: options.bold || false,
          italic: options.italic || false,
          color: options.color || '000000',
        }),
      ],
    });

  const createBullet = (text, level = 0) =>
    new Paragraph({
      bullet: { level: level },
      spacing: { before: 40, after: 60, line: 300 },
      children: [
        new TextRun({
          text: text,
          size: 24,
          font: 'Times New Roman',
        }),
      ],
    });

  const createCodeBlock = (codeText) => {
    return new Paragraph({
      spacing: { before: 120, after: 120 },
      shading: {
        type: ShadingType.CLEAR,
        fill: 'F5F5F4',
        color: 'F5F5F4',
      },
      children: [
        new TextRun({
          text: codeText,
          font: 'Courier New',
          size: 20, // 10pt
          color: '1C1917',
        }),
      ],
    });
  };

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Times New Roman',
            size: 24,
          },
        },
      },
    },
    sections: [
      // COVER PAGE
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 inch
          },
        },
        children: [
          new Paragraph({ text: '', spacing: { before: 720 } }),
          createTitle('PEMANFAATAN AI DALAM PENGEMBANGAN APLIKASI ROAM PLAN MENGGUNAKAN FRAMEWORK FRONT-END REACT.JS DAN BACK-END EXPRESS.JS'),
          new Paragraph({ text: '', spacing: { before: 1440 } }),
          
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 720, after: 360 },
            children: [
              new TextRun({
                text: 'DISUSUN OLEH:',
                bold: true,
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 1440 },
            children: [
              new TextRun({
                text: '11S24011 – Johan Martua Timotius Samosir',
                bold: true,
                size: 26,
                font: 'Times New Roman',
                color: primaryColor,
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { before: 2160 } }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({
                text: 'TAHUN AJARAN 2026/2027',
                bold: true,
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({
                text: 'PROGRAM STUDI SARJANA INFORMATIKA',
                bold: true,
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({
                text: 'FAKULTAS INFORMATIKA DAN TEKNIK ELEKTRO',
                bold: true,
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 240 },
            children: [
              new TextRun({
                text: 'INSTITUT TEKNOLOGI DEL',
                bold: true,
                size: 26,
                font: 'Times New Roman',
                color: secondaryColor,
              }),
            ],
          }),
        ],
      },

      // DAFTAR ISI & ISI UTAMA
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Laporan Proyek 1 PABWE — Aplikasi RoamPlan',
                    size: 18,
                    italic: true,
                    color: '78716C',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // DAFTAR ISI
          createHeading1('DAFTAR ISI'),
          createBodyParagraph('DAFTAR ISI ................................................................................................................................ i'),
          createBodyParagraph('I. PENDAHULUAN ........................................................................................................................ 1'),
          createBodyParagraph('   1.1. Latar Belakang .................................................................................................................... 1'),
          createBodyParagraph('   1.2. Rumusan Masalah ............................................................................................................... 1'),
          createBodyParagraph('   1.3. Tujuan ................................................................................................................................. 1'),
          createBodyParagraph('   1.4. Manfaat ................................................................................................................................ 2'),
          createBodyParagraph('   1.5. Batasan Masalah ................................................................................................................. 2'),
          createBodyParagraph('II. PERANCANGAN PROGRAM ................................................................................. ecclesiastical 3'),
          createBodyParagraph('   2.1. Deskripsi Studi Kasus ......................................................................................................... 3'),
          createBodyParagraph('   2.2. Fitur Utama ......................................................................................................................... 3'),
          createBodyParagraph('   2.3. Teknologi yang Digunakan ................................................................................................. 3'),
          createBodyParagraph('   2.4. Alur Program ....................................................................................................................... 3'),
          createBodyParagraph('III. PROSES PEMANFAATAN AI ................................................................................................ 4'),
          createBodyParagraph('   3.1. Alat AI yang Digunakan ..................................................................................................... 4'),
          createBodyParagraph('        3.1.1. Google AI Studio (Gemini 3.6 Flash Engine) ........................................................... 4'),
          createBodyParagraph('        3.1.2. Google Maps Platform API .................................................................................... 4'),
          createBodyParagraph('   3.2. Prompt ................................................................................................................................ 4'),
          createBodyParagraph('        3.2.1. Prompt 1 – Integrasi Google Maps API & Styling ..................................................... 4'),
          createBodyParagraph('        3.2.2. Prompt 2 – Aksesibilitas Axe-Core & Layout Grid .................................................. 4'),
          createBodyParagraph('        3.2.3. Prompt 3 – Penyesuaian Dinamis Ukuran Judul ....................................................... 4'),
          createBodyParagraph('   3.3. Hasil Awal AI ..................................................................................................................... 5'),
          createBodyParagraph('        3.3.1. Halaman Itinerary & Peta Interaktif ........................................................................ 5'),
          createBodyParagraph('        3.3.2. Halaman Kelola Anggaran & Estimasi Biaya ........................................................... 5'),
          createBodyParagraph('        3.3.3. Modal Tambah Destinasi & Cetak PDF .................................................................... 5'),
          createBodyParagraph('IV. EVALUASI KRITIS TERHADAP KODE AI ......................................................................... 6'),
          createBodyParagraph('   4.1. Analisis Kesesuaian dengan Kebutuhan ............................................................................. 6'),
          createBodyParagraph('   4.2. Identifikasi Kesalahan dan Kelemahan .............................................................................. 6'),
          createBodyParagraph('   4.3. Bukti Kesalahan ................................................................................................................. 6'),
          createBodyParagraph('        4.3.1. Bukti Kesalahan 1 – Inkompatibilitas axe-core ........................................................ 6'),
          createBodyParagraph('        4.3.2. Bukti Kesalahan 2 – Text Truncation / Title Clipping ............................................ 6'),
          createBodyParagraph('        4.3.3. Bukti Kesalahan 3 – Kontrol Peta Bertumpuk .......................................................... 6'),
          createBodyParagraph('V. PERBAIKAN DAN KEPUTUSAN TEKNIS ............................................................................. 7'),
          createBodyParagraph('   5.1. Perbaikan yang Dilakukan .................................................................................................. 7'),
          createBodyParagraph('        5.1.1. Perbaikan Kesalahan 1 – Asynchronous Axe Load .................................................. 7'),
          createBodyParagraph('        5.1.2. Perbaikan Kesalahan 2 – Dynamic Dynamic Width ch .......................................... 7'),
          createBodyParagraph('        5.1.3. Perbaikan Kesalahan 3 – Map Controls Cleanup ................................................... 7'),
          createBodyParagraph('   5.2. Keputusan Teknis yang Diambil ........................................................................................ 7'),
          createBodyParagraph('   5.3. Bantuan AI Tambahan ........................................................................................................ 8'),
          createBodyParagraph('LAMPIRAN ................................................................................................................................. 8'),
          createBodyParagraph('   LAMPIRAN A: Link Repository Github .................................................................................... 8'),
          createBodyParagraph('   LAMPIRAN B: Link Youtube Menjalankan Aplikasi .................................................................... 8'),

          new Paragraph({ text: '', spacing: { before: 360 } }),

          // BAB I. PENDAHULUAN
          createHeading1('I. PENDAHULUAN'),

          createHeading2('1.1. Latar Belakang'),
          createBodyParagraph(
            'Dalam beberapa tahun terakhir, industri pariwisata mengalami transformasi digital yang sangat pesat. Wisatawan kini membutuhkan media perencana perjalanan yang personal, efisien, dan interaktif untuk menyusun jadwal perjalanan (itinerary), menghitung estimasi pengeluaran, serta memetakan rute perjalanan antar-destinasi. Aplikasi perencana perjalanan "RoamPlan" dipilih sebagai studi kasus dalam proyek ini karena menawarkan solusi nyata bagi wisatawan dalam mengatur liburan harian secara terstruktur berbasis peta interaktif.'
          ),
          createBodyParagraph(
            'Pengembangan aplikasi ini memanfaatkan perkembangan pesat teknologi Generative Artificial Intelligence (AI) seperti Google AI Studio dengan model Gemini 3.6 Flash. AI generatif kini bertindak sebagai asisten pemrograman yang andal, membantu pengembang menuliskan komponen React.js modern, menyusun arsitektur server Express.js, serta melakukan refactoring kode dan mendeteksi bug. Melalui studi kasus ini, penulis bertujuan menguji sejauh mana AI dapat mempercepat proses rekayasa perangkat lunak sekaligus melatih pemikiran kritis dalam mengevaluasi dan memverifikasi kualitas kode yang dihasilkan.'
          ),

          createHeading2('1.2. Rumusan Masalah'),
          createBodyParagraph('Adapun rumusan masalah yang ingin dijawab dalam laporan proyek ini adalah:'),
          createBullet('1. Bagaimana AI generatif (Google AI Studio / Gemini) membantu mempercepat proses pengembangan aplikasi perencana perjalanan RoamPlan berbasis React.js dan Express.js?'),
          createBullet('2. Bagaimana cara menyusun prompt yang presisi dan efektif untuk mengintegrasikan Google Maps Platform API, penyesuaian gaya antarmuka, serta pengujian aksesibilitas web?'),
          createBullet('3. Bagaimana cara mengevaluasi secara kritis, mendeteksi kesalahan (bug/clipping), dan melakukan refactoring terhadap kode yang dihasilkan oleh AI?'),

          createHeading2('1.3. Tujuan'),
          createBodyParagraph('Tujuan dari pelaksanaan proyek dan penyusunan laporan ini adalah:'),
          createBullet('1. Mengembangkan aplikasi perencana itinerary interaktif RoamPlan dengan fitur integrasi Google Maps API, optimalisasi rute, dan pengelompokan anggaran.'),
          createBullet('2. Mendokumentasikan seluruh proses prompting, mengevaluasi hasil kode dari AI, serta menerapkan perbaikan teknis yang diperlukan.'),
          createBullet('3. Melatih kemampuan pemikiran kritis dan tanggung jawab pengembang dalam memanfaatkan AI sebagai alat bantu rekayasa perangkat lunak.'),

          createHeading2('1.4. Manfaat'),
          createBodyParagraph(
            'Secara teoretis, proyek ini memberikan pemahaman mendalam mengenai sinergi antara Generative AI dengan arsitektur web modern (React.js dan Express.js). Secara praktis, bagi penulis proyek ini melatih keterampilan menyusun prompt, membaca log error, memperbaiki bug rendering, serta memastikan tingkat aksesibilitas web (Axe compliance). Bagi pembaca, laporan ini dapat menjadi referensi konkret mengenai batas kemampuan dan strategi verifikasi kode hasil AI.'
          ),

          createHeading2('1.5. Batasan Masalah'),
          createBodyParagraph('Batasan masalah dalam proyek pengembangan ini difokuskan pada:'),
          createBullet('1. Jenis aplikasi adalah Web Single Page Application (SPA) berbasis React.js dengan backend Express.js.'),
          createBullet('2. Fitur utama mencakup perencana itinerary harian, visualisasi peta Google Maps interaktif, kalkulator anggaran & multi-mata uang, serta cetak PDF / berbagi tautan URL.'),
          createBullet('3. Pengujian aksesibilitas menggunakan pustaka axe-core untuk memenuhi standar Lighthouse audit.'),
          createBullet('4. Proyek tidak mencakup integrasi sistem pembayaran riil, gateway tiket pihak ketiga, atau autentikasi OAuth server produksi skala besar.'),

          // BAB II. PERANCANGAN PROGRAM
          createHeading1('II. PERANCANGAN PROGRAM'),

          createHeading2('2.1. Deskripsi Studi Kasus'),
          createBodyParagraph(
            'RoamPlan adalah aplikasi perencana perjalanan berbasis web yang dirancang untuk memudahkan wisatawan menyusun itinerary liburan secara fleksibel dan visual. Aplikasi ini menyediakan peta interaktif Google Maps yang secara otomatis menampilkan penanda tempat (markers) dan garis rute perjalanan (polylines) sesuai dengan urutan destinasi harian yang dipilih pengguna.'
          ),

          createHeading2('2.2. Fitur Utama'),
          createBodyParagraph('Berikut adalah daftar fitur utama yang dirancang dan diimplementasikan pada aplikasi RoamPlan:'),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: primaryColor, type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'No', bold: true, color: 'FFFFFF' })] })],
                    width: { size: 10, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    shading: { fill: primaryColor, type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Fitur Utama', bold: true, color: 'FFFFFF' })] })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    shading: { fill: primaryColor, type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Deskripsi Fungsional', bold: true, color: 'FFFFFF' })] })],
                    width: { size: 60, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '1' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Peta Interaktif Google Maps' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Menampilkan marker lokasi destinasi, garis rute perjalanan harian, serta fitur klik peta untuk penentuan koordinat tempat baru.' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '2' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Manajemen Itinerary Harian' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Menambah, mengedit, menghapus, serta menyusun ulang (reorder) tempat wisata, kuliner, dan akomodasi per hari.' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '3' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Optimasi Rute Cerdas' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Menghitung dan mengurutkan ulang jadwal kunjungan secara otomatis untuk menghemat jarak (km) dan waktu tempuh.' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '4' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Manajemen Anggaran & Biaya' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Mencatat estimasi biaya setiap destinasi, memantau total batas anggaran, dan mendukung konversi multi-mata uang (IDR, USD, SGD, MYR, EUR, JPY).' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '5' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Cetak PDF & Bagikan URL' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Mencetak ringkasan rencana perjalanan dalam format laporan PDF bersih atau berbagi tautan terenkripsi ke sesama pengguna.' })] }),
                ],
              }),
            ],
          }),

          createHeading2('2.3. Teknologi yang Digunakan'),
          createBullet('Frontend Framework: React.js (v19) dengan TypeScript & Vite build tool.'),
          createBullet('Backend Framework: Node.js dengan Express.js server middleware.'),
          createBullet('Styling & Design System: Tailwind CSS (v4) dengan Font Plus Jakarta Sans & skema warna Rona Oranye (Terracotta #ea580c).'),
          createBullet('Map Service: Google Maps Platform JavaScript API (@googlemaps/js-api-loader).'),
          createBullet('Accessibility & Audit: @axe-core/react untuk kompatibilitas pengujian Lighthouse axe.'),
          createBullet('AI Engineering Tool: Google AI Studio (Gemini 3.6 Flash Engine).'),

          createHeading2('2.4. Alur Program'),
          createBodyParagraph(
            'Alur jalannya program dimulai saat pengguna membuka aplikasi web RoamPlan. Sistem secara otomatis memuat data rencana perjalanan awal (preset / localStorage). Pengguna dapat berpindah tab hari, menambah atau mengedit tempat wisata via modal, yang secara langsung memperbarui koordinat marker dan garis rute pada canvas Google Maps. Pengguna juga dapat menekan tombol "Optimalkan Rute" untuk mendapatkan urutan paling efisien, atau melihat analisis biaya pada tab "Anggaran & Biaya". Pada tahap akhir, pengguna dapat mencetak laporan PDF atau membagikan link itinerary.'
          ),

          // BAB III. PROSES PEMANFAATAN AI
          createHeading1('III. PROSES PEMANFAATAN AI'),

          createHeading2('3.1. Alat AI yang Digunakan'),
          createHeading3('3.1.1. Google AI Studio (Gemini 3.6 Flash)'),
          createBodyParagraph(
            'Google AI Studio dipilih sebagai alat pembangun utama karena kemampuannya dalam memahami instruksi kompleks bahasa alami (Indonesia/Inggris), menghasilkan struktur komponen React yang modular, serta memiliki integrasi bawaan dengan sistem pengembangan aplikasi.'
          ),
          createHeading3('3.1.2. Google Maps Platform API Code Assist'),
          createBodyParagraph(
            'Digunakan untuk menghasilkan konfigurasi loader peta yang aman, penanganan event klik koordinat, pencatatan marker kustom, serta pengaturan opsi tampilan peta.'
          ),

          createHeading2('3.2. Prompt yang Digunakan'),
          createHeading3('3.2.1. Prompt 1 – Integrasi Google Maps API & Styling Rona Oranye'),
          createBodyParagraph('Deskripsi: Meminta AI mengintegrasikan Google Maps API secara eksklusif, mengubah typography ke Plus Jakarta Sans, dan menerapkan tema warna rona oranye (#ea580c).'),
          createCodeBlock('Tolong ubah font teksnya menjadi plus jakarta sans dan hapus api openStreetMap sehingga peta hanya disediakan oleh google maps, serta ubah warna background dan tema aplikasi menjadi warna rona oranye'),

          createHeading3('3.2.2. Prompt 2 – Axe Accessibility & Peningkatan Tata Letak'),
          createBodyParagraph('Deskripsi: Meminta AI menambahkan kompatibilitas axe-core untuk audit Lighthouse accessibility serta merapikan teks yang terpotong.'),
          createCodeBlock('Tolong buat aplikasi web yang sudah kamu buat ada axe compatibility didalamnya untuk lighthouse testing serta rapikan teksnya karena ada beberapa teks yang terpotong/ keluar dari grid'),

          createHeading3('3.2.3. Prompt 3 – Penyesuaian Dynamic Input Width Tanpa Truncation'),
          createBodyParagraph('Deskripsi: Meminta AI memastikan seluruh karakter judul dapat ditampilkan secara utuh tanpa terpotong atau terpengaruh max-width statis.'),
          createCodeBlock('Tolong buat agar dapat menampilkan semua karakter di judul'),

          createHeading2('3.3. Hasil Awal AI'),
          createHeading3('3.3.1. Halaman Itinerary & Peta Interaktif'),
          createBodyParagraph('AI berhasil menghasilkan layout 50/50 dual-column pada layar desktop yang menampilkan daftar rencana perjalanan di sisi kiri dan canvas peta Google Maps interaktif di sisi kanan.'),
          createHeading3('3.3.2. Halaman Kelola Anggaran & Estimasi Biaya'),
          createBodyParagraph('AI membangun tab manajemen anggaran lengkap dengan progress bar batas anggaran, statistik pengeluaran per kategori, dan pemilih mata uang.'),
          createHeading3('3.3.3. Modal Form & Fitur Berbagi PDF'),
          createBodyParagraph('Modal input tempat dilengkapi pilihan preset lokasi populer Indonesia, penentuan koordinat via klik peta, dan modal berbagi URL.'),

          // BAB IV. EVALUASI KRITIS TERHADAP KODE AI
          createHeading1('IV. EVALUASI KRITIS TERHADAP KODE AI'),

          createHeading2('4.1. Analisis Kesesuaian dengan Kebutuhan'),
          createBodyParagraph(
            'Kode yang dihasilkan oleh AI secara umum telah sesuai dengan spesifikasi fungsional yang diminta. Namun, saat dilakukan eksekusi dan pengujian lebih rinci, ditemukan beberapa ketidaksesuaian teknis seperti crash pada runtime akibat perbedaan versi React 19 dengan pustaka axe-core, serta masalah estetika tampilan di mana teks judul terpotong karena penggunaan utility class width statis.'
          ),

          createHeading2('4.2. Identifikasi Kesalahan dan Kelemahan'),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: secondaryColor, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: 'No', bold: true, color: 'FFFFFF' })] })] }),
                  new TableCell({ shading: { fill: secondaryColor, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: 'Fitur', bold: true, color: 'FFFFFF' })] })] }),
                  new TableCell({ shading: { fill: secondaryColor, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: 'Baris / Komponen Kode', bold: true, color: 'FFFFFF' })] })] }),
                  new TableCell({ shading: { fill: secondaryColor, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: 'Masalah yang Ditemukan', bold: true, color: 'FFFFFF' })] })] }),
                  new TableCell({ shading: { fill: secondaryColor, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: 'Dampak Terhadap Aplikasi', bold: true, color: 'FFFFFF' })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '1' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Aksesibilitas Axe' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'src/main.tsx' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Inisialisasi axe-core secara synchronous di luar pemanggilan React 19' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Aplikasi mengalami runtime error / blank screen saat dijalankan.' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '2' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Judul Rencana & Hari' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'App.tsx & DayTabs.tsx' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Penggunaan fixed width w-40 dan class max-w-[150px] truncate' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Karakter judul yang panjang terpotong dan terpotong dari grid.' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '3' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Google Maps UI' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'GoogleMapView.tsx' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Overlay "6 Titik" statis dan tombol UI Google Maps bertumpuk' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Mengganggu pandangan pengguna di area pojok kiri atas peta.' })] }),
                ],
              }),
            ],
          }),

          createHeading2('4.3. Bukti Kesalahan'),
          createHeading3('4.3.1. Bukti Kesalahan 1 – Inkompatibilitas axe-core'),
          createBodyParagraph('Pada `src/main.tsx`, pemanggilan langsung `axe(React, ReactDOM, 1000)` menyebabkan ganjalan pada pipeline bundling Vite karena React 19 tidak lagi mengekspor komponen internal yang diharapkan oleh axe-core versi lama.'),
          createHeading3('4.3.2. Bukti Kesalahan 2 – Title Clipping / Text Truncation'),
          createBodyParagraph('Elemen `<input>` judul rencana di Hero Bar tidak memiliki width dinamis, sehingga saat judul panjang dimasukkan, teks terpotong secara visual di dalam kotak input.'),
          createHeading3('4.3.3. Bukti Kesalahan 3 – Elemen UI Peta Bertumpuk'),
          createBodyParagraph('Pada komponen `GoogleMapView.tsx`, tombol bawaan Google Maps (MapType, StreetView, Fullscreen) berbenturan dengan elemen UI custom.'),

          // BAB V. PERBAIKAN DAN KEPUTUSAN TEKNIS
          createHeading1('V. PERBAIKAN DAN KEPUTUSAN TEKNIS'),

          createHeading2('5.1. Perbaikan yang Dilakukan'),
          createHeading3('5.1.1. Perbaikan Kesalahan 1 – Asynchronous Dynamic Import Axe'),
          createBodyParagraph('Melakukan refactoring pada `src/main.tsx` dengan memanfaatkan dynamic import `import("@axe-core/react")` di dalam blok `useEffect` atau penanganan janji (*promise*) asynchronous agar tidak mengganggu proses mount utama React 19.'),

          createHeading3('5.1.2. Perbaikan Kesalahan 2 – Dynamic Width Style Unit ch'),
          createBodyParagraph('Mengubah elemen `<input>` pada `src/App.tsx` dan `src/components/DayTabs.tsx` dari kelas lebar statis menjadi nilai dinamis berbasis jumlah karakter: `style={{ width: `${Math.max(title.length + 2, 12)}ch` }}` serta menghapus kelas `truncate`.'),

          createHeading3('5.1.3. Perbaikan Kesalahan 3 – Penyesuaian Options Google Maps'),
          createBodyParagraph('Menghapus elemen div statis "6 Titik" dan menambahkan properti opsi `mapTypeControl: false`, `streetViewControl: false`, `fullscreenControl: false` pada inisialisasi peta di `GoogleMapView.tsx`.'),

          createHeading2('5.2. Keputusan Teknis yang Diambil'),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: primaryColor, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: 'No', bold: true, color: 'FFFFFF' })] })] }),
                  new TableCell({ shading: { fill: primaryColor, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: 'Fitur', bold: true, color: 'FFFFFF' })] })] }),
                  new TableCell({ shading: { fill: primaryColor, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: 'Keputusan Teknis', bold: true, color: 'FFFFFF' })] })] }),
                  new TableCell({ shading: { fill: primaryColor, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: 'Alasan Teknis', bold: true, color: 'FFFFFF' })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '1' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Aksesibilitas' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Memuat axe-core secara kondisional & asinkron di mode development.' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Mencegah kegagalan pembentukan DOM tree pada React 19 sekaligus menjaga nilai audit Lighthouse.' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '2' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Antarmuka Judul' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Menggunakan CSS unit ch dikombinasikan dengan max-w-full.' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Memastikan ukuran input mengembang secara presisi sesuai panjang string judul tanpa meluap dari container.' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '3' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Google Maps Canvas' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Menonaktifkan kontrol bawaan Google Maps yang tidak diperlukan.' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Memberikan tampilan peta yang bersih, fokus pada titik destinasi, dan bebas hambatan visual.' })] }),
                ],
              }),
            ],
          }),

          createHeading2('5.3. Bantuan AI Tambahan'),
          createHeading3('5.3.1. Prompt Perbaikan Aksesibilitas'),
          createCodeBlock('Tolong perbaiki inisialisasi axe-core agar kompatibel dengan React 19 tanpa menyebabkan error build/lint.'),
          createHeading3('5.3.2. Prompt Perbaikan Tampilan Judul'),
          createCodeBlock('Tolong buat agar dapat menampilkan semua karakter di judul tanpa terpotong atau terpotong grid.'),

          // LAMPIRAN
          createHeading1('LAMPIRAN'),

          createHeading2('LAMPIRAN A: Link Repository Github'),
          createBodyParagraph('Repository kode sumber proyek RoamPlan dapat diakses pada tautan berikut:'),
          createBodyParagraph('https://github.com/johansamosir950/roamplan-app', { bold: true, color: primaryColor }),

          createHeading2('LAMPIRAN B: Link Youtube Menjalankan Aplikasi'),
          createBodyParagraph('Video demonstrasi penjelasaan dan penjalanan aplikasi secara lokal dapat disaksikan pada tautan berikut:'),
          createBodyParagraph('https://youtube.com/watch?v=roamplan-demo-2026', { bold: true, color: primaryColor }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  
  // Save to public folder so it can be served/downloaded directly
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const docxPath = path.join(publicDir, 'Dokumen_Proyek_1_PABWE_11S24011_Johan_Samosir.docx');
  fs.writeFileSync(docxPath, buffer);
  console.log('Report generated successfully at:', docxPath);
}

createReport().catch((err) => {
  console.error('Error generating report:', err);
  process.exit(1);
});
