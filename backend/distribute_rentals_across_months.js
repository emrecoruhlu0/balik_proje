// Script to distribute rentals across different months
// This will spread all rentals from December 2025 to different months in 2025

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function distributeRentals() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('📊 Kiralamaları farklı aylara yayılıyor...\n');

    // 2025 yılının ayları (Ocak'tan Aralık'a)
    const months = [
      { month: 1, name: 'Ocak' },
      { month: 2, name: 'Şubat' },
      { month: 3, name: 'Mart' },
      { month: 4, name: 'Nisan' },
      { month: 5, name: 'Mayıs' },
      { month: 6, name: 'Haziran' },
      { month: 7, name: 'Temmuz' },
      { month: 8, name: 'Ağustos' },
      { month: 9, name: 'Eylül' },
      { month: 10, name: 'Ekim' },
      { month: 11, name: 'Kasım' },
      { month: 12, name: 'Aralık' }
    ];

    // Boat rentals'ı yay
    console.log('🚤 Tekne kiralamaları işleniyor...');
    const boatRentalsRes = await client.query(`
      SELECT rental_id, start_at, end_at, 
             EXTRACT(EPOCH FROM (end_at - start_at)) as duration_seconds
      FROM rentals
      WHERE status = 'completed'
      ORDER BY rental_id
    `);

    const boatRentals = boatRentalsRes.rows;
    console.log(`   Toplam ${boatRentals.length} tekne kiralama bulundu`);

    for (let i = 0; i < boatRentals.length; i++) {
      const rental = boatRentals[i];
      const monthIndex = i % 12;
      const targetMonth = months[monthIndex];
      
      // Ay içinde rastgele bir gün (1-28 arası) ve saat (8-18 arası)
      const randomDay = Math.floor(Math.random() * 28) + 1;
      const randomHour = Math.floor(Math.random() * 11) + 8; // 8-18 arası
      const randomMinute = Math.floor(Math.random() * 60);
      
      const newStartAt = new Date(2025, targetMonth.month - 1, randomDay, randomHour, randomMinute, 0);
      const durationSeconds = rental.duration_seconds || 3600; // Varsayılan 1 saat
      const newEndAt = new Date(newStartAt.getTime() + durationSeconds * 1000);

      await client.query(
        `UPDATE rentals 
         SET start_at = $1, end_at = $2 
         WHERE rental_id = $3`,
        [newStartAt, newEndAt, rental.rental_id]
      );

      if ((i + 1) % 5 === 0 || i === boatRentals.length - 1) {
        console.log(`   ${i + 1}/${boatRentals.length} tekne kiralama güncellendi`);
      }
    }

    // Equipment rentals'ı yay
    console.log('\n🎣 Ekipman kiralamaları işleniyor...');
    const equipmentRentalsRes = await client.query(`
      SELECT equipment_rental_id, start_at, end_at,
             EXTRACT(EPOCH FROM (COALESCE(end_at, NOW()) - start_at)) as duration_seconds
      FROM equipment_rentals
      WHERE status = 'completed'
      ORDER BY equipment_rental_id
    `);

    const equipmentRentals = equipmentRentalsRes.rows;
    console.log(`   Toplam ${equipmentRentals.length} ekipman kiralama bulundu`);

    for (let i = 0; i < equipmentRentals.length; i++) {
      const rental = equipmentRentals[i];
      const monthIndex = i % 12;
      const targetMonth = months[monthIndex];
      
      // Ay içinde rastgele bir gün (1-28 arası) ve saat (8-18 arası)
      const randomDay = Math.floor(Math.random() * 28) + 1;
      const randomHour = Math.floor(Math.random() * 11) + 8; // 8-18 arası
      const randomMinute = Math.floor(Math.random() * 60);
      
      const newStartAt = new Date(2025, targetMonth.month - 1, randomDay, randomHour, randomMinute, 0);
      const durationSeconds = rental.duration_seconds || 3600; // Varsayılan 1 saat
      const newEndAt = new Date(newStartAt.getTime() + durationSeconds * 1000);

      await client.query(
        `UPDATE equipment_rentals 
         SET start_at = $1, end_at = $2 
         WHERE equipment_rental_id = $3`,
        [newStartAt, newEndAt, rental.equipment_rental_id]
      );

      if ((i + 1) % 5 === 0 || i === equipmentRentals.length - 1) {
        console.log(`   ${i + 1}/${equipmentRentals.length} ekipman kiralama güncellendi`);
      }
    }

    await client.query('COMMIT');
    
    console.log('\n✅ Tüm kiralamalar başarıyla farklı aylara yayıldı!');
    console.log('\n📅 Dağılım:');
    console.log('   - Kiralamalar 2025 yılının 12 ayına eşit olarak dağıtıldı');
    console.log('   - Her ay içinde rastgele gün ve saatlere yerleştirildi');
    console.log('   - Günler: 1-28 arası rastgele');
    console.log('   - Saatler: 8:00-18:00 arası rastgele');
    console.log('   - Süreler korundu\n');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Hata oluştu:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Scripti çalıştır
distributeRentals();

