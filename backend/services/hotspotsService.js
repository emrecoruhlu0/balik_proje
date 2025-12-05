// backend/services/hotspotsService.js

const pool = require("../config/db");


exports.getHotspots = async () => {
  const query = `
    SELECT
      h.hotspot_id,
      h.species_id,
      s.common_name AS species_name,
      h.intensity,
      h.last_seen,
      h.depth,
      ST_AsGeoJSON(h.geom) AS geometry
    FROM fish_hotspots h
    JOIN fish_species s ON s.species_id = h.species_id
    ORDER BY h.last_seen DESC;
  `;

  const { rows } = await pool.query(query);

  const features = rows.map((row) => ({
    type: "Feature",
    properties: {
      id: row.hotspot_id,
      species_id: row.species_id,
      species_name: row.species_name,
      intensity: row.intensity,
      last_seen: row.last_seen,
      depth: row.depth
    },
    geometry: JSON.parse(row.geometry)
  }));

  return {
    type: "FeatureCollection",
    features
  };
};


// 🔹 YENİ HOTSPOT EKLE (POINT)
exports.createHotspot = async ({ species_id, intensity, depth, lat, lng }) => {
  const query = `
    INSERT INTO fish_hotspots (species_id, intensity, depth, geom)
    VALUES ($1, $2, $3, ST_SetSRID(ST_Point($4, $5), 4326))
    RETURNING hotspot_id, species_id, intensity, depth, last_seen,
              ST_AsGeoJSON(geom) AS geometry;
  `;

  const values = [species_id, intensity, depth, lng, lat]; // DİKKAT: lng, lat sırası

  const { rows } = await pool.query(query, values);

  return rows[0];
};

// 🔹 HOTSPOT GÜNCELLE
exports.updateHotspot = async (id, { species_id, intensity, depth, lat, lng }) => {
  const query = `
    UPDATE fish_hotspots
    SET 
      species_id = $1,
      intensity = $2,
      depth = $3, 
      geom = ST_SetSRID(ST_Point($4, $5), 4326),
      last_seen = NOW()
    WHERE hotspot_id = $6
    RETURNING hotspot_id, species_id, intensity, depth, last_seen,
              ST_AsGeoJSON(geom) AS geometry;
  `;

  const values = [species_id, intensity, depth, lng, lat, id];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

// 🔹 HOTSPOT SİL
exports.deleteHotspot = async (id) => {
  const query = `
    DELETE FROM fish_hotspots
    WHERE hotspot_id = $1
    RETURNING hotspot_id;
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0];
};
