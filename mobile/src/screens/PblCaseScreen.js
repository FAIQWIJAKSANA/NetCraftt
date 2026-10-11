import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useApp } from '../context/AppContext';

// 8 Kasus Troubleshooting Kehidupan Sehari-hari yang Berbeda Tiap Kelompok (Revisi E.1 - E.4)
const GROUP_CASES = {
  1: {
    focusDevice: 'Router (Wireless & DHCP)',
    title: 'Kasus 1: Wi-Fi Sekolah Ngelag Parah Saat Jam Istirahat',
    realLifeStory:
      'Saat jam istirahat tiba, 50 HP siswa dan laptop guru tersambung serentak ke Wi-Fi sekolah. Tiba-tiba koneksi langsung lemot luar biasa! Beberapa HP siswa tertulis "Obtaining IP Address..." terus-menerus dan gagal tersambung, sementara guru tidak bisa membuka browser.',
    coreIssue: 'Kapasitas pembagian IP (DHCP Server) dan memori pada router rumahan standar terbatas sehingga crash saat dibebani puluhan perangkat sekaligus.',
    guidingQuestions: {
      q1: 'Mengapa router rumahan bawaan ISP tidak sanggup melayani 50 HP siswa sekaligus?',
      q2: 'Lampu indikator apa di router yang harus dicek pertama kali saat internet mendadak lemot?',
      q3: 'Apa solusi perbaikan yang harus dilakukan pada perangkat Router agar jaringan tidak macet lagi?',
      q4: 'Bagaimana cara mencegah siswa tidak menyedot seluruh kuota internet sekolah?',
    },
    defaultAnswers: {
      ans1: 'Karena memori RAM router rumahan kecil dan kapasitas tabel DHCP-nya penuh, sehingga router kehabisan alamat IP untuk dibagikan ke HP siswa.',
      ans2: 'Lampu LED Internet (Globe) dan lampu Wi-Fi. Jika berkedip oranye/merah atau router terasa sangat panas, router sedang overload.',
      ans3: 'Mengganti router utama dengan Standalone Router (seperti Mikrotik) yang mampu menampung banyak pengguna dan mengatur kuota bandwidth per perangkat.',
      ans4: 'Menerapkan limit bandwidth per user dan memisahkan kata sandi Wi-Fi untuk staf guru dan siswa.',
    },
  },
  2: {
    focusDevice: 'Switch Hub (Port & Kapasitas)',
    title: 'Kasus 2: Komputer Lab Gagal Kirim File Ujian CBT ke Server',
    realLifeStory:
      'Di laboratorium komputer sekolah, ada 25 PC siswa yang sedang ujian CBT serentak. Di tengah ujian, 10 komputer di barisan belakang mendadak disconnected dan gagal submit jawaban ke server lokal. Saat dicek, kabel-kabel LAN dicabang menggunakan switch kecil 8-port yang ditumpuk-tumpuk.',
    coreIssue: 'Penggunaan switch kecil (8-port) yang di-daisy chain (dicabang beruntun) menyebabkan bottleneck dan penurunan kecepatan drastis.',
    guidingQuestions: {
      q1: 'Mengapa mencabang-cabang banyak switch kecil 8-port berbahaya bagi jaringan lab?',
      q2: 'Bagian fisik apa pada switch yang harus diperiksa teknisi saat 10 PC mendadak offline?',
      q3: 'Alat switch apa yang seharusnya dipasang di lab tersebut untuk menggantikan switch kecil?',
      q4: 'Apa tips pemasangan kabel di switch agar rapi dan mudah dirawat?',
    },
    defaultAnswers: {
      ans1: 'Karena kabel penghubung antar-switch (uplink) menjadi macet total (bottleneck) menahan beban lalu lintas data dari belasan PC sekaligus.',
      ans2: 'Periksa lampu LED port uplink dan lampu power pada switch belakang. Cek apakah ada kabel yang kendor atau lampu mati.',
      ans3: 'Memasang 1 unit Switch 24-Port Gigabit terpusat di rak server agar seluruh 25 PC terhubung langsung dengan kecepatan 1000 Mbps.',
      ans4: 'Memberi label nomor pada setiap ujung kabel LAN dan menggunakan kabel patch cord standar pabrik.',
    },
  },
  3: {
    focusDevice: 'Access Point (Penempatan & Sinyal)',
    title: 'Kasus 3: Sinyal Wi-Fi di Lantai 2 Cuma 1 Bar & Sering Putus',
    realLifeStory:
      'Guru di ruang guru lantai 2 sering mengeluh tidak bisa upload nilai e-Rapor karena Wi-Fi hanya dapat 1 bar dan sering terputus. Padahal modem dan router sekolah di lantai 1 sangat kencang (100 Mbps). Sinyal terhalang pelat beton cor lantai ruko yang tebal.',
    coreIssue: 'Gelombang radio Wi-Fi 2.4/5GHz teredam parah oleh cor beton dan besi lantai gedung.',
    guidingQuestions: {
      q1: 'Mengapa sinyal Wi-Fi dari lantai 1 tidak bisa menembus dengan baik ke lantai 2?',
      q2: 'Mengapa menaruh pemancar Wi-Fi di kolong meja besi adalah kesalahan fatal?',
      q3: 'Alat apa yang harus dipasang di lantai 2 dan di mana posisi pemasangan paling ideal?',
      q4: 'Bagaimana cara menghubungkan alat tersebut dari lantai 1 ke lantai 2?',
    },
    defaultAnswers: {
      ans1: 'Karena pelat beton cor dan rangka besi lantai bertindak sebagai peredam sinyal radio Wi-Fi frekuensi tinggi.',
      ans2: 'Karena logam meja besi memantulkan dan menyerap gelombang elektromagnetik sehingga sinyal mati di kolong meja.',
      ans3: 'Memasang Access Point (PoE) khusus di plafon tengah ruangan lantai 2 agar sinyal memancar dari atas tanpa halangan.',
      ans4: 'Menarik satu jalur kabel LAN UTP Cat6 dari switch lantai 1 menuju ke port PoE Access Point di lantai 2.',
    },
  },
  4: {
    focusDevice: 'Modem / Fiber ONT (Jalur Luar ISP)',
    title: 'Kasus 4: Lampu LOS Modem Kedip Merah Terang Saat Hujan',
    realLifeStory:
      'Di kantor TU sekolah, internet tiba-tiba mati total saat hujan deras disertai angin kencang. Siswa mengira komputernya yang rusak. Saat staf memeriksa perangkat modem optik ISP, lampu bertuliskan "LOS" berkedip merah terang tanpa henti.',
    coreIssue: 'Kabel serat optik dari tiang luar putus atau tertekuk sehingga sinyal cahaya laser tidak sampai ke modem.',
    guidingQuestions: {
      q1: 'Apa arti dari kedipan lampu merah bertuliskan "LOS" pada modem fiber optik?',
      q2: 'Apakah masalah ini bisa diselesaikan dengan merestart komputer siswa? Jelaskan alasannya.',
      q3: 'Apa langkah awal yang harus diperiksa teknisi pada fisik kabel kuning kecil di belakang modem?',
      q4: 'Kapan pihak sekolah harus menghubungi call center teknisi ISP luar?',
    },
    defaultAnswers: {
      ans1: 'LOS artinya "Loss of Signal" (Kehilangan Sinyal Cahaya), menandakan modem tidak menerima denyutan sinar optik dari tiang ISP.',
      ans2: 'Tidak bisa, karena gangguannya berada di jalur fisik luar penyedia internet, bukan di sistem komputer lokal.',
      ans3: 'Memeriksa apakah kabel kuning fiber optik tertekuk patah, terjepit pintu, atau konektor birunya terlepas.',
      ans4: 'Jika kabel di dalam ruangan aman dan lampu LOS tetap merah, segera hubungi ISP karena kabel putus di tiang jalan raya.',
    },
  },
  5: {
    focusDevice: 'Kabel UTP & Konektor RJ-45 (Media Fisik)',
    title: 'Kasus 5: PC Kasir Sering Muncul "Network Cable Unplugged"',
    realLifeStory:
      'Komputer kasir kantin dan admin SPP sekolah sering mengalami koneksi putus-nyambung setiap kali meja tersenggol. Di layar monitor sering muncul silang merah "Network Cable Unplugged". Ujung kepala konektor RJ-45 tampak goyang dan klip penguncinya sudah patah.',
    coreIssue: 'Pin kuningan konektor RJ-45 tidak menempel sempurna pada port LAN akibat patahnya pengunci plastik.',
    guidingQuestions: {
      q1: 'Mengapa patahnya pengunci kecil pada konektor RJ-45 bisa membuat internet sering putus-nyambung?',
      q2: 'Apa dampak jika urutan warna 8 kawat di dalam kabel UTP dipasang acak tanpa standar T568B?',
      q3: 'Alat dan bahan apa saja yang dibutuhkan teknisi untuk memperbaiki kabel tersebut?',
      q4: 'Bagaimana cara memastikan kabel yang baru diperbaiki sudah berfungsi 100% sebelum dicolok ke PC?',
    },
    defaultAnswers: {
      ans1: 'Konektor menjadi longgar sehingga pin tembaga di dalam kepala RJ-45 tidak menyentuh pin port PC saat meja bergetar.',
      ans2: 'Kecepatan transfer data akan turun drastis (hanya 10 Mbps) dan sering terjadi packet loss akibat gangguan magnetik antarkawat.',
      ans3: 'Tang Crimping RJ-45, konektor RJ-45 baru, pengupas kabel (wire stripper), dan pelindung plug boot.',
      ans4: 'Mengujinya menggunakan alat LAN Tester. Pastikan lampu LED nomor 1 sampai 8 menyala berurutan secara serempak.',
    },
  },
  6: {
    focusDevice: 'NIC / LAN Card (Komponen PC)',
    title: 'Kasus 6: PC Baru Lab Tidak Ada Internet & Lampu Port Mati',
    realLifeStory:
      'Sekolah baru merakit 10 PC baru di ruang multimedia. Kabel LAN dari switch yang masih normal sudah dicolokkan ke lubang belakang PC, namun di Windows muncul ikon bola dunia silang merah "No Internet", dan lampu hijau kecil di lubang LAN PC sama sekali tidak menyala.',
    coreIssue: 'Komponen kartu jaringan (NIC) belum terpasang kencang di slot PCIe atau driver chipset jaringan belum diinstal.',
    guidingQuestions: {
      q1: 'Jika kabel LAN normal tapi lampu di port PC mati total, apa kemungkinan penyebab fisiknya?',
      q2: 'Di slot motherboard mana kartu LAN Card (NIC) dipasangkan di dalam casing CPU?',
      q3: 'Bagaimana cara mengecek apakah kartu NIC sudah dikenali oleh sistem operasi komputer?',
      q4: 'Apa langkah perbaikan yang harus dilakukan teknisi lab?',
    },
    defaultAnswers: {
      ans1: 'Kartu NIC belum terpasang pas di motherboard, lempengan kuningan berdebu, atau port LAN pada motherboard rusak/mati.',
      ans2: 'Dipasang pada slot ekspansi PCI-Express (PCIe x1 atau PCIe x16) pada papan motherboard.',
      ans3: 'Membuka menu Device Manager di Windows dan memeriksa bagian "Network Adapters".',
      ans4: 'Membuka casing PC, menancapkan ulang kartu NIC sampai berbunyi klik, mengunci bautnya, dan menginstal driver resminya.',
    },
  },
  7: {
    focusDevice: 'Looping Switch (Broadcast Storm)',
    title: 'Kasus 7: Jaringan Kantor Lumpuh Total Karena Kabel Colok Sendiri',
    realLifeStory:
      'Seorang siswa berniat merapikan kabel LAN yang menjuntai di bawah meja lab. Ia menemukan satu kabel biru yang tergeletak, lalu menancapkan ujung satu ke Port 5 dan ujung satunya ke Port 6 pada switch yang sama. Tiba-tiba seluruh komputer kantor mati total dan lampu switch berkedip liar!',
    coreIssue: 'Terjadi Network Loop (Broadcast Storm) di mana paket data berputar tanpa henti dan melumpuhkan kapasitas switch.',
    guidingQuestions: {
      q1: 'Apa yang terjadi pada lalu lintas data jika kedua ujung satu kabel dicolokkan ke switch yang sama?',
      q2: 'Mengapa fenomena ini disebut "Badai Broadcast" (Broadcast Storm)?',
      q3: 'Apa langkah pertama yang harus dilakukan teknisi saat melihat seluruh lampu switch berkedip histeris?',
      q4: 'Bagaimana cara mencegah agar siswa tidak sembarangan mencolokkan kabel loop di lab?',
    },
    defaultAnswers: {
      ans1: 'Paket data akan berputar-putar tanpa henti antar-port, menghabiskan seluruh memori switch dalam hitungan detik.',
      ans2: 'Karena paket broadcast digandakan terus-menerus dan menyapu bersih seluruh kapasitas bandwidth jaringan lokal.',
      ans3: 'Segera mencari dan mencabut salah satu ujung kabel yang menghubungkan dua port pada switch yang sama.',
      ans4: 'Memberi edukasi kepada siswa dan menggunakan Managed Switch yang memiliki fitur "Loop Protection / STP".',
    },
  },
  8: {
    focusDevice: 'Bandwidth & Manajemen Pengguna',
    title: 'Kasus 8: Rapat Online Kepala Sekolah Putus Karena Siswa Nonton Video',
    realLifeStory:
      'Kepala sekolah sedang melakukan video conference zoom penting dengan dinas pendidikan di ruang kepala sekolah. Tiba-tiba video freeze dan suara patah-patah karena di saat yang sama banyak siswa di kantin sedang streaming YouTube menggunakan Wi-Fi yang sama.',
    coreIssue: 'Tidak adanya pemisahan jalur jaringan (SSID terpisah) dan ketiadaan pembatasan kuota kecepatan (Bandwidth Management).',
    guidingQuestions: {
      q1: 'Mengapa aktivitas streaming video siswa bisa mengganggu rapat online kepala sekolah?',
      q2: 'Di perangkat jaringan mana fitur pembagian jatah bandwidth (kecepatan internet) diatur?',
      q3: 'Apa solusi konfigurasi yang harus diterapkan kelompokmu pada jaringan sekolah tersebut?',
      q4: 'Bagaimana cara memisahkan Wi-Fi khusus pimpinan/guru dengan Wi-Fi publik siswa?',
    },
    defaultAnswers: {
      ans1: 'Karena streaming video menyedot seluruh kuota bandwidth unduh (download), sehingga panggilan Zoom kehabisan jalur data.',
      ans2: 'Diatur di dalam perangkat Router utama menggunakan fitur QoS (Quality of Service) atau Bandwidth Queue.',
      ans3: 'Memberikan prioritas bandwidth tinggi khusus untuk ruang pimpinan dan membatasi kecepatan maksimal tiap siswa di kantin.',
      ans4: 'Membuat 2 nama Wi-Fi (SSID) yang berbeda dengan kata sandi terpisah dan pengaturan VLAN di Access Point.',
    },
  },
};

export default function PblCaseScreen({ navigation }) {
  const { currentGroup, addXp } = useApp();

  // Tentukan Kasus Sesuai Nomor Kelompok (Revisi E.1 & E.2)
  // Ekstrak angka dari nama kelompok, misal "Kelompok 3" -> 3. Default ke 1.
  const extractGroupNum = (name) => {
    if (!name) return 1;
    const match = name.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      return num >= 1 && num <= 8 ? num : 1;
    }
    return 1;
  };

  const groupNumber = extractGroupNum(currentGroup?.name);
  const activeCase = GROUP_CASES[groupNumber] || GROUP_CASES[1];

  // State Jawaban Essay Kelompok (Revisi E.6)
  const [activeTab, setActiveTab] = useState('SOAL'); // 'SOAL' | 'ESSAY' | 'PRESENTASI'
  const [essayAns1, setEssayAns1] = useState(activeCase.defaultAnswers.ans1);
  const [essayAns2, setEssayAns2] = useState(activeCase.defaultAnswers.ans2);
  const [essayAns3, setEssayAns3] = useState(activeCase.defaultAnswers.ans3);
  const [essayAns4, setEssayAns4] = useState(activeCase.defaultAnswers.ans4);

  // Fullscreen Presentation Mode
  const [presentationMode, setPresentationMode] = useState(false);

  // Update jawaban default jika ganti kelompok
  useEffect(() => {
    setEssayAns1(activeCase.defaultAnswers.ans1);
    setEssayAns2(activeCase.defaultAnswers.ans2);
    setEssayAns3(activeCase.defaultAnswers.ans3);
    setEssayAns4(activeCase.defaultAnswers.ans4);
  }, [groupNumber]);

  const handleSaveAnswers = () => {
    if (!essayAns1.trim() || !essayAns3.trim()) {
      Alert.alert('Perhatian', 'Mohon lengkapi jawaban essay kelompok sebelum melanjutkan!');
      return;
    }

    addXp(40, `Pemecah Kasus Kelompok ${groupNumber}`);
    Alert.alert(
      'Diskusi Berhasil Disimpan!',
      'Jawaban essay kelompok telah dirangkum ke dalam lembar presentasi kelas. Silakan buka tab "Hasil Presentasi" untuk maju ke depan kelas!',
      [{ text: 'Buka Lembar Presentasi', onPress: () => setActiveTab('PRESENTASI') }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.badge}>KASUS KHUSUS KELOMPOK {groupNumber} (RPP)</Text>
          <Text style={styles.title}>{activeCase.title.split(':')[0]}</Text>
          <Text style={styles.groupText}>
            Tim: {currentGroup?.name || `Kelompok ${groupNumber}`} • Fokus: {activeCase.focusDevice}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.presentBtn}
          onPress={() => setPresentationMode(true)}
        >
          <Ionicons name="easel-outline" size={18} color="#FFFFFF" />
          <Text style={styles.presentBtnText}>Slide Layar</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.stepperBar}>
        <TouchableOpacity
          style={[styles.stepItem, activeTab === 'SOAL' && styles.stepItemActive]}
          onPress={() => setActiveTab('SOAL')}
        >
          <Text style={[styles.stepNumber, activeTab === 'SOAL' && styles.stepNumberActive]}>1</Text>
          <Text style={[styles.stepText, activeTab === 'SOAL' && styles.stepTextActive]}>Cerita Kasus</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.stepItem, activeTab === 'ESSAY' && styles.stepItemActive]}
          onPress={() => setActiveTab('ESSAY')}
        >
          <Text style={[styles.stepNumber, activeTab === 'ESSAY' && styles.stepNumberActive]}>2</Text>
          <Text style={[styles.stepText, activeTab === 'ESSAY' && styles.stepTextActive]}>Jawaban Essay</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.stepItem, activeTab === 'PRESENTASI' && styles.stepItemActive]}
          onPress={() => setActiveTab('PRESENTASI')}
        >
          <Text style={[styles.stepNumber, activeTab === 'PRESENTASI' && styles.stepNumberActive]}>3</Text>
          <Text style={[styles.stepText, activeTab === 'PRESENTASI' && styles.stepTextActive]}>Hasil Presentasi</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ======================================================== */}
        {/* TAB 1: CERITA KASUS KHUSUS KELOMPOK INI                  */}
        {/* ======================================================== */}
        {activeTab === 'SOAL' && (
          <View style={styles.contentCard}>
            <View style={styles.caseBadge}>
              <Ionicons name="construct-outline" size={16} color={COLORS.primary} />
              <Text style={styles.caseBadgeText}>TROUBLESHOOTING: {activeCase.focusDevice.toUpperCase()}</Text>
            </View>

            <Text style={styles.storyMainTitle}>{activeCase.title}</Text>
            
            <View style={styles.storyQuoteBox}>
              <Text style={styles.storyQuoteText}>"{activeCase.realLifeStory}"</Text>
            </View>

            <View style={styles.coreIssueBox}>
              <View style={styles.coreIssueHeader}>
                <Ionicons name="alert-circle" size={18} color={COLORS.warning} />
                <Text style={styles.coreIssueTitle}>Akar Masalah yang Perlu Dianalisis:</Text>
              </View>
              <Text style={styles.coreIssueDesc}>{activeCase.coreIssue}</Text>
            </View>

            <Text style={styles.guideTitle}>Instruksi Pengerjaan Kelompok:</Text>
            <Text style={styles.guideDesc}>
              1. Diskusikan kasus di atas bersama seluruh anggota kelompok.{'\n'}
              2. Buka tab <Text style={{ color: COLORS.primary, fontWeight: '700' }}>"2. Jawaban Essay"</Text> untuk menuliskan analisis dan solusi pemecahan masalah kalian.{'\n'}
              3. Hasil essay akan otomatis diubah menjadi lembar presentasi kelas.
            </Text>

            <TouchableOpacity style={styles.nextStepBtn} onPress={() => setActiveTab('ESSAY')}>
              <Text style={styles.nextStepBtnText}>Mulai Tulis Jawaban Essay Kelompok →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 2: FORMULIR JAWABAN ESSAY KELOMPOK (Revisi E.6)       */}
        {/* ======================================================== */}
        {activeTab === 'ESSAY' && (
          <View style={styles.contentCard}>
            <Text style={styles.essayIntroTitle}>Formulir Analisis Problem Solving</Text>
            <Text style={styles.essayIntroSub}>
              Jawablah 4 pertanyaan essay berikut berdasarkan hasil diskusi kelompokmu:
            </Text>

            {/* Pertanyaan 1 */}
            <View style={styles.essayQuestionBox}>
              <Text style={styles.essayLabel}>1. {activeCase.guidingQuestions.q1}</Text>
              <TextInput
                style={styles.essayInput}
                multiline
                value={essayAns1}
                onChangeText={setEssayAns1}
                placeholder="Tuliskan analisis kelompokmu di sini..."
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            {/* Pertanyaan 2 */}
            <View style={styles.essayQuestionBox}>
              <Text style={styles.essayLabel}>2. {activeCase.guidingQuestions.q2}</Text>
              <TextInput
                style={styles.essayInput}
                multiline
                value={essayAns2}
                onChangeText={setEssayAns2}
                placeholder="Bagian fisik apa yang harus dicek..."
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            {/* Pertanyaan 3 */}
            <View style={styles.essayQuestionBox}>
              <Text style={styles.essayLabel}>3. {activeCase.guidingQuestions.q3}</Text>
              <TextInput
                style={styles.essayInput}
                multiline
                value={essayAns3}
                onChangeText={setEssayAns3}
                placeholder="Alat atau solusi apa yang harus dipasang..."
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            {/* Pertanyaan 4 */}
            <View style={styles.essayQuestionBox}>
              <Text style={styles.essayLabel}>4. {activeCase.guidingQuestions.q4}</Text>
              <TextInput
                style={styles.essayInput}
                multiline
                value={essayAns4}
                onChangeText={setEssayAns4}
                placeholder="Saran pencegahan di masa depan..."
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <TouchableOpacity style={styles.nextStepBtn} onPress={handleSaveAnswers}>
              <Text style={styles.nextStepBtnText}>💾 Simpan & Rangkum ke Lembar Presentasi →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 3: LEMBAR PRESENTASI KELOMPOK SIAP TAMPIL DEPAN KELAS */}
        {/* ======================================================== */}
        {activeTab === 'PRESENTASI' && (
          <View style={styles.contentCard}>
            <View style={styles.presentSheetHeader}>
              <Ionicons name="easel" size={28} color={COLORS.primary} />
              <View>
                <Text style={styles.presentSheetTitle}>Lembar Presentasi Kelompok</Text>
                <Text style={styles.presentSheetSub}>Gunakan lembar ini untuk unjuk kerja di depan kelas!</Text>
              </View>
            </View>

            <View style={styles.groupBadgeCard}>
              <Text style={styles.groupBadgeName}>{currentGroup?.name || `Kelompok ${groupNumber}`}</Text>
              <Text style={styles.groupBadgeCase}>Topik Bahasan: {activeCase.title}</Text>
            </View>

            {/* Poin 1 */}
            <View style={styles.slidePointCard}>
              <Text style={styles.slidePointHeader}>1. ANALISIS AKAR MASALAH:</Text>
              <Text style={styles.slidePointBody}>{essayAns1}</Text>
            </View>

            {/* Poin 2 */}
            <View style={styles.slidePointCard}>
              <Text style={styles.slidePointHeader}>2. PENGECEKAN FISIK AWAL TEKNISI:</Text>
              <Text style={styles.slidePointBody}>{essayAns2}</Text>
            </View>

            {/* Poin 3 */}
            <View style={[styles.slidePointCard, { borderColor: COLORS.secondary }]}>
              <Text style={[styles.slidePointHeader, { color: COLORS.secondary }]}>
                3. TINDAKAN SOLUSI HARDWARE KELOMPOK:
              </Text>
              <Text style={styles.slidePointBody}>{essayAns3}</Text>
            </View>

            {/* Poin 4 */}
            <View style={styles.slidePointCard}>
              <Text style={styles.slidePointHeader}>4. LANGKAH PENCEGAHAN (BEST PRACTICE):</Text>
              <Text style={styles.slidePointBody}>{essayAns4}</Text>
            </View>

            <TouchableOpacity
              style={styles.fullscreenSlideBtn}
              onPress={() => setPresentationMode(true)}
            >
              <Ionicons name="expand" size={18} color="#FFFFFF" />
              <Text style={styles.fullscreenSlideText}>Tampilkan Layar Penuh (Slide Proyektor)</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ======================================================== */}
      {/* FULLSCREEN PRESENTATION SLIDE (PROYEKTOR KELAS)          */}
      {/* ======================================================== */}
      <Modal visible={presentationMode} transparent animationType="fade">
        <SafeAreaView style={styles.presentContainer}>
          <View style={styles.presentTopBar}>
            <Text style={styles.presentGroupTitle}>
              {currentGroup?.name || `Kelompok ${groupNumber}`} • {activeCase.focusDevice}
            </Text>
            <TouchableOpacity
              style={styles.presentCloseBtn}
              onPress={() => setPresentationMode(false)}
            >
              <Ionicons name="close-circle" size={28} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.presentContent}>
            <View style={styles.slideHeaderBox}>
              <Text style={styles.slideTagText}>HASIL DISKUSI PROBLEM-BASED LEARNING (PBL)</Text>
              <Text style={styles.slideMainHeading}>{activeCase.title}</Text>
            </View>

            <View style={styles.presentSlideBlock}>
              <Text style={styles.presentSlideLabel}>1. MASALAH & PENYEBAB:</Text>
              <Text style={styles.presentSlideText}>{essayAns1}</Text>
            </View>

            <View style={styles.presentSlideBlock}>
              <Text style={styles.presentSlideLabel}>2. PEMERIKSAAN FISIK TEKNISI:</Text>
              <Text style={styles.presentSlideText}>{essayAns2}</Text>
            </View>

            <View style={[styles.presentSlideBlock, { borderColor: COLORS.secondary }]}>
              <Text style={[styles.presentSlideLabel, { color: COLORS.secondary }]}>
                3. SOLUSI PERANGKAT & TINDAKAN KELOMPOK:
              </Text>
              <Text style={styles.presentSlideText}>{essayAns3}</Text>
            </View>

            <View style={styles.presentSlideBlock}>
              <Text style={styles.presentSlideLabel}>4. PENCEGAHAN KE DEPAN:</Text>
              <Text style={styles.presentSlideText}>{essayAns4}</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
  },
  badge: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },
  groupText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '700',
    marginTop: 2,
  },
  presentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  presentBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stepperBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  stepItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  stepItemActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
  },
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceBorder,
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 20,
  },
  stepNumberActive: {
    backgroundColor: COLORS.primary,
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  stepTextActive: {
    color: COLORS.primary,
  },
  scroll: {
    padding: 18,
    paddingBottom: 40,
  },
  contentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  caseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 10,
  },
  caseBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  storyMainTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 12,
  },
  storyQuoteBox: {
    backgroundColor: COLORS.surfaceLight,
    padding: 16,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    marginBottom: 16,
  },
  storyQuoteText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  coreIssueBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    marginBottom: 16,
  },
  coreIssueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  coreIssueTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.warning,
  },
  coreIssueDesc: {
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 18,
  },
  guideTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  guideDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  nextStepBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  nextStepBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  essayIntroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  essayIntroSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  essayQuestionBox: {
    marginBottom: 14,
  },
  essayLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
    lineHeight: 18,
  },
  essayInput: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  presentSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  presentSheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  presentSheetSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  groupBadgeCard: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.25)',
    marginBottom: 14,
  },
  groupBadgeName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
  },
  groupBadgeCase: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  slidePointCard: {
    backgroundColor: COLORS.surfaceLight,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: 10,
  },
  slidePointHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  slidePointBody: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 19,
  },
  fullscreenSlideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 10,
  },
  fullscreenSlideText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  presentContainer: {
    flex: 1,
    backgroundColor: '#070A10',
  },
  presentTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  presentGroupTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
  },
  presentCloseBtn: {
    padding: 4,
  },
  presentContent: {
    padding: 22,
    gap: 14,
  },
  slideHeaderBox: {
    marginBottom: 8,
  },
  slideTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.secondary,
    letterSpacing: 1.5,
  },
  slideMainHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: 4,
  },
  presentSlideBlock: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
  },
  presentSlideLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  presentSlideText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 21,
  },
});
