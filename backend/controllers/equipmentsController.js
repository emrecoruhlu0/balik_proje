// backend/controllers/equipmentsController.js
const equipmentsService = require('../services/equipmentsService');
const asyncWrapper = require('../middleware/asyncWrapper');

exports.getAvailableEquipment = asyncWrapper(async (req, res) => {
    const equipment = await equipmentsService.getAvailableEquipment();
    res.json(equipment);
});

