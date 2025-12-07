// backend/routes/rentalsRoutes.js
const express = require('express');
const router = express.Router();
const {
    createBoatRental,
    completeBoatRental,
} = require('../controllers/rentalsController');

// Tekne kiralama başlat
router.post('/boat', createBoatRental);

// Kiralamayı bitir
router.post('/:id/complete', completeBoatRental);

module.exports = router;
