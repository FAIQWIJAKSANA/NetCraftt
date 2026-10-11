const prisma = require('../config/db');

// Input atau Update Nilai Guru untuk Kelompok
exports.gradeGroup = async (req, res) => {
  try {
    const {
      groupId,
      scoreGotongRoyong = 3,
      scoreBernalarKritis = 3,
      scoreHardwareDetail = 3,
      scoreTeknis = 3,
      teacherNotes = '',
    } = req.body;

    if (!groupId) {
      return res.status(400).json({ success: false, message: 'GroupId wajib disertakan' });
    }

    // Rumus Nilai Sikap RPP: (Total Skor Sikap / 8) * 100
    // Total Sikap = gotong royong + bernalar kritis (maksimal 8)
    const sikapScore = ((Number(scoreGotongRoyong) + Number(scoreBernalarKritis)) / 8) * 100;

    // Nilai Unjuk Kerja Presentasi: (Total Unjuk Kerja / 8) * 100
    const unjukKerjaScore = ((Number(scoreHardwareDetail) + Number(scoreTeknis)) / 8) * 100;

    // Rata-rata Nilai Akhir
    const finalScore = Math.round(((sikapScore + unjukKerjaScore) / 2) * 10) / 10;

    const assessment = await prisma.assessment.upsert({
      where: { groupId },
      update: {
        scoreGotongRoyong: Number(scoreGotongRoyong),
        scoreBernalarKritis: Number(scoreBernalarKritis),
        scoreHardwareDetail: Number(scoreHardwareDetail),
        scoreTeknis: Number(scoreTeknis),
        finalScore,
        teacherNotes,
      },
      create: {
        groupId,
        scoreGotongRoyong: Number(scoreGotongRoyong),
        scoreBernalarKritis: Number(scoreBernalarKritis),
        scoreHardwareDetail: Number(scoreHardwareDetail),
        scoreTeknis: Number(scoreTeknis),
        finalScore,
        teacherNotes,
      },
    });

    res.json({
      success: true,
      message: 'Penilaian unjuk kerja & sikap berhasil disimpan!',
      data: assessment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Ambil rekapitulasi nilai seluruh kelompok di kelas (Dashboard Guru)
exports.getClassSummary = async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      include: {
        users: { select: { id: true, name: true, xpPoints: true, rankTitle: true } },
        pblMatrices: true,
        assessment: true,
      },
      orderBy: { name: 'asc' },
    });

    const summary = groups.map((g) => ({
      groupId: g.id,
      groupName: g.name,
      className: g.className,
      totalMembers: g.users.length,
      members: g.users,
      matrixSubmittedCount: g.pblMatrices.length,
      isGraded: !!g.assessment,
      finalScore: g.assessment ? g.assessment.finalScore : null,
      assessmentDetail: g.assessment,
    }));

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
