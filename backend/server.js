// backend/server.js
// Load env from project root even when running inside /backend
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- SUPABASE BAĞLANTISI ---
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// --- TEST ENDPOINT ---
app.get('/api/db-test', async (req, res) => {
  const { data, error } = await supabase.from("lake_zones").select("zone_id").limit(1);

  if (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }

  return res.json({ ok: true, data });
});

// --- ZONE LİSTELEME (GeoJSON Formatı) ---
app.get('/api/zones', async (req, res) => {
  const { data, error } = await supabase
    .rpc('get_zones_geojson');  // RPC fonksiyonunu kullanacağız (birazdan vereceğim)

  if (error) {
    console.error(error);
    return res.status(500).send("Supabase Hatası");
  }

  res.json(data);
});

app.listen(port, () => {
  console.log(`Backend çalışıyor: http://localhost:${port}`);
});
