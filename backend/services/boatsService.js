// backend/services/boatsService.js
const pool = require('../config/db');

exports.getActiveBoats = async () => {
  const query = `
    SELECT
      r.rental_id,
      b.boat_id,
      b.name,
      b.capacity,
      b.status,
      ST_AsGeoJSON(b.current_geom) AS geometry
    FROM rentals r
    JOIN boats b ON r.boat_id = b.boat_id
    WHERE r.status = 'ongoing'
      AND b.current_geom IS NOT NULL;
  `;

  const { rows } = await pool.query(query);

  // Basit bir dizi döndürüyoruz
  return rows.map(row => ({
    rental_id: row.rental_id,
    boat_id: row.boat_id,
    name: row.name,
    capacity: row.capacity,
    status: row.status,
    geometry: JSON.parse(row.geometry)
  }));
};

// 🔹 Yeni: müsait tekneler (iskede bekleyenler)
exports.getAvailableBoats = async () => {
  const query = `
    SELECT
      boat_id,
      name,
      capacity,
      price_per_hour,
      status,
      ST_AsGeoJSON(current_geom) AS geometry
    FROM boats
    WHERE status = 'available';
  `;

  const { rows } = await pool.query(query);

  return rows.map(row => ({
    boat_id: row.boat_id,
    name: row.name,
    capacity: row.capacity,
    price_per_hour: row.price_per_hour,
    status: row.status,
    geometry: row.geometry ? JSON.parse(row.geometry) : null
  }));
};
