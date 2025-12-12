# Equipment Rentals Tablosu - Supabase Entegrasyonu

Bu dosya `equipment_rentals` tablosunu Supabase veritabanına eklemek için hazırlanmıştır.

## 📋 Tablo Yapısı

```sql
equipment_rentals (
    equipment_rental_id  SERIAL PRIMARY KEY
    user_id              INTEGER NOT NULL 
                         FOREIGN KEY REFERENCES users(user_id)
                         ON DELETE CASCADE ON UPDATE CASCADE
    equipment_id         INTEGER NOT NULL 
                         FOREIGN KEY REFERENCES equipments(equipment_id)
                         ON DELETE RESTRICT ON UPDATE CASCADE
    start_at             TIMESTAMP DEFAULT NOW()
    end_at               TIMESTAMP (NULL ise devam ediyor)
    status               VARCHAR(20) DEFAULT 'ongoing' 
                         CHECK (status IN ('ongoing', 'completed', 'cancelled'))
    created_at           TIMESTAMP DEFAULT NOW()
    updated_at           TIMESTAMP DEFAULT NOW()
)
```

## 🚀 Kullanım Yöntemleri

### Yöntem 1: Node.js Script ile (Önerilen)

1. `.env` dosyanızı `backend/.env` konumunda oluşturun ve `DATABASE_URL` değişkenini ekleyin:
   ```env
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   ```
   (Supabase → Project Settings → Database → Connection String → Node.js)

2. Scripti çalıştırın:
   ```bash
   cd backend
   node create_equipment_rentals.js
   ```

### Yöntem 2: Supabase SQL Editor ile

1. Supabase Dashboard'a gidin
2. Sol menüden **SQL Editor**'ı seçin
3. `create_equipment_rentals.sql` dosyasının içeriğini kopyalayın
4. SQL Editor'a yapıştırın ve **Run** butonuna tıklayın

### Yöntem 3: psql Komut Satırı ile

```bash
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" -f create_equipment_rentals.sql
```

## ⚠️ Önemli Notlar

1. **Foreign Key Constraints**: 
   - `user_id` → `users(user_id)` (ON DELETE CASCADE, ON UPDATE CASCADE)
   - `equipment_id` → `equipments(equipment_id)` (ON DELETE RESTRICT, ON UPDATE CASCADE)
   
   **ÖNEMLİ**: Bu script çalıştırılmadan önce `users` ve `equipments` tablolarının veritabanında mevcut olması gerekir!
   
   Eğer bu tablolar henüz yoksa, önce onları oluşturun veya foreign key constraint'lerini geçici olarak kaldırın.

2. **Index'ler**: Performans için otomatik olarak şu index'ler oluşturulur:
   - `user_id` üzerinde
   - `equipment_id` üzerinde
   - `status` üzerinde
   - `start_at` üzerinde

3. **Trigger**: `updated_at` alanı otomatik olarak güncellenir.

## ✅ Kontrol

Tabloyu kontrol etmek için:

```sql
-- Tablo yapısını görmek için
\d equipment_rentals

-- Veya
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'equipment_rentals';
```

## 🔄 Tabloyu Silmek İsterseniz

```sql
DROP TABLE IF EXISTS equipment_rentals CASCADE;
```

## 📝 Örnek Kullanım

```sql
-- Yeni kiralama kaydı
INSERT INTO equipment_rentals (user_id, equipment_id, start_at, status)
VALUES (1, 5, NOW(), 'ongoing');

-- Kiralama tamamlama
UPDATE equipment_rentals 
SET status = 'completed', end_at = NOW()
WHERE equipment_rental_id = 1;
```

