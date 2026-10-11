const prisma = require('../config/db');

// Ambil semua kartu hardware untuk katalog/carousel
exports.getAllHardwareCards = async (req, res) => {
  try {
    const cards = await prisma.hardwareCard.findMany({
      orderBy: { createdAt: 'asc' },
    });

    // Parse hotspotsJson ke bentuk JSON Object
    const formattedCards = cards.map((card) => ({
      ...card,
      hotspots: JSON.parse(card.hotspotsJson || '[]'),
    }));

    res.json({ success: true, data: formattedCards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Ambil detail kartu hardware berdasarkan slug (misal: 'router', 'switch')
exports.getHardwareBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const card = await prisma.hardwareCard.findUnique({
      where: { slug },
    });

    if (!card) {
      return res.status(404).json({ success: false, message: 'Hardware tidak ditemukan' });
    }

    res.json({
      success: true,
      data: {
        ...card,
        hotspots: JSON.parse(card.hotspotsJson || '[]'),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
