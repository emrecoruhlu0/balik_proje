-- activity_photos (etkinlik fotoğrafları) tablosu oluşturma
-- Forum sistemindeki post_photos tablosuna benzer yapı
-- Supabase PostgreSQL için

CREATE TABLE IF NOT EXISTS activity_photos (
    photo_id SERIAL PRIMARY KEY,
    activity_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign Key Constraints
    CONSTRAINT fk_activity_photos_activity 
        FOREIGN KEY (activity_id) 
        REFERENCES activities(activity_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- Index'ler (performans için)
CREATE INDEX IF NOT EXISTS idx_activity_photos_activity_id ON activity_photos(activity_id);

-- Yorumlar
COMMENT ON TABLE activity_photos IS 'Etkinlik fotoğrafları (base64 string olarak saklanır)';
COMMENT ON COLUMN activity_photos.photo_id IS 'Fotoğraf ID (Primary Key)';
COMMENT ON COLUMN activity_photos.activity_id IS 'Etkinlik ID (FK → activities.activity_id)';
COMMENT ON COLUMN activity_photos.url IS 'Fotoğraf URL (base64 data URL)';

