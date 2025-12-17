const express = require('express');
const router = express.Router();
const { getZones, getZoneStats, getAllZonesStats, getPopularZonesAnalysis } = require('../controllers/zonesController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Spesifik route'lar önce
router.get('/stats/all', getAllZonesStats);
router.get('/popular/analysis', authMiddleware, adminMiddleware, getPopularZonesAnalysis);
router.get('/:zoneId/stats', getZoneStats);

// Genel route'lar sonra
router.get('/', getZones);

module.exports = router;
