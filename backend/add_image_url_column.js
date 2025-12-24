// activities tablosuna image_url sütunu ekleme scripti
// Kullanım: backend klasöründen: node add_image_url_column.js

const { Client } = require('pg');
require('dotenv').config();

async function addImageUrlColumn() {
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

    // Önce sütunun var olup olmadığını kontrol et
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'activities' AND column_name = 'image_url'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('⚠️  image_url sütunu zaten mevcut.');
      await client.end();
      return;
    }

    // Sütunu ekle
    await client.query(`
      ALTER TABLE activities 
      ADD COLUMN image_url TEXT
    `);

    console.log('✅ image_url sütunu başarıyla eklendi.');

    // Yorum ekle
    await client.query(`
      COMMENT ON COLUMN activities.image_url IS 'Etkinlik fotoğrafı (base64 veya URL)'
    `);

    console.log('✅ Yorum eklendi.');

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
addImageUrlColumn();

