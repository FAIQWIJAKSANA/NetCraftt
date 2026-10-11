const prisma = require('../config/db');

async function seed() {
  console.log('🌱 Memulai proses seeding data NetCraft (Revisi Lengkap)...');

  // 1. Bersihkan data lama jika ada
  await prisma.userProgress.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.pblMatrix.deleteMany({});
  await prisma.quizSwipe.deleteMany({});
  await prisma.puzzleLevel.deleteMany({});
  await prisma.hardwareCard.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.group.deleteMany({});

  // 2. Buat 8 Kelompok Default (Sesuai Permintaan Revisi A.1)
  const groupNames = [
    'Kelompok 1 - Router Squad',
    'Kelompok 2 - Switch Master',
    'Kelompok 3 - Wi-Fi Warriors',
    'Kelompok 4 - Fiber Optic Crew',
    'Kelompok 5 - LAN Connect',
    'Kelompok 6 - Packet Hunters',
    'Kelompok 7 - Cyber Network',
    'Kelompok 8 - Bandwidth Titans',
  ];

  const createdGroups = [];
  for (let i = 0; i < groupNames.length; i++) {
    const grp = await prisma.group.create({
      data: {
        name: groupNames[i],
        className: 'X TJKT 1',
        accessCode: `NET-${(i + 1).toString().padStart(2, '0')}`,
      },
    });
    createdGroups.push(grp);
  }

  // Pengguna Awal
  await prisma.user.createMany({
    data: [
      {
        name: 'Faiq Wijaksana',
        groupId: createdGroups[0].id,
        role: 'STUDENT',
        xpPoints: 150,
        rankTitle: 'Teknisi Kabel',
      },
      {
        name: 'Pak Guru Informatika',
        role: 'TEACHER',
        xpPoints: 9999,
        rankTitle: 'Network Architect',
      },
    ],
  });

  // 3. Seed 6 Kartu Hardware dengan Penjelasan Mendalam (Revisi B.2)
  const hardwareCardsData = [
    {
      slug: 'router',
      name: 'Router (Wireless / Standalone)',
      category: 'Perangkat Pengarah Jaringan (Layer 3)',
      analogy: 'Bayangkan router seperti Gerbang Tol atau Kantor Pos Utama di sebuah kota. Komputer di rumahmu adalah rumah-rumah di dalam kota. Ketika kamu ingin mengirim pesan ke YouTube atau Google (di luar kota), router bertugas mencari jalan keluar tercepat dan memberikan alamat pengirim (IP Address) yang sah agar surat balasan dari internet tidak salah alamat!',
      osiLayer: 'Layer 3 (Network Layer) - Bekerja dengan Alamat IP',
      keySpecs: '• Port WAN (1 Port Biru / Kuning dengan logo Bola Dunia): Tempat masuk kabel dari Modem ISP.\n• Port LAN (3-4 Port): Jalur kabel untuk dibagi ke komputer lokal atau Switch.\n• DHCP Server Otomatis: Membagikan IP Address ke HP dan laptop tanpa perlu disetting manual satu per satu.\n• Frekuensi Wi-Fi: 2.4 GHz (Jangkauan luas, tembus tembok) & 5 GHz (Kecepatan sangat tinggi, jangkauan pendek).',
      dosAndDonts: '✅ DO: Selalu hubungkan kabel dari modem ISP ke port WAN agar router menerima internet luar.\n✅ DO: Tempatkan router di tempat terbuka dengan sirkulasi udara baik.\n❌ DONT: Jangan tancapkan kabel modem ke port LAN (internet tidak akan terbagi).\n❌ DONT: Jangan letakkan router di dekat benda logam tebal, cermin besar, atau microwave karena dapat merusak gelombang sinyal radio Wi-Fi.',
      imageUrl: 'http://localhost:5000/static/images/router.png',
      audioTerm: 'Row-ter / Roo-ter',
      hotspotsJson: JSON.stringify([
        { id: 1, x: 25, y: 70, title: 'Port WAN (Internet)', description: 'Port warna biru khusus colokan kabel masuk dari modem ISP untuk menerima koneksi internet publik.' },
        { id: 2, x: 55, y: 70, title: 'Port LAN (Lokal)', description: 'Port warna kuning untuk membagi kabel ke switch atau komputer PC di ruangan yang sama.' },
        { id: 3, x: 80, y: 70, title: 'Tombol Reset', description: 'Lubang kecil yang ditekan menggunakan jarum/klip kertas untuk mengembalikan pengaturan router ke setelan pabrik jika lupa kata sandi.' },
        { id: 4, x: 50, y: 30, title: 'Lampu LED Status', description: 'Lampu indikator daya (Power), sinyal Internet (Globe), dan status Wi-Fi. Jika lampu globe merah berarti ada masalah sambungan dari ISP.' },
      ]),
    },
    {
      slug: 'switch',
      name: 'Switch Hub (16/24 Port Gigabit)',
      category: 'Perangkat Distribusi Kabel Lokal (Layer 2)',
      analogy: 'Bayangkan switch seperti terminal stopkontak colokan listrik multi-cabang yang sangat pintar. Jika di sebuah lab ada 20 komputer yang ingin saling berbagi data dan printer lewat kabel, mereka tidak bisa dicolokkan ke router (karena router portnya sedikit). Semuanya dicolokkan ke Switch ini, dan switch memastikan data berpindah secepat kilat tanpa tabrakan antar-komputer!',
      osiLayer: 'Layer 2 (Data Link Layer) - Bekerja dengan MAC Address',
      keySpecs: '• Jumlah Port: 8, 16, 24, hingga 48 Port RJ-45.\n• Kecepatan: Gigabit Ethernet (1000 Mbps) dengan fitur Full-Duplex (dapat mengirim dan menerima data di saat yang bersamaan).\n• Tipe: Unmanaged (Tinggal colok langsung jalan) vs Managed (Dapat diprogram untuk membagi VLAN dan membatasi kecepatan per ruangan).',
      dosAndDonts: '✅ DO: Gunakan switch untuk menghubungkan belasan komputer di satu ruangan agar latensi rendah dan file transfer cepat.\n❌ DONT: DILARANG KERAS menancapkan kedua ujung satu kabel ke port berbeda pada switch yang sama! Tindakan ini menciptakan "Looping / Broadcast Storm" yang akan melumpuhkan seluruh jaringan kantor dalam hitungan detik!',
      imageUrl: 'http://localhost:5000/static/images/switch.png',
      audioTerm: 'Swicth Hub',
      hotspotsJson: JSON.stringify([
        { id: 1, x: 20, y: 50, title: 'Port RJ-45 (1 - 16)', description: 'Deretan lubang colokan kabel LAN menuju masing-masing komputer PC di meja kerja/lab.' },
        { id: 2, x: 75, y: 50, title: 'Port Uplink', description: 'Port yang digunakan untuk menghubungkan switch ini ke router utama penyedia internet.' },
        { id: 3, x: 90, y: 30, title: 'Power LED & Link Act', description: 'Lampu berkedip hijau menandakan kabel terhubung dan sedang ada lalu lintas data yang aktif.' },
      ]),
    },
    {
      slug: 'access-point',
      name: 'Access Point (Indoor Dome PoE)',
      category: 'Pemancar Sinyal Wi-Fi Terdedikasi',
      analogy: 'Bayangkan Access Point seperti pengeras suara (speaker masjid/sekolah) di tengah aula. Perangkat ini menerima kabel internet berkecepatan tinggi dari switch, lalu menyiarkannya ke udara menjadi gelombang radio Wi-Fi. Dengan memasang Access Point terpisah, router utama tidak akan kepanasan dan sinyal Wi-Fi bisa menjangkau ruangan mana saja!',
      osiLayer: 'Layer 2 (Data Link Layer) - Pemancar Nirkabel',
      keySpecs: '• Teknologi: Wi-Fi 6 (802.11ax) Dual-Band 2.4 GHz & 5 GHz.\n• Daya: PoE (Power over Ethernet) — Listrik dan data dialirkan hanya lewat 1 kabel LAN, jadi tidak perlu colokan stopkontak listrik di plafon!\n• Cakupan Sinyal: 360 Derajat menyebar ke seluruh ruangan.',
      dosAndDonts: '✅ DO: Pasang di langit-langit (plafon) tengah ruangan agar sinyal menyebar dari atas ke bawah tanpa terhalang orang atau lemari.\n❌ DONT: Jangan letakkan di lantai, di pojok ruangan, atau di kolong meja besi karena besi dan beton menyerap gelombang sinyal radio.',
      imageUrl: 'http://localhost:5000/static/images/access.avif',
      audioTerm: 'Ak-ses Poynt',
      hotspotsJson: JSON.stringify([
        { id: 1, x: 50, y: 80, title: 'Port PoE (Power over Ethernet)', description: 'Lubang colokan kabel LAN dari switch yang sekaligus mengalirkan arus listrik untuk menyalakan perangkat.' },
        { id: 2, x: 50, y: 50, title: 'Cincin LED Indikator', description: 'Lampu cincin biru menandakan perangkat siap melayani sambungan nirkabel ke smartphone dan laptop.' },
      ]),
    },
    {
      slug: 'modem',
      name: 'Modem / Fiber ONT (Optical Network Terminal)',
      category: 'Penerjemah Sinyal ISP (Pintu Masuk Internet)',
      analogy: 'Bayangkan modem seperti penerjemah bahasa asing. Internet dari tiang luar dikirim menggunakan kabel kaca optik dalam bentuk denyutan cahaya laser. Komputer kita tidak mengerti cahaya laser; komputer hanya mengerti sinyal listrik digital (angka 0 dan 1). Modem inilah yang bertugas menerjemahkan denyutan cahaya luar menjadi sinyal listrik kabel!',
      osiLayer: 'Layer 1 & 2 (Physical & Data Link Layer)',
      keySpecs: '• Port Optik (SC/UPC warna hijau/biru): Tempat masuk kabel serat kaca dari tiang internet ISP (Indihome/Biznet/MyRepublic).\n• Port LAN GE: Tempat kabel LAN keluar menuju ke port WAN Router.\n• Port Telepon (RJ-11): Jalur telepon rumah.',
      dosAndDonts: '✅ DO: Jaga agar kabel kuning fiber optik tidak tertekuk patah (karena di dalamnya ada kaca tipis).\n❌ DONT: JANGAN PERNAH menatap langsung lubang konektor optik yang menyala karena sinar laser infra merah dapat merusak mata!',
      imageUrl: 'http://localhost:5000/static/images/modem.jpg',
      audioTerm: 'Mo-dem / O-En-Ti',
      hotspotsJson: JSON.stringify([
        { id: 1, x: 30, y: 70, title: 'Port Fiber Optik', description: 'Colokan kabel kaca kecil dari tiang internet luar.' },
        { id: 2, x: 70, y: 70, title: 'Port LAN Out', description: 'Colokan kabel LAN yang meneruskan internet ke port WAN Router.' },
        { id: 3, x: 50, y: 30, title: 'Lampu LOS (Loss of Signal)', description: 'Jika lampu LOS berkedip merah terang, artinya kabel optik putus di jalan dan harus lapor ke teknisi ISP.' },
      ]),
    },
    {
      slug: 'nic',
      name: 'NIC (Network Interface Card / LAN Card PC)',
      category: 'Komponen Internal Komputer',
      analogy: 'Bayangkan NIC seperti mulut dan telinga pada komputer. Tanpa NIC, komputer seperti orang yang tidak punya telinga untuk mendengar suara kabel dan tidak punya mulut untuk berbicara ke jaringan. NIC menyediakan lubang colokan RJ-45 agar komputer bisa mengobrol dengan komputer lain lewat kabel!',
      osiLayer: 'Layer 1 & 2 - Menyimpan Alamat Fisik (MAC Address)',
      keySpecs: '• Tipe Slot: PCI-Express (PCIe) yang ditancapkan ke motherboard komputer.\n• Kecepatan: 10/100/1000 Mbps (Gigabit).\n• Identitas Unik: Setiap kartu NIC di seluruh dunia memiliki MAC Address unik yang tidak pernah sama dengan kartu lain.',
      dosAndDonts: '✅ DO: Pasang pas di slot PCIe motherboard dan kunci dengan baut pada casing CPU.\n❌ DONT: Jangan menyentuh kaki-kaki lempengan kuningan saat tangan basah atau berminyak.',
      imageUrl: 'http://localhost:5000/static/images/nic.jpg',
      audioTerm: 'En-Ai-Si / Lan Kard',
      hotspotsJson: JSON.stringify([
        { id: 1, x: 20, y: 50, title: 'Port RJ-45 Belakang', description: 'Lubang colokan kabel internet di bagian belakang casing komputer.' },
        { id: 2, x: 60, y: 70, title: 'Kaki Pin PCIe', description: 'Lempengan kuningan yang ditancapkan ke slot motherboard di dalam CPU.' },
        { id: 3, x: 30, y: 40, title: 'Lampu LED Link/Act', description: 'Lampu kecil di samping lubang colokan yang berkedip hijau saat komputer sedang download/upload.' },
      ]),
    },
    {
      slug: 'utp-cable',
      name: 'Media Transmisi (Kabel UTP Cat6 & RJ-45)',
      category: 'Media Fisik Penghantar Data',
      analogy: 'Bayangkan kabel UTP seperti jalan tol khusus 8 lajur untuk aliran data. Di dalam kulit kabel ada 8 helai kawat tembaga kecil yang dipilin berpasang-pasangan. Pilinan ini bukan hiasan, melainkan trik fisika canggih agar denyut listrik di dalam kabel tidak terganggu oleh gelombang magnet luar (anti-noise)!',
      osiLayer: 'Layer 1 (Physical Layer) - Penghantar Arus Listrik',
      keySpecs: '• Kategori: Cat6 (Kecepatan hingga 1 Gbps stabil dengan isolator pembatas plastik di tengah kabel).\n• Kepala Konektor: RJ-45 bening dengan 8 pin kuningan.\n• Standar Urutan Warna T568B: Putih-Oranye, Oranye, Putih-Hijau, Biru, Putih-Biru, Hijau, Putih-Cokelat, Cokelat.',
      dosAndDonts: '✅ DO: Gunakan tang crimping khusus untuk mengunci kepala RJ-45 dengan kuat sampai terdengar bunyi klik saat dicolokkan.\n❌ DONT: Panjang kabel satu tarikan tidak boleh melebihi 100 meter, karena sinyal listrik akan melemah di tengah jalan.',
      imageUrl: 'http://localhost:5000/static/images/media.jpg',
      audioTerm: 'Yu-Ti-Pi Key-bel / Ar-Jei Forty Five',
      hotspotsJson: JSON.stringify([
        { id: 1, x: 40, y: 50, title: 'Kepala Konektor RJ-45', description: 'Konektor plastik bening dengan 8 pin tembaga yang menancap ke lubang port perangkat jaringan.' },
        { id: 2, x: 70, y: 60, title: 'Kabel Berpilin (Twisted Pair)', description: '8 helai kawat tembaga berpasangan yang dipilin rapi untuk meredam gangguan magnet.' },
      ]),
    },
  ];

  for (const item of hardwareCardsData) {
    await prisma.hardwareCard.create({ data: item });
  }

  // 4. Seed 6 Skenario Puzzle "NetFix Lab"
  const puzzleLevelsData = [
    {
      levelNumber: 1,
      title: 'Kenapa Internetnya Gak Masuk?',
      cognitiveLevel: 'C3 (Aplikasi)',
      scenarioStory: 'Di ruang administrasi, kabel kuning dari modem ISP baru saja dipasang ke Router. Namun semua staf mengeluh lampu globe router mati dan tidak ada internet sama sekali! Temukan letak kesalahan colokannya.',
      hintText: 'Perhatikan bagian belakang router: Kabel masuk dari modem ISP harus selalu dicolokkan ke port WAN (warna biru), BUKAN ke port LAN (kuning)!',
      initialStateJson: JSON.stringify({
        cablePluggedAt: 'lan_port_2',
        wanPortStatus: 'empty',
      }),
      solutionTargetJson: JSON.stringify({
        cablePluggedAt: 'wan_port',
      }),
      explanationDeepLearn: 'Kabel dari Modem/ISP wajib masuk ke port WAN (Internet). Port WAN adalah pintu gerbang penerima alamat IP publik dari ISP, sedangkan port LAN adalah pintu pembagi ke perangkat lokal.',
    },
    {
      levelNumber: 2,
      title: 'Switch Mati Kutu di Rak Server',
      cognitiveLevel: 'C3 (Aplikasi)',
      scenarioStory: 'Seluruh komputer di lab sekolah mendadak offline bersamaan. Saat kamu memeriksa rak server, switch 16 port lampunya padam semua! Apa tindakan pertamamu sebagai teknisi?',
      hintText: 'Sebelum menyalahkan kabel atau konfigurasi, selalu periksa suplai daya listrik fisik: cek adaptor di stopkontak dan tombol power switch!',
      initialStateJson: JSON.stringify({
        adapterPlugged: false,
        powerSwitch: 'OFF',
      }),
      solutionTargetJson: JSON.stringify({
        adapterPlugged: true,
        powerSwitch: 'ON',
      }),
      explanationDeepLearn: 'Pemeriksaan suplai daya fisik (colokan listrik dan saklar power) adalah aturan nomor satu dalam troubleshooting hardware jaringan sebelum memeriksa kabel data.',
    },
    {
      levelNumber: 3,
      title: 'Sinyal Wi-Fi Lantai 2 Menghilang',
      cognitiveLevel: 'C4 (Analisis)',
      scenarioStory: 'Siswa di ruang kelas lantai 2 mengeluh sinyal Wi-Fi hanya 1 bar dan sering putus. Kamu menemukan perangkat Access Point tergeletak di kolong meja besi lantai 1! Pindahkan perangkat tersebut.',
      hintText: 'Gelombang radio Wi-Fi terhalang meja besi dan pelat lantai beton. Pindahkan Access Point ke plafon langit-langit lantai 2 agar sinyal menyebar luas!',
      initialStateJson: JSON.stringify({
        apLocation: 'floor1_under_desk',
      }),
      solutionTargetJson: JSON.stringify({
        apLocation: 'floor2_ceiling',
      }),
      explanationDeepLearn: 'Access Point harus ditempatkan di plafon atau posisi tinggi di ruangan tujuan agar radius gelombang sinyal tidak terhalang oleh pelat beton lantai dan perabotan logam.',
    },
    {
      levelNumber: 4,
      title: 'PC Lab Baru Tidak Bisa Konek Kabel',
      cognitiveLevel: 'C4 (Analisis)',
      scenarioStory: 'Satu unit PC baru di lab sekolah ingin disambungkan ke kabel LAN, tapi bagian belakang casing CPU-nya tidak memiliki lubang colokan RJ-45 sama sekali! Pasang komponen yang tepat.',
      hintText: 'Cari kartu ekspansi jaringan (Network Interface Card / NIC) di kotak komponen, pasang ke motherboard, lalu colokkan kabel LAN-nya!',
      initialStateJson: JSON.stringify({
        nicInstalled: false,
        cableConnected: false,
      }),
      solutionTargetJson: JSON.stringify({
        nicInstalled: true,
        cableConnected: true,
      }),
      explanationDeepLearn: 'Komputer membutuhkan Network Interface Card (NIC) untuk menyediakan port fisik RJ-45 dan mengubah sinyal data biner komputer menjadi sinyal listrik kabel.',
    },
    {
      levelNumber: 5,
      title: 'Badai Broadcast / Jaringan Lumpuh',
      cognitiveLevel: 'C5 (Evaluasi)',
      scenarioStory: 'Tiba-tiba semua lampu di switch berkedip serentak dengan sangat cepat dan koneksi kantor macet total! Ada siswa yang iseng mencolokkan kedua ujung satu kabel ke switch yang sama.',
      hintText: 'Perhatikan kabel biru di switch. Cabut salah satu ujung kabel yang looping antar-port agar badai broadcast berhenti!',
      initialStateJson: JSON.stringify({
        loopCableConnected: true,
      }),
      solutionTargetJson: JSON.stringify({
        loopCableConnected: false,
      }),
      explanationDeepLearn: 'Menghubungkan dua port pada switch yang sama menciptakan Network Looping (Broadcast Storm). Paket data berputar tanpa henti hingga menghabiskan seluruh kapasitas switch.',
    },
    {
      levelNumber: 6,
      title: 'Koneksi Wi-Fi Ruang Rapat Gedung B',
      cognitiveLevel: 'C5 (Evaluasi Kasus RPP)',
      scenarioStory: 'Gedung B jaraknya 50 meter dari Gedung A. Jalur kabel LAN antar-gedung sudah terpasang rapi, tapi ruangan rapat di Gedung B butuh sinyal Wi-Fi untuk laptop peserta. Alat apa yang harus dipasang?',
      hintText: 'Pilih alat pemancar nirkabel (Access Point) yang bertugas mengubah sambungan kabel LAN yang sudah ada menjadi sinyal Wi-Fi lokal!',
      initialStateJson: JSON.stringify({
        selectedDevice: 'NONE',
      }),
      solutionTargetJson: JSON.stringify({
        selectedDevice: 'ACCESS_POINT',
      }),
      explanationDeepLearn: 'Access Point adalah solusi paling tepat dan efisien untuk memancarkan sinyal Wi-Fi baru di gedung terpisah dengan memanfaatkan jalur kabel LAN yang sudah terhubung.',
    },
  ];

  for (const lvl of puzzleLevelsData) {
    await prisma.puzzleLevel.create({ data: lvl });
  }

  // 5. Seed 10 Kuis Tinder Swipe
  const quizSwipesData = [
    {
      statement: 'Switch Hub berfungsi untuk memancarkan sinyal Wi-Fi tanpa memerlukan kabel.',
      isCorrect: false,
      explanation: 'Salah! Switch hanya membagi kabel LAN. Yang memancarkan Wi-Fi adalah Access Point.',
      category: 'Switch',
    },
    {
      statement: 'Kabel internet dari modem ISP wajib dicolokkan ke port WAN pada router.',
      isCorrect: true,
      explanation: 'Benar! Port WAN bertugas menerima koneksi internet dari luar ISP.',
      category: 'Router',
    },
    {
      statement: 'Jika ada 12 komputer desainer yang butuh kabel, Switch 8-Port sudah cukup.',
      isCorrect: false,
      explanation: 'Salah! Switch 8-Port hanya muat maksimal 8 kabel. Untuk 12 PC minimal butuh Switch 16-Port.',
      category: 'Switch',
    },
    {
      statement: 'Access Point sebaiknya dipasang di plafon tengah ruangan agar sinyal Wi-Fi menyebar luas.',
      isCorrect: true,
      explanation: 'Benar! Penempatan di plafon meminimalkan halangan tembok dan perabotan logam.',
      category: 'Access Point',
    },
    {
      statement: 'Kabel LAN UTP memiliki 8 helai kawat tembaga berpilin di dalamnya.',
      isCorrect: true,
      explanation: 'Benar! 8 kawat tersebut dikelompokkan berpasangan untuk meredam gangguan magnetik.',
      category: 'Kabel UTP',
    },
    {
      statement: 'Mencolokkan kedua ujung satu kabel ke switch yang sama akan mempercepat transfer file.',
      isCorrect: false,
      explanation: 'Salah! Itu tindakan bahaya yang menyebabkan looping (Broadcast Storm) dan melumpuhkan jaringan.',
      category: 'Switch',
    },
    {
      statement: 'Network Interface Card (NIC) dipasang pada motherboard CPU agar memiliki colokan kabel RJ-45.',
      isCorrect: true,
      explanation: 'Benar! NIC menyediakan port fisik RJ-45 untuk komputer.',
      category: 'NIC',
    },
    {
      statement: 'Panjang tarikan satu kabel UTP standar bisa sampai 500 meter tanpa alat penguat.',
      isCorrect: false,
      explanation: 'Salah! Batas maksimal kabel UTP standar tanpa penguat sinyal hanya 100 meter.',
      category: 'Kabel UTP',
    },
    {
      statement: 'Router rumahan bawaan ISP sanggup menampung 50 perangkat sekaligus tanpa macet.',
      isCorrect: false,
      explanation: 'Salah! Router rumahan memiliki memori kecil dan akan sering down jika ditumpuk banyak pengguna.',
      category: 'Router',
    },
    {
      statement: 'Konektor standar berkepala 8 pin di ujung kabel LAN disebut konektor RJ-45.',
      isCorrect: true,
      explanation: 'Benar! RJ-45 adalah konektor standar 8 pin untuk jaringan lokal ethernet.',
      category: 'Kabel UTP',
    },
  ];

  for (const q of quizSwipesData) {
    await prisma.quizSwipe.create({ data: q });
  }

  // 6. Matriks Belanja Contoh untuk Kelompok 1
  await prisma.pblMatrix.createMany({
    data: [
      {
        groupId: createdGroups[0].id,
        hardwareName: 'Switch Hub 16-Port Gigabit',
        functionInCase: 'Menghubungkan 15 PC desainer di lantai 1 lewat kabel LAN berkecepatan tinggi.',
        portSpecs: '16 Port RJ-45 Gigabit (10/100/1000 Mbps)',
        justification: 'Menampung seluruh PC desainer dengan transfer file render cepat tanpa membebani router ISP.',
      },
      {
        groupId: createdGroups[0].id,
        hardwareName: 'Access Point Ceiling Mount PoE',
        functionInCase: 'Memancarkan sinyal Wi-Fi di lantai 2 untuk pelanggan dan staf.',
        portSpecs: 'Dual-Band 2.4/5GHz, 1 Port PoE Gigabit',
        justification: 'Memisahkan beban nirkabel dari router ISP agar tidak overload dan sinyal tembus lantai.',
      },
    ],
  });

  console.log('✅ Seeding berhasil tuntas! 8 Kelompok & Penjelasan Hardware lengkap.');
}

seed()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
