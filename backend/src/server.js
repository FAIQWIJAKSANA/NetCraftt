require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
// CORS: izinkan semua origin (termasuk Netlify, localhost, dan React Native web)
app.use(cors({
  origin: (origin, callback) => {
    // Izinkan semua origin (mobile apps tidak kirim origin header)
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));


// Static files for hardware images
app.use('/static', express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'NetCraft Backend API',
    version: '1.1.0',
    timestamp: new Date().toISOString(),
  });
});

// Main API Routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal server',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 NetCraft Server berjalan di port http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔌 API Base URL: http://localhost:${PORT}/api`);
});
