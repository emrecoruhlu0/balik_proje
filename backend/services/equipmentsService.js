// backend/services/equipmentsService.js
const pool = require('../config/db');

// 🔹 Müsait ekipmanları getir (kiralanmamış olanlar)
exports.getAvailableEquipment = async () => {
  try {
    // Önce equipments tablosunun varlığını kontrol et
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'equipments'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.warn('⚠️ equipments tablosu bulunamadı, boş liste döndürülüyor');
      return [];
    }

    // equipment_rentals tablosu var mı kontrol et
    const rentalsTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'equipment_rentals'
      );
    `);

    // equipment_types tablosu var mı kontrol et
    const typesTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'equipment_types'
      );
    `);

    const hasTypesTable = typesTableCheck.rows[0].exists;
    const hasRentalsTable = rentalsTableCheck.rows[0].exists;

    let query;
    if (hasRentalsTable) {
      // Her iki tablo da varsa, kiralama kontrolü yap
      if (hasTypesTable) {
        // equipment_types tablosu varsa JOIN yap
        query = `
          SELECT
            e.equipment_id,
            e.type_id,
            e.model,
            e.brand,
            e.price_per_hour,
            e.status,
            et.name AS type_name
          FROM equipments e
          LEFT JOIN equipment_types et ON e.type_id = et.type_id
          WHERE (e.status = 'available' OR e.status IS NULL)
            AND e.equipment_id NOT IN (
              SELECT equipment_id
              FROM equipment_rentals
              WHERE status = 'ongoing'
            );
        `;
      } else {
        query = `
          SELECT
            e.equipment_id,
            e.type_id,
            e.model,
            e.brand,
            e.price_per_hour,
            e.status
          FROM equipments e
          WHERE (e.status = 'available' OR e.status IS NULL)
            AND e.equipment_id NOT IN (
              SELECT equipment_id
              FROM equipment_rentals
              WHERE status = 'ongoing'
            );
        `;
      }
    } else {
      // Sadece equipments tablosu varsa, status kontrolü yap
      if (hasTypesTable) {
        // equipment_types tablosu varsa JOIN yap
        query = `
          SELECT
            e.equipment_id,
            e.type_id,
            e.model,
            e.brand,
            e.price_per_hour,
            e.status,
            et.name AS type_name
          FROM equipments e
          LEFT JOIN equipment_types et ON e.type_id = et.type_id
          WHERE e.status = 'available' OR e.status IS NULL;
        `;
      } else {
        query = `
          SELECT
            e.equipment_id,
            e.type_id,
            e.model,
            e.brand,
            e.price_per_hour,
            e.status
          FROM equipments e
          WHERE e.status = 'available' OR e.status IS NULL;
        `;
      }
    }

    const { rows } = await pool.query(query);

    // Debug: İlk satırı logla
    if (rows.length > 0) {
      console.log('🔍 İlk ekipman örneği:', {
        equipment_id: rows[0].equipment_id,
        type_id: rows[0].type_id,
        type_name: rows[0].type_name,
        brand: rows[0].brand,
        model: rows[0].model
      });
    }

    return rows.map(row => ({
      equipment_id: row.equipment_id,
      type_id: row.type_id,
      type_name: row.type_name || null,
      brand: row.brand,
      model: row.model,
      price_per_hour: row.price_per_hour,
      status: row.status
    }));
  } catch (err) {
    console.error('❌ getAvailableEquipment hatası:', err.message);
    // Hata durumunda boş liste döndür, sunucu çökmesin
    return [];
  }
};
