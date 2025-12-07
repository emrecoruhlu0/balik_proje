// backend/controllers/boatsController.js
const boatsService = require('../services/boatsService');
const asyncWrapper = require('../middleware/asyncWrapper');

exports.getActiveBoats = asyncWrapper(async (req, res) => {
    const boats = await boatsService.getActiveBoats();
    res.json(boats);
});

//uygun tekneleri almak için kullanılacak.
exports.getAvailableBoats = asyncWrapper(async (req, res) => {
    const boats = await boatsService.getAvailableBoats();
    res.json(boats);
});
