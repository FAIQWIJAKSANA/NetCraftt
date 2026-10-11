# 🌐 NetCraft: Hardware Lab & Troubleshoot
> **Media Pembelajaran Interaktif Perangkat Keras Jaringan Berbasis Problem-Based Learning (PBL)**  
> Kurikulum Merdeka • SMK Fase E • Bidang Keahlian Teknologi Informasi (Informatika / TJKT)

---

## 📖 Tentang Aplikasi

**NetCraft** adalah aplikasi media pembelajaran interaktif yang dirancang khusus untuk memenuhi Capaian Pembelajaran (CP) SMK Fase E pada elemen Jaringan Komputer dan Internet. 

Aplikasi ini menggabungkan model pembelajaran **Problem-Based Learning (PBL)** dengan elemen **gamifikasi interaktif**, membantu siswa memahami fungsi perangkat keras jaringan, anatomi port, cara mengatasi masalah koneksi (*troubleshooting*), hingga merancang topologi jaringan di dunia nyata.

---

## ✨ Fitur Utama

### 👨‍🎓 Mode Siswa (Teknisi Muda)
1. **🎴 Hardware Deck**:
   - Eksplorasi anatomi fisik 6 perangkat jaringan utama: *Router, Switch Hub, Access Point, Modem/ONT, NIC/LAN Card, dan Media Transmisi UTP/RJ-45*.
   - Informasi analogi logika, fungsi lapisan OSI (*Layer 1, 2, 3*), spesifikasi port (*WAN vs LAN, Gigabit, PoE*), panduan *DOs & DONTs*, serta audio pelafalan istilah teknis.
2. **🔥 Tinder Swipe Quiz**:
   - Game kuis gestur geser (*Swipe Kanan = Benar, Swipe Kiri = Salah*) untuk menguji pemahaman konsep dasar dengan cepat dan menyenangkan.
3. **🧩 NetFix Lab (Brain Out Troubleshooting)**:
   - 6 Level simulasi teka-teki pemecahan masalah kabel dan port secara visual (*drag-and-drop*).
4. **📋 Matriks PBL (Studi Kasus Kelompok)**:
   - 8 Kasus *troubleshooting* kehidupan sehari-hari yang berbeda untuk tiap kelompok (misal: Wi-Fi sekolah overload, looping switch, kabel fiber putus, dsb).
   - Dilengkapi panduan pertanyaan pemantik, lembar kerja esai solusi, dan Mode Presentasi Fullscreen untuk sidang kelas.

### 👨‍🏫 Mode Guru (Instruktur Lab)
- **📊 Teacher Dashboard**:
  - Monitoring skor XP siswa dan progres capaian kelompok secara real-time.
  - Pemeriksaan dan evaluasi solusi esai PBL tiap kelompok.
  - Akses kunci jawaban dan panduan teknis guru.
  - *Default Kata Sandi Guru*: `guru123`

---

## 🛠️ Teknologi yang Digunakan

- **Frontend (Mobile & Web)**:
  - React Native / Expo SDK 50
  - React Navigation
  - React Native Reanimated & PanResponder (Drag & Drop Gestures)
  - Vector Icons (@expo/vector-icons)
- **Backend (API Service)**:
  - Node.js & Express.js
  - Prisma ORM
  - SQLite Database
  - RESTful API Architecture

---

## 🚀 Panduan Menjalankan Project

### 1. Prasyarat Sistem
- Node.js (versi 18 ke atas)
- NPM atau Yarn
- Expo Go (pada smartphone Android/iOS) atau Browser modern (Chrome/Edge)

### 2. Menjalankan Backend (Server API)
```bash
# Masuk ke direktori backend
cd backend

# Install dependensi
npm install

# Jalankan migrasi database
npx prisma db push

# Isi data awal (seed)
node prisma/seed.js

# Jalankan server
npm start
```
Server akan berjalan di `http://localhost:5000`.

### 3. Menjalankan Frontend (Aplikasi Mobile / Web)
```bash
# Masuk ke direktori mobile
cd mobile

# Install dependensi
npm install

# Menjalankan di Browser (Web)
npm run web

# Menjalankan di Smartphone (Expo Go)
npx expo start
```

---

## 📁 Struktur Direktori

```text
NetCraft/
├── backend/                # Server REST API Express & Prisma ORM
│   ├── prisma/             # Schema database SQLite & file seed data
│   ├── src/                # Controller, Route, dan Model
│   └── server.js           # Entry point backend
├── mobile/                 # Frontend React Native (Expo)
│   ├── assets/             # Gambar perangkat & aset visual puzzle
│   ├── src/
│   │   ├── constants/      # Tema warna (cyberpunk/modern dark)
│   │   ├── context/        # State management (AppContext)
│   │   ├── navigation/     # Navigasi antar halaman
│   │   ├── screens/        # Semua tampilan layar antarmuka
│   │   └── services/       # Komunikasi API & offline fallback
│   ├── App.js              # Entry point aplikasi mobile
│   └── app.json            # Konfigurasi Expo
└── README.md               # Dokumentasi utama proyek
```

---

## 👥 Pengembang
Dikembangkan untuk implementasi pembelajaran inovatif SMK Fase E Informatika.  
**Kontributor**: Faiq Wijaksana
