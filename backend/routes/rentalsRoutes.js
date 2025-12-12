// backend/routes/rentalsRoutes.js
const express = require('express');
const router = express.Router();
const {
    createBoatRental,
    completeBoatRental,
    createEquipmentRental,
    completeEquipmentRental,
} = require('../controllers/rentalsController');

// Tekne kiralama başlat
router.post('/boat', createBoatRental);

// Ekipman kiralama başlat
router.post('/equipment', createEquipmentRental);

// Ekipman kiralamayı bitir (daha spesifik route önce gelmeli)
router.post('/equipment/:id/complete', completeEquipmentRental);

// Tekne kiralamayı bitir (genel route en sonda)
router.post('/:id/complete', completeBoatRental);

module.exports = router;
