const pool = require("../config/db");


// AYARLAR
const SIMULATION_INTERVAL = 5000; // 5 saniyede bir çalışır
const MOVEMENT_STEP = 0.15;    // Tekne hızı (~15 metre)
const SONAR_RANGE = 0.02;       // Radar tarama alanı
const CLUSTER_DISTANCE = 0.0002;  // 20 metre içindeki balıkları grupla

// --- YARDIMCI FONKSİYON: Sonar Verilerini Hotspot'a Dönüştür ---
async function syncSonarToHotspots(client) {
  try {
    // 1. Çok eski (15 sn+) Hotspotları temizle (Balık kaçtı simülasyonu)
    await client.query(`
      DELETE FROM fish_hotspots 
      WHERE last_seen < NOW() - INTERVAL '15 seconds'
    `);

    // 2. Son 10 saniyedeki radar verilerini analiz et, grupla ve Hotspot tablosuna yaz
    // ST_ClusterDBSCAN: Yakın noktaları tek bir cluster ID altında toplar.
    const query = `
      INSERT INTO fish_hotspots (species_id, intensity, geom, last_seen, depth)
      SELECT 
        FLOOR(RANDOM() * 3 + 1)::int AS species_id,
        CEIL(AVG(signal_strength) / 10)        AS intensity,
        ST_Centroid(ST_Collect(geom))          AS geom,
        NOW()                                  AS last_seen,
        ROUND((RANDOM() * 20 + 2)::numeric, 1) AS depth
      FROM (
        SELECT 
          s.*,
          ST_ClusterDBSCAN(
            s.geom,
            $1::double precision,  -- eps (mesafe eşiği)
            1                      -- minpoints
          ) OVER () AS cid
        FROM sonar_readings s
        WHERE s.detected_at > NOW() - INTERVAL '10 seconds'
      ) sub
      GROUP BY cid;
    `;

    await client.query(query, [CLUSTER_DISTANCE]);

  } catch (err) {
    console.error("Hotspot Sync Hatası:", err);
  }
}


// --- ANA FONKSİYON: Simülasyonu Başlat ---
async function startSimulation() {
  console.log("🎣 Balık Radarı ve Tekne Simülasyonu Başlatıldı...");

  setInterval(async () => {
    const client = await pool.connect();
    try {
      // 1. Aktif Kiralamaları (Suda olan tekneleri) Bul
      const activeRentals = await client.query(`
        SELECT r.rental_id, r.boat_id, b.name, ST_X(b.current_geom) as lon, ST_Y(b.current_geom) as lat
        FROM rentals r
        JOIN boats b ON r.boat_id = b.boat_id
        WHERE r.status = 'ongoing'
      `);

      if (activeRentals.rows.length === 0) return; // Tekne yoksa bekleme

      for (const rental of activeRentals.rows) {
        let { rental_id, boat_id, lon, lat } = rental;

        // Koordinat yoksa başlangıç noktası ata (Örn: Göl ortası)
        if (!lon || !lat) { lon = 29.0; lat = 41.0; }

        // 2. Tekneyi Hareket Ettir (Random Walk)
        const newLon = lon + (Math.random() - 0.5) * MOVEMENT_STEP;
        const newLat = lat + (Math.random() - 0.5) * MOVEMENT_STEP;

        await client.query(`
          UPDATE boats SET current_geom = ST_SetSRID(ST_MakePoint($1, $2), 4326)
          WHERE boat_id = $3
        `, [newLon, newLat, boat_id]);

        // 3. Radar Taraması (%40 şansla balık bulsun)
        if (Math.random() > 0.6) {
          const signalStrength = Math.floor(Math.random() * 100) + 1;
          // Balığı teknenin biraz yakınına koy
          const fishLon = newLon + (Math.random() - 0.5) * 0.00001;
          const fishLat = newLat + (Math.random() - 0.5) * 0.00001;

          await client.query(`
              INSERT INTO sonar_readings (rental_id, geom, signal_strength)
              VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4)
            `, [rental_id, fishLon, fishLat, signalStrength]);

          console.log(`📡 Sinyal: ${rental.name} balık buldu! (Güç: ${signalStrength})`);

        }
      }

      // 4. Tüm verileri işle ve Hotspot tablosunu güncelle
      await syncSonarToHotspots(client);

    } catch (err) {
      console.error("Simülasyon Döngü Hatası:", err);
    } finally {
      client.release();
    }
  }, SIMULATION_INTERVAL);
}

module.exports = { startSimulation };