const prisma = require('../config/db');

// Ambil data studi kasus RPP (Kasus Nyata yang Relatable)
exports.getCaseStudyBrief = async (req, res) => {
  res.json({
    success: true,
    data: {
      title: 'Studi Kasus Lapangan: Kafe Belajar & Ruang Praktik Komputer',
      context: 'Sebuah ruko 2 lantai membuka Kafe Belajar di lantai 2 dan Ruang Praktik Komputer di lantai 1.',
      floors: [
        {
          floor: 1,
          targetUsers: '15 Komputer Siswa/Praktik',
          need: 'Kabel LAN kecepatan tinggi untuk ujian & transfer data tanpa putus.',
          urgency: 'Kritis (Router ISP hanya punya 4 port, tidak muat untuk 15 komputer).',
        },
        {
          floor: 2,
          targetUsers: '20 Pengunjung Kafe Belajar',
          need: 'Koneksi nirkabel (Wi-Fi) untuk laptop & HP.',
          urgency: 'Sinyal Wi-Fi sering hilang karena terhalang lantai beton ruko.',
        },
      ],
      currentProblem: 'Jaringan sering mati total dan lampu modem berkedip merah karena seluruh beban ditumpuk ke 1 router rumahan standar bawaan ISP.',
      taskPrompt: 'Diskusikan bersama kelompok: temukan akar masalahnya, tentukan perangkat hardware apa yang harus dipasang, dan siapkan lembar presentasi untuk dijelaskan di depan kelas!',
    },
  });
};

// Ambil matriks rekomendasi belanja kelompok
exports.getGroupMatrix = async (req, res) => {
  try {
    const { groupId } = req.params;
    const items = await prisma.pblMatrix.findMany({
      where: { groupId },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tambah item ke matriks belanja kelompok
exports.addMatrixItem = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { hardwareName, functionInCase, portSpecs, justification } = req.body;

    if (!hardwareName || !functionInCase) {
      return res.status(400).json({ success: false, message: 'Nama alat dan fungsi kasus wajib diisi' });
    }

    const item = await prisma.pblMatrix.create({
      data: {
        groupId,
        hardwareName,
        functionInCase,
        portSpecs: portSpecs || '-',
        justification: justification || '-',
      },
    });

    res.json({ success: true, message: 'Item berhasil ditambahkan ke solusi kelompok!', data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Hapus item dari matriks belanja kelompok
exports.deleteMatrixItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    await prisma.pblMatrix.delete({
      where: { id: itemId },
    });
    res.json({ success: true, message: 'Item berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Smart Validator
exports.validateGroupMatrix = async (req, res) => {
  try {
    const { groupId } = req.params;
    const items = await prisma.pblMatrix.findMany({ where: { groupId } });

    let hasDedicatedSwitch = false;
    let hasDedicatedAP = false;
    let warnings = [];
    let compliments = [];

    items.forEach((item) => {
      const name = item.hardwareName.toLowerCase();
      if (name.includes('switch')) hasDedicatedSwitch = true;
      if (name.includes('access point') || name.includes('ap')) hasDedicatedAP = true;
    });

    if (!hasDedicatedSwitch) {
      warnings.push('Kelompok Anda belum menyertakan Switch Hub untuk 15 komputer kabel di lantai 1.');
    } else {
      compliments.push('Penggunaan Switch Hub membagi kabel LAN ke 15 PC secara merata tanpa membebani router ISP.');
    }

    if (!hasDedicatedAP) {
      warnings.push('Kelompok Anda belum menyertakan Access Point untuk lantai 2.');
    } else {
      compliments.push('Access Point terpisah menjamin sinyal Wi-Fi lantai 2 kuat tanpa halangan pelat beton.');
    }

    const isOptimal = warnings.length === 0;

    res.json({
      success: true,
      data: {
        isOptimal,
        warnings,
        compliments,
        scoreStatus: isOptimal ? 'Rancangan Solusi Sangat Tepat!' : 'Perlu Tambahan Perangkat',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
