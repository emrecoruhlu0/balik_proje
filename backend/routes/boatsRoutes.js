// backend/routes/boatsRoutes.js
const express = require('express');
const router = express.Router();
const { getActiveBoats } = require('../controllers/boatsController');

router.get('/active', getActiveBoats);

module.exports = router;
