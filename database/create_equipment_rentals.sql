-- equipment_rentals tablosu oluşturma
-- Supabase PostgreSQL için

CREATE TABLE IF NOT EXISTS equipment_rentals (
    equipment_rental_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    equipment_id INTEGER NOT NULL,
    start_at TIMESTAMP NOT NULL DEFAULT NOW(),
    end_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign Key Constraints
    CONSTRAINT fk_equipment_rentals_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(user_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_equipment_rentals_equipment 
        FOREIGN KEY (equipment_id) 
        REFERENCES equipments(equipment_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
);

-- Index'ler (performans için)
CREATE INDEX IF NOT EXISTS idx_equipment_rentals_user_id ON equipment_rentals(user_id);
CREATE INDEX IF NOT EXISTS idx_equipment_rentals_equipment_id ON equipment_rentals(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_rentals_status ON equipment_rentals(status);
CREATE INDEX IF NOT EXISTS idx_equipment_rentals_start_at ON equipment_rentals(start_at);

-- Updated_at otomatik güncelleme için trigger (opsiyonel)
CREATE OR REPLACE FUNCTION update_equipment_rentals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ı önce sil (varsa), sonra oluştur
DROP TRIGGER IF EXISTS trigger_update_equipment_rentals_updated_at ON equipment_rentals;
CREATE TRIGGER trigger_update_equipment_rentals_updated_at
    BEFORE UPDATE ON equipment_rentals
    FOR EACH ROW
    EXECUTE FUNCTION update_equipment_rentals_updated_at();

-- Yorumlar (opsiyonel)
COMMENT ON TABLE equipment_rentals IS 'Ekipman kiralama kayıtları';
COMMENT ON COLUMN equipment_rentals.equipment_rental_id IS 'Ekipman kiralama kayıt ID (Primary Key)';
COMMENT ON COLUMN equipment_rentals.user_id IS 'Kiralayan kullanıcı ID (FK → users.user_id)';
COMMENT ON COLUMN equipment_rentals.equipment_id IS 'Kiralanan ekipman ID (FK → equipments.equipment_id)';
COMMENT ON COLUMN equipment_rentals.start_at IS 'Kiralama başlangıç zamanı';
COMMENT ON COLUMN equipment_rentals.end_at IS 'Kiralama bitiş zamanı (NULL ise devam ediyor)';
COMMENT ON COLUMN equipment_rentals.status IS 'Kiralama durumu: ongoing, completed, cancelled';

