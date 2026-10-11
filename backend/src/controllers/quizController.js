const prisma = require('../config/db');

// Ambil kartu pernyataan untuk Tinder Swipe
exports.getSwipeCards = async (req, res) => {
  try {
    const cards = await prisma.quizSwipe.findMany({
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: cards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit hasil swipe kuis
exports.submitSwipeResult = async (req, res) => {
  try {
    const { userId, totalCorrect, totalQuestions } = req.body;

    if (userId) {
      // Berikan bonus XP: 10 XP per jawaban benar
      const earnedXp = (totalCorrect || 0) * 10;
      await prisma.user.update({
        where: { id: userId },
        data: {
          xpPoints: { increment: earnedXp },
        },
      });

      return res.json({
        success: true,
        message: 'Hasil kuis swipe berhasil disimpan!',
        data: {
          earnedXp,
          accuracy: Math.round(((totalCorrect || 0) / (totalQuestions || 1)) * 100),
        },
      });
    }

    res.json({ success: true, message: 'Hasil diterima tanpa user' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
