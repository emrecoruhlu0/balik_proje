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
