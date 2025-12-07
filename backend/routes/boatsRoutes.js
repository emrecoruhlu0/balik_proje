// backend/routes/boatsRoutes.js
const express = require('express');
const router = express.Router();
const { getActiveBoats, getAvailableBoats } = require('../controllers/boatsController');

router.get('/active', getActiveBoats);
//uygun tekneler için eklendi.
router.get('/available', getAvailableBoats);

module.exports = router;
