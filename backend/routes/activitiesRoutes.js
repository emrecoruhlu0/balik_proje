const express = require('express');
const router = express.Router();
const { getActivitiesByZone, getAllActivities } = require('../controllers/activitiesController');

router.get('/zone/:zoneId', getActivitiesByZone);
router.get('/', getAllActivities);

module.exports = router;

