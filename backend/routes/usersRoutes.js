// backend/routes/usersRoutes.js
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

router.get('/:userId', usersController.getUserInfo);

module.exports = router;

