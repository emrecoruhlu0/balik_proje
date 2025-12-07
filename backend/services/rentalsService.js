// backend/services/rentalsService.js
const pool = require('../config/db');

// Şimdilik sabit bir iskele noktası (Van Gölü orta civarı)
const DOCK_LON = 42.90;
const DOCK_LAT = 38.60;


// 🔹 Tekne kiralama başlat
exports.createBoatRental = async ({ boatId, durationMinutes = 60 }) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1) Tekneyi kilitle ve uygun mu kontrol et
        const boatRes = await client.query(
            `
      SELECT boat_id, status, current_geom
      FROM boats
      WHERE boat_id = $1
      FOR UPDATE;
      `,
            [boatId]
        );

        if (boatRes.rowCount === 0) {
            throw new Error('Boat not found');
        }

        const boat = boatRes.rows[0];

        if (boat.status !== 'available') {
            throw new Error('Boat is not available');
        }

        // 2) current_geom boşsa iskeleye koy
        if (!boat.current_geom) {
            await client.query(
                `
        UPDATE boats
        SET current_geom = ST_SetSRID(ST_MakePoint($1, $2), 4326)
        WHERE boat_id = $3;
        `,
                [DOCK_LON, DOCK_LAT, boatId]
            );
        }

        const safeDuration =
            typeof durationMinutes === 'number' && Number.isFinite(durationMinutes)
                ? durationMinutes
                : 60;

        // 3) Kiralama kaydı oluştur (şimdilik user_id = 1 demo kullanıcı)
        const rentalRes = await client.query(
            `
      INSERT INTO rentals (user_id, boat_id, start_at, end_at, status)
      VALUES ($1, $2, NOW(), NOW() + ($3 || ' minutes')::interval, 'ongoing')
      RETURNING rental_id, user_id, boat_id, start_at, end_at, status;
      `,
            [1, boatId, safeDuration]
        );

        const rental = rentalRes.rows[0];

        // 4) Teknenin durumunu rented yap
        await client.query(
            `
      UPDATE boats
      SET status = 'rented'
      WHERE boat_id = $1;
      `,
            [boatId]
        );

        await client.query('COMMIT');
        return rental;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// 🔹 Kiralamayı bitir, tekneyi iskeleye döndür
exports.completeBoatRental = async (rentalId) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1) Kiralamayı güncelle
        const rentalRes = await client.query(
            `
      UPDATE rentals
      SET status = 'completed',
          end_at = NOW()
      WHERE rental_id = $1
        AND status = 'ongoing'
      RETURNING rental_id, boat_id, user_id, start_at, end_at, status;
      `,
            [rentalId]
        );

        if (rentalRes.rowCount === 0) {
            throw new Error('Ongoing rental not found');
        }

        const rental = rentalRes.rows[0];
        const boatId = rental.boat_id;

        // 2) Tekneyi iskeleye çek ve tekrar available yap
        await client.query(
            `
      UPDATE boats
      SET status = 'available',
          current_geom = ST_SetSRID(ST_MakePoint($1, $2), 4326)
      WHERE boat_id = $3;
      `,
            [DOCK_LON, DOCK_LAT, boatId]
        );

        await client.query('COMMIT');
        return rental;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};
