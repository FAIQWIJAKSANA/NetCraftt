# RANCANGAN PENGEMBANGAN APLIKASI MOBILE: NETCRAFT
## Media Pembelajaran Interaktif Perangkat Keras Jaringan Berbasis Problem-Based Learning (PBL)
**Diselaraskan dengan RPP Informatika SMK Kelas X (Fase E)**

---

## 1. INFORMASI UMUM PROYEK

* **Nama Aplikasi:** **NetCraft: Hardware Lab & Troubleshoot**
* **Platform:** Mobile Application (Android / iOS)
* **Teknologi Utama:**
  * **Frontend Mobile:** React Native (Expo / CLI) + React Native Reanimated + Gesture Handler
  * **Backend API:** Node.js & Express.js (RESTful API)
  * **Database:** PostgreSQL / SQLite / MongoDB (via Prisma ORM / Mongoose)
* **Target Pengguna:** Peserta Didik SMK Fase E / Kelas X (Awal Semester Ganjil) & Guru Pengampu Informatika
* **Mata Pelajaran:** Informatika (Elemen: Jaringan Komputer)
* **Topik/Materi:** Identifikasi Perangkat Keras & Infrastruktur Jaringan Lokal (*Hardware Networking*)
* **Pendekatan Pedagogis:** *Problem-Based Learning* (PBL), *Deep Learning*, & Berpikir Kritis

---

## 2. LATAR BELAKANG & KESELARASAN DENGAN RPP

Rancangan aplikasi ini disusun berdasarkan analisis kebutuhan RPP Microteaching SMK Kelas X:
1. **Karakteristik Siswa:** Siswa baru lulus SMP yang sebagian besar baru pertama kali mengenal perangkat jaringan komputer secara formal (*Zero-Experience*). Materi dan asesmen tidak boleh menakutkan, minim jargon rumit (tanpa CLI/subnetting), dan berfokus pada **pengenalan fisik, fungsi dasar, dan troubleshooting kabel/port**.
2. **Kebutuhan Kasus Nyata (PBL):** Mengangkat studi kasus dari RPP yaitu *"Jaringan Ruko 2 Lantai yang Sering Down Akibat Beban Ditumpuk pada Satu Router Rumahan Bawaan ISP"*.
3. **Luaran Pembelajaran (Output):** Siswa mampu menganalisis kebutuhan port dan merumuskan **Matriks Rekomendasi Hardware** (*Hardware Recommendation List*) yang optimal dan rasional.

---

## 3. MODUL FITUR UTAMA APLIKASI

### Modul 1: "Hardware Pocket Deck" (Kartu Rangkuman Interaktif)
Media belajar mandiri siswa untuk mengenali karakteristik fisik dan fungsi alat secara visual:
* **Format Tampilan:** Carousel kartu swipe horizontal dengan palet warna khusus tiap kategori.
* **Fitur Hotspot Anatomi Interaktif:** Gambar resolusi tinggi tampak depan dan belakang dengan titik pin berdenyut yang dapat di-tap:
  * *Pin Port WAN (Biru):* Menjelaskan fungsi jalur masuk internet dari ISP.
  * *Pin Port LAN (Kuning):* Menjelaskan fungsi pembagi kabel ke PC/Switch lokal.
  * *Pin Lampu LED:* Arti kedip daya (*Power*) dan sambungan (*Internet/Act*).
  * *Pin Tombol Reset:* Fungsi reset pengaturan pabrik jika lupa kata sandi.
* **Fitur Audio Pelafalan (*Pronunciation Guide*):** Tombol suara untuk membantu siswa melafalkan istilah asing dengan tepat (*"NIC"*, *"RJ-45"*, *"PoE"*, *"Switch Unmanaged"*).
* **6 Perangkat Wajib Sesuai RPP:**
  1. *Router* (Wireless / Standalone)
  2. *Switch Hub* (Unmanaged vs Managed)
  3. *Access Point* (Indoor Ceiling/Dome)
  4. *Modem / Fiber ONT*
  5. *NIC (Network Interface Card / LAN Card PC)*
  6. *Media Transmisi (Kabel UTP Cat6 & Konektor RJ-45)*

---

### Modul 2: "NetFix Lab" (Kuis Simulasi ala *Brain Out*)
Kuis troubleshooting interaktif berbasis sentuhan (*gesture drag & drop*):
* **Layar Permainan:** Kanvas visual dengan objek interaktif (kabel, colokan, tombol saklar, perangkat).
* **Daftar 6 Skenario Level:**
  * **Level 1 (C3 - Port Salah):** Kabel internet dari modem dicolokkan ke port LAN router. Siswa men-*drag* kabel ke port WAN (biru) sampai lampu internet menyala.
  * **Level 2 (C3 - Daya Mati):** Switch di rak mati total. Siswa menancapkan adaptor listrik yang kendor dan menggeser saklar ke posisi *ON*.
  * **Level 3 (C4 - Sinyal Lemah):** Access point diletakkan di kolong meja lantai 1. Siswa memindahkan AP ke plafon lantai 2 agar sinyal Wi-Fi hijau merata.
  * **Level 4 (C4 - PC Baru Tanpa Port LAN):** Siswa memasang kartu NIC ke slot CPU komputer sebelum mencolokkan kabel LAN.
  * **Level 5 (C5 - Broadcast Loop):** Ada kabel yang kedua ujungnya dicolokkan ke switch yang sama. Siswa mencabut kabel loop untuk memulihkan jaringan.
  * **Level 6 (C5 - Ruang Rapat Gedung B):** Siswa menghubungkan kabel LAN antar-gedung ke Access Point lokal sesuai soal kuis RPP.
* **Fitur Bantuan & Deep Learning:**
  * Tombol *Hint* (3 kuota harian) berisi pertanyaan pemicu bernalar kritis.
  * Pop-up penjelasan ilmiah setelah level berhasil dipecahkan.

---

### Modul 3: "Tinder-Style Quick Swipe" (Uji Cepat Benar / Salah)
Instrumen asesmen harian alternatif yang menyenangkan dan tidak membosankan bagi anak kelas 10:
* **Mekanik:** Siswa menggeser (*swipe*) kartu ke **Kanan (BENAR)** atau ke **Kiri (SALAH)**.
* **Contoh Pernyataan:**
  * *"Switch berfungsi untuk memancarkan sinyal Wi-Fi tanpa kabel."* $\rightarrow$ **Swipe Kiri (Salah)**.
  * *"Kabel dari modem ISP harus masuk ke port WAN berwarna biru pada router."* $\rightarrow$ **Swipe Kanan (Benar)**.
* **Feedback Spontan:** Memberikan getaran haptic dan pembahasan 1 kalimat secara instan.

---

### Modul 4: "PBL Case Solver & Matriks Belanja" (Studi Kasus Ruko 2 Lantai)
Menjawab Sintaks 3 & 4 Problem-Based Learning pada RPP:
1. **Interactive Case Briefing:** Visual denah ruko 2 lantai (12 desainer di lantai 1 butuh LAN cepat; tim marketing dan tamu di lantai 2 butuh Wi-Fi; router rumahan ISP overload).
2. **Kalkulator Kebutuhan Port:**
   * Input: 12 PC + 1 Uplink Router + 2 Cadangan = 15 Port.
   * Rekomendasi otomatis: *"Switch 8-Port tidak muat, gunakan Switch 16-Port atau 24-Port!"*
3. **Form Matriks Rekomendasi Hardware:**
   * Tabel input terstruktur: Nama Alat, Fungsi Teknis, Spesifikasi/Jumlah Port, dan Alasan Pemilihan.
4. **Smart Validator:** Deteksi otomatis jika siswa lupa mengalokasikan Access Point untuk lantai 2 atau salah memilih kapasitas port switch.
5. **Mode Presentasi:** Mengubah matriks belanja menjadi tampilan slide bersih di layar ponsel untuk dipresentasikan di depan kelas.

---

### Modul 5: Modul Guru & Instrumen Penilaian Digital
Menghilangkan penggunaan kertas bagi guru saat menilai di kelas (Sintaks 5 RPP):
* **Penilaian Unjuk Kerja Sekali Sentuh:** Skala bintang 1–4 untuk aspek:
  1. *Keteperincian Solusi Hardware*
  2. *Penguasaan Fungsi Teknis*
  3. *Gotong Royong & Bernalar Kritis*
* **Perhitungan Rumus Otomatis Sesuai RPP:**
  $$\text{Nilai Akhir} = \left(\frac{\text{Total Skor}}{8}\right) \times 100$$
* **Statistik Pemahaman Kelas:** Visual persentase penguasaan materi siswa (Router, Switch, AP) untuk bahan refleksi guru di akhir sesi.

---

## 4. SISTEM GAMIFIKASI & DAYA TARIK BELAJAR

Untuk mempertahankan motivasi belajar siswa kelas 10:
* **Gelar Pangkat Teknisi (Progression):**
  * 🥉 *Siswa Magang* $\rightarrow$ 🥈 *Teknisi Kabel* $\rightarrow$ 🥇 *Arsitek Jaringan Cilik*.
* **Lencana Kehormatan (*Badges*):**
  * 🎖️ *Detektif Port* (Selesai Level 1 tanpa hint).
  * ⚡ *Jari Kilat* (Menjawab 5 kuis swipe benar < 30 detik).
  * 🤝 *Kompak Maksimal* (Berhasil submit matriks kelompok).
* **Feedback Sensorik:** Getaran haptic ringan dan efek audio khas (*"klik"* kabel tertancap, suara kemenangan puzzle).

---

## 5. ARSITEKTUR TEKNIS & INTEGRASI SISTEM

