const activitiesService = require('../services/activitiesService');
const asyncWrapper = require('../middleware/asyncWrapper');

// Bölgeye göre etkinlikleri getir
exports.getActivitiesByZone = asyncWrapper(async (req, res) => {
  const { zoneId } = req.params;
  
  if (!zoneId) {
    return res.status(400).json({ error: 'Zone ID gerekli' });
  }
  
  const data = await activitiesService.getActivitiesByZone(zoneId);
  res.json(data);
});

// Tüm etkinlikleri getir (opsiyonel)
exports.getAllActivities = asyncWrapper(async (req, res) => {
  const data = await activitiesService.getAllActivities();
  res.json(data);
});

