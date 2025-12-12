// equipment_rentals tablosunu Supabase'e ekleme scripti
// Kullanım: backend klasöründen: node create_equipment_rentals.js

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function createEquipmentRentalsTable() {
  // Supabase bağlantı bilgileri
  // .env dosyasından DATABASE_URL'i oku
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ HATA: DATABASE_URL .env dosyasında tanımlı değil!');
    console.log('💡 Supabase → Project Settings → Database → Connection String → Node.js');
    console.log('💡 .env dosyası backend/.env konumunda olmalı');
    process.exit(1);
  }

  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false } // Supabase için gerekli
  });

  try {
    await client.connect();
    console.log('✅ Supabase PostgreSQL\'e bağlanıldı.');

    // Önce referans tabloların varlığını kontrol et
    console.log('🔍 Referans tablolar kontrol ediliyor...');
    const usersCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    const equipmentsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'equipments'
      );
    `);

    if (!usersCheck.rows[0].exists) {
      console.error('❌ HATA: users tablosu bulunamadı!');
      console.log('💡 Önce users tablosunu oluşturun.');
      process.exit(1);
    }

    if (!equipmentsCheck.rows[0].exists) {
      console.error('❌ HATA: equipments tablosu bulunamadı!');
      console.log('💡 Önce equipments tablosunu oluşturun.');
      process.exit(1);
    }

    console.log('✅ Referans tablolar mevcut (users, equipments)');

    // SQL dosyasını oku (database klasöründen)
    const sqlPath = path.join(__dirname, '../database/create_equipment_rentals.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // SQL komutlarını çalıştır
    console.log('📝 equipment_rentals tablosu oluşturuluyor...');
    await client.query(sql);

    console.log('✅ equipment_rentals tablosu başarıyla oluşturuldu!');
    console.log('\n📋 Tablo yapısı:');
    console.log('   - equipment_rental_id (SERIAL PRIMARY KEY)');
    console.log('   - user_id (INTEGER NOT NULL, FK → users.user_id)');
    console.log('   - equipment_id (INTEGER NOT NULL, FK → equipments.equipment_id)');
    console.log('   - start_at (TIMESTAMP)');
    console.log('   - end_at (TIMESTAMP)');
    console.log('   - status (VARCHAR: ongoing/completed/cancelled)');
    console.log('   - created_at (TIMESTAMP)');
    console.log('   - updated_at (TIMESTAMP)');
    console.log('\n🔗 Foreign Key Constraints:');
    console.log('   - user_id → users(user_id) [CASCADE]');
    console.log('   - equipment_id → equipments(equipment_id) [RESTRICT]');

  } catch (err) {
    console.error('❌ Hata oluştu:', err.message);
    if (err.code === '42P07') {
      console.log('💡 Tablo zaten mevcut. Eğer yeniden oluşturmak istiyorsanız:');
      console.log('   DROP TABLE IF EXISTS equipment_rentals CASCADE;');
    } else if (err.code === '42P01') {
      console.log('💡 HATA: Referans tablolar bulunamadı!');
      console.log('   Bu script çalıştırılmadan önce şu tabloların mevcut olması gerekir:');
      console.log('   - users (user_id PRIMARY KEY ile)');
      console.log('   - equipments (equipment_id PRIMARY KEY ile)');
    } else if (err.code === '42830') {
      console.log('💡 HATA: Foreign key constraint oluşturulamadı!');
      console.log('   Referans tablolar (users, equipments) mevcut mu kontrol edin.');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Scripti çalıştır
createEquipmentRentalsTable();

