const pool = require('../config/db');

// Bölgeye göre etkinlikleri getir (geçmiş, güncel, gelecek olarak kategorize edilmiş)
exports.getActivitiesByZone = async (zoneId) => {
  const query = `
    SELECT 
      activity_id,
      zone_id,
      title,
      description,
      start_date,
      end_date,
      created_at
    FROM activities
    WHERE zone_id = $1
    ORDER BY start_date ASC
  `;

  const { rows } = await pool.query(query, [zoneId]);
  
  // Şu anki tarih
  const now = new Date();
  
  // Etkinlikleri kategorilere ayır
  const past = [];
  const current = [];
  const upcoming = [];
  
  rows.forEach(activity => {
    const startDate = new Date(activity.start_date);
    const endDate = new Date(activity.end_date);
    
    // Geçmiş: bitiş tarihi şu andan önce
    if (endDate < now) {
      past.push(activity);
    }
    // Güncel: başlangıç tarihi şu andan önce veya eşit VE bitiş tarihi şu andan sonra
    else if (startDate <= now && endDate >= now) {
      current.push(activity);
    }
    // Gelecek: başlangıç tarihi şu andan sonra
    else {
      upcoming.push(activity);
    }
  });
  
  return {
    past,
    current,
    upcoming
  };
};

// Tüm etkinlikleri getir (opsiyonel, şimdilik kullanmayacağız)
exports.getAllActivities = async () => {
  const query = `
    SELECT 
      a.activity_id,
      a.zone_id,
      a.title,
      a.description,
      a.start_date,
      a.end_date,
      a.created_at,
      z.name as zone_name
    FROM activities a
    JOIN lake_zones z ON a.zone_id = z.zone_id
    ORDER BY a.start_date ASC
  `;

  const { rows } = await pool.query(query);
  return rows;
};