### A. Alur Navigasi Antarmuka (React Navigation)
```
[ Root Stack Navigator ]
  ├── SplashScreen (Logo Interaktif)
  ├── RoleSelectScreen (Siswa / Guru)
  │
  ├── [ SISWA FLOW ] ➔ BottomTabNavigator
  │     ├── Tab 1: 🏠 Beranda (Dashboard & Kasus PBL)
  │     ├── Tab 2: 🃏 Hardware Deck (Kartu Anatomi)
  │     ├── Tab 3: 🎮 NetFix Lab (Puzzle & Tinder Swipe)
  │     └── Tab 4: 📝 Matriks PBL (Daftar Belanja Kelompok)
  │
  │     └── Fullscreen Modals:
  │           ├── PuzzleGameScreen (Kanvas Drag & Drop)
  │           ├── TinderSwipeScreen (Uji Cepat)
  │           └── PresentationViewScreen (Slide Hasil Karya)
  │
  └── [ GURU FLOW ] ➔ TeacherDashboard
        ├── Monitoring Matriks Kelompok
        ├── Digital Scoring Rubric (RPP Form)
        └── Export Rekap Nilai Siswa
```

---

### B. Struktur Folder Proyek Backend (Express.js)
```
netcraft-backend/
├── src/
│   ├── config/             # Koneksi Database
│   ├── controllers/        # Logika Bisnis (Auth, Hardware, Puzzle, PBL, Assessment)
│   ├── models/             # Skema Basis Data
│   ├── routes/             # Rute Endpoint REST API
│   ├── middlewares/        # Validasi & Autentikasi Peran
│   └── seeders/            # Data Awal (6 Hardware, 6 Level Puzzle, Kuis Swipe)
├── server.js
└── package.json
```

---

### C. Skema Basis Data (Tabel Utama)
1. **`groups`**: `id`, `name`, `class_name`, `access_code`.
2. **`users`**: `id`, `group_id`, `name`, `role` (STUDENT/TEACHER), `xp_points`, `rank_title`.
3. **`hardware_cards`**: `id`, `name`, `category`, `analogy`, `image_url`, `hotspots_json`, `audio_url`.
4. **`puzzles`**: `id`, `level_number`, `title`, `story`, `hint`, `initial_state_json`, `solution_condition_json`, `explanation_text`.
5. **`quiz_swipes`**: `id`, `statement`, `image_url`, `is_correct`, `explanation`.
6. **`pbl_matrices`**: `id`, `group_id`, `hardware_name`, `function_purpose`, `port_specs`, `justification`.
7. **`teacher_assessments`**: `id`, `group_id`, `score_gotong_royong`, `score_bernalar_kritis`, `score_hardware_accuracy`, `final_grade`.

---

### D. Daftar Endpoint REST API Utama

| Metode | Endpoint | Deskripsi Fungsi |
| :--- | :--- | :--- |
| **POST** | `/api/auth/login` | Autentikasi siswa (pilih kelas & kelompok) / login guru. |
| **GET** | `/api/hardware` | Mengambil data 6 kartu hardware & data hotspot port. |
| **GET** | `/api/quiz/swipes` | Mengambil daftar kartu kuis Tinder Swipe. |
| **POST** | `/api/quiz/swipes/submit` | Menyimpan skor kuis swipe dan menambahkan XP siswa. |
| **GET** | `/api/puzzles` | Mengambil progres level puzzle NetFix Lab. |
| **POST** | `/api/puzzles/:id/complete`| Menyimpan status puzzle selesai, bintang (1–3), & XP. |
| **GET** | `/api/pbl/matrix/:groupId` | Mengambil rancangan matriks belanja kelompok. |
| **POST** | `/api/pbl/matrix/:groupId`| Menambah/memperbarui baris rekomendasi belanja. |
| **POST** | `/api/assessments/grade` | Guru mengirim nilai rubrik unjuk kerja kelompok. |
| **GET** | `/api/assessments/summary` | Guru melihat rekap nilai dan statistik kelas. |

---

## 6. NILAI JUAL DI HADAPAN DOSEN PENGAMPU

1. **Relevansi Pedagogis Kuat:** Mengimplementasikan seluruh sintaks Problem-Based Learning (PBL) dan rubrik penilaian resmi Kurikulum Merdeka (bukan sekadar aplikasi tebak-tebakan).
2. **Inovasi Gamifikasi Unik:** Memadukan konsep puzzle kinestetik visual ala *Brain Out* dan *Tinder-Style Swipe* untuk mengatasi kebosanan belajar siswa kelas 10.
3. **Ramah Pemula (*Zero-Experience Friendly*):** Materi disesuaikan dengan bahasa dan analogi keseharian tanpa membuat siswa tertekan oleh istilah rumit.
4. **Arsitektur Rekayasa Perangkat Lunak Modern:** Pemisahan *frontend* mobile berbasis React Native dan *backend* RESTful Express.js dengan arsitektur kode bersih dan siap diuji coba.
