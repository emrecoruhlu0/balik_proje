-- activities (etkinlikler) tablosu oluşturma
-- Supabase PostgreSQL için

CREATE TABLE IF NOT EXISTS activities (
    activity_id SERIAL PRIMARY KEY,
    zone_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign Key Constraints
    CONSTRAINT fk_activities_zone 
        FOREIGN KEY (zone_id) 
        REFERENCES lake_zones(zone_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Tarih kontrolü: bitiş tarihi başlangıç tarihinden sonra olmalı
    CONSTRAINT check_dates 
        CHECK (end_date >= start_date)
);

-- Index'ler (performans için)
CREATE INDEX IF NOT EXISTS idx_activities_zone_id ON activities(zone_id);
CREATE INDEX IF NOT EXISTS idx_activities_start_date ON activities(start_date);
CREATE INDEX IF NOT EXISTS idx_activities_end_date ON activities(end_date);

-- Updated_at otomatik güncelleme için trigger
CREATE OR REPLACE FUNCTION update_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ı önce sil (varsa), sonra oluştur
DROP TRIGGER IF EXISTS trigger_update_activities_updated_at ON activities;
CREATE TRIGGER trigger_update_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_activities_updated_at();

-- Yorumlar
COMMENT ON TABLE activities IS 'Bölgelere ait etkinlikler';
COMMENT ON COLUMN activities.activity_id IS 'Etkinlik ID (Primary Key)';
COMMENT ON COLUMN activities.zone_id IS 'Etkinliğin yapıldığı bölge ID (FK → lake_zones.zone_id)';
COMMENT ON COLUMN activities.title IS 'Etkinlik başlığı';
COMMENT ON COLUMN activities.description IS 'Etkinlik açıklaması';
COMMENT ON COLUMN activities.start_date IS 'Etkinlik başlangıç tarihi';
COMMENT ON COLUMN activities.end_date IS 'Etkinlik bitiş tarihi';

