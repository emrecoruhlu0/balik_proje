// backend/routes/equipmentsRoutes.js
const express = require('express');
const router = express.Router();
const { getAvailableEquipment } = require('../controllers/equipmentsController');

router.get('/available', getAvailableEquipment);

module.exports = router;

