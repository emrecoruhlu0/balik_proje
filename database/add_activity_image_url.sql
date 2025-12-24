-- activities tablosuna image_url kolonu ekleme
-- Etkinlik fotoğrafları için

ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Yorum
COMMENT ON COLUMN activities.image_url IS 'Etkinlik fotoğrafı (base64 veya URL)';

