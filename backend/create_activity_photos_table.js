// activity_photos tablosunu oluşturma scripti
// Kullanım: backend klasöründen: node create_activity_photos_table.js

const { Client } = require('pg');
require('dotenv').config();

async function createActivityPhotosTable() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ HATA: DATABASE_URL .env dosyasında tanımlı değil!');
    process.exit(1);
  }

  const client = new Client({
    connectionString: connectionString,
    ssl: connectionString?.includes('supabase.co')
      ? { rejectUnauthorized: false }
      : false,
  });

  try {
    await client.connect();
    console.log('✅ Veritabanına bağlanıldı.');

    // Tablonun var olup olmadığını kontrol et
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'activity_photos'
      )
    `);

    if (checkTable.rows[0].exists) {
      console.log('⚠️  activity_photos tablosu zaten mevcut.');
      await client.end();
      return;
    }

    // Tabloyu oluştur
    await client.query(`
      CREATE TABLE activity_photos (
        photo_id SERIAL PRIMARY KEY,
        activity_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        
        CONSTRAINT fk_activity_photos_activity 
          FOREIGN KEY (activity_id) 
          REFERENCES activities(activity_id) 
          ON DELETE CASCADE 
          ON UPDATE CASCADE
      )
    `);

    console.log('✅ activity_photos tablosu başarıyla oluşturuldu.');

    // Index ekle
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_activity_photos_activity_id 
      ON activity_photos(activity_id)
    `);

    console.log('✅ Index eklendi.');

    // Yorumlar ekle
    await client.query(`
      COMMENT ON TABLE activity_photos IS 'Etkinlik fotoğrafları (base64 string olarak saklanır)'
    `);
    await client.query(`
      COMMENT ON COLUMN activity_photos.photo_id IS 'Fotoğraf ID (Primary Key)'
    `);
    await client.query(`
      COMMENT ON COLUMN activity_photos.activity_id IS 'Etkinlik ID (FK → activities.activity_id)'
    `);
    await client.query(`
      COMMENT ON COLUMN activity_photos.url IS 'Fotoğraf URL (base64 data URL)'
    `);

    console.log('✅ Yorumlar eklendi.');

    await client.end();
    console.log('✅ İşlem tamamlandı!');
  } catch (err) {
    console.error('❌ Hata:', err.message);
    console.error(err.stack);
    await client.end();
    process.exit(1);
  }
}

// Scripti çalıştır
createActivityPhotosTable();

