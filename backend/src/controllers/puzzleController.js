const prisma = require('../config/db');

// Ambil semua level puzzle untuk Roadmap NetFix Lab
exports.getAllLevels = async (req, res) => {
  try {
    const { userId } = req.query;

    const levels = await prisma.puzzleLevel.findMany({
      orderBy: { levelNumber: 'asc' },
    });

    let completedLevels = {};
    if (userId) {
      const progresses = await prisma.userProgress.findMany({
        where: { userId, type: 'PUZZLE' },
      });
      progresses.forEach((p) => {
        completedLevels[p.referenceId] = {
          starsEarned: p.starsEarned,
          hintsUsed: p.hintsUsed,
        };
      });
    }

    const formattedLevels = levels.map((lvl) => {
      const progress = completedLevels[lvl.id];
      return {
        id: lvl.id,
        levelNumber: lvl.levelNumber,
        title: lvl.title,
        cognitiveLevel: lvl.cognitiveLevel,
        scenarioStory: lvl.scenarioStory,
        hintText: lvl.hintText,
        initialState: JSON.parse(lvl.initialStateJson || '{}'),
        solutionTarget: JSON.parse(lvl.solutionTargetJson || '{}'),
        explanationDeepLearn: lvl.explanationDeepLearn,
        isCompleted: !!progress,
        starsEarned: progress ? progress.starsEarned : 0,
      };
    });

    res.json({ success: true, data: formattedLevels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Selesaikan level puzzle dan dapatkan skor / XP
exports.completeLevel = async (req, res) => {
  try {
    const { levelId } = req.params;
    const { userId, starsEarned = 3, hintsUsed = 0 } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'UserId diperlukan' });
    }

    // Catat progress
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_type_referenceId: {
          userId,
          type: 'PUZZLE',
          referenceId: levelId,
        },
      },
      update: {
        starsEarned: Math.max(1, Math.min(3, starsEarned)),
        hintsUsed,
      },
      create: {
        userId,
        type: 'PUZZLE',
        referenceId: levelId,
        starsEarned: Math.max(1, Math.min(3, starsEarned)),
        hintsUsed,
      },
    });

    // Tambah XP siswa (+50 XP per level selesai)
    const xpBonus = starsEarned * 20;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xpPoints: { increment: xpBonus },
      },
    });

    // Update rank title jika XP mencukupi
    let newRank = updatedUser.rankTitle;
    if (updatedUser.xpPoints >= 300) {
      newRank = 'Arsitek Jaringan Cilik';
    } else if (updatedUser.xpPoints >= 150) {
      newRank = 'Teknisi Kabel';
    }

    if (newRank !== updatedUser.rankTitle) {
      await prisma.user.update({
        where: { id: userId },
        data: { rankTitle: newRank },
      });
    }

    res.json({
      success: true,
      message: 'Level berhasil diselesaikan!',
      data: {
        progress,
        earnedXp: xpBonus,
        currentXp: updatedUser.xpPoints + xpBonus,
        rankTitle: newRank,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
