const prisma = require('../config/db');

// Ambil daftar kelompok yang tersedia untuk dipilih siswa
exports.getGroups = async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      include: {
        _count: { select: { users: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tambah Kelompok Baru secara Dinamis jika kelompok kurang
exports.createGroup = async (req, res) => {
  try {
    const { name, className } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama kelompok wajib diisi!' });
    }

    const count = await prisma.group.count();
    const group = await prisma.group.create({
      data: {
        name,
        className: className || 'X TJKT 1',
        accessCode: `NET-${Date.now().toString().slice(-4)}`,
      },
    });

    res.json({ success: true, message: 'Kelompok baru berhasil ditambahkan!', data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login atau Registrasi Siswa sederhana
exports.studentLogin = async (req, res) => {
  try {
    const { name, groupId } = req.body;
    if (!name || !groupId) {
      return res.status(400).json({ success: false, message: 'Nama dan Kelompok wajib diisi!' });
    }

    // Cari atau buat user baru
    let user = await prisma.user.findFirst({
      where: { name, groupId, role: 'STUDENT' },
      include: { group: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          groupId,
          role: 'STUDENT',
          xpPoints: 0,
          rankTitle: 'Siswa Magang',
        },
        include: { group: true },
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login Guru
exports.teacherLogin = async (req, res) => {
  try {
    const { name, teacherCode } = req.body;
    // Kode guru default untuk microteaching
    if (teacherCode.toLowerCase() !== 'kemakom') {
      return res.status(401).json({ success: false, message: 'Kode akses pengajar tidak valid!' });
    }

    let teacher = await prisma.user.findFirst({
      where: { role: 'TEACHER' },
    });

    if (!teacher) {
      teacher = await prisma.user.create({
        data: {
          name: name || 'Bapak/Ibu Guru Informatika',
          role: 'TEACHER',
          xpPoints: 9999,
          rankTitle: 'Network Architect',
        },
      });
    }

    res.json({ success: true, data: teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Profil & XP
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        group: true,
        progress: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
