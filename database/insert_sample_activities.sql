-- Farklı bölgelerde 10 tane sahte etkinlik verisi ekleme
-- Mevcut zone_id'leri kullanarak dinamik olarak etkinlikler oluşturur

-- Önce mevcut zone_id'leri kontrol et (opsiyonel)
-- SELECT zone_id, name FROM lake_zones ORDER BY zone_id LIMIT 10;

-- Etkinlikleri ekle
-- Not: zone_id değerleri mevcut lake_zones tablosundaki ID'ler olmalıdır
-- Eğer zone_id'ler farklıysa, aşağıdaki değerleri güncelleyin

INSERT INTO activities (zone_id, title, description, start_date, end_date) VALUES

-- GEÇMİŞ ETKİNLİKLER (3 tane)
-- 1. Geçmiş etkinlik - 1 ay önce
((SELECT zone_id FROM lake_zones ORDER BY zone_id LIMIT 1 OFFSET 0), 
 'Balık Avı Turnuvası 2024', 
 'Yıllık geleneksel balık avı turnuvası. Tüm balıkçılar davetlidir. Ödüller: 1. 5000₺, 2. 3000₺, 3. 2000₺',
 NOW() - INTERVAL '1 month' - INTERVAL '2 days',
 NOW() - INTERVAL '1 month'),

-- 2. Geçmiş etkinlik - 2 hafta önce
((SELECT zone_id FROM lake_zones ORDER BY zone_id LIMIT 1 OFFSET 1), 
 'Tekne Bakım ve Onarım Kursu', 
 'Tekne sahipleri için ücretsiz bakım ve onarım kursu. Deneyimli teknisyenler eşliğinde.',
 NOW() - INTERVAL '2 weeks' - INTERVAL '1 day',
 NOW() - INTERVAL '2 weeks'),

-- 3. Geçmiş etkinlik - 1 hafta önce
((SELECT zone_id FROM lake_zones ORDER BY zone_id LIMIT 1 OFFSET 2), 
 'Çocuklar İçin Balıkçılık Atölyesi', 
 '7-14 yaş arası çocuklar için eğlenceli balıkçılık atölyesi. Malzemeler tarafımızdan sağlanacaktır.',
 NOW() - INTERVAL '1 week' - INTERVAL '3 hours',
 NOW() - INTERVAL '1 week'),

-- GÜNCEL ETKİNLİKLER (3 tane)
-- 4. Güncel etkinlik - şu anda devam ediyor
((SELECT zone_id FROM lake_zones ORDER BY zone_id LIMIT 1 OFFSET 3), 
 'Kış Sezonu Balıkçılık Kampı', 
 'Kış aylarına özel balıkçılık kampı. Sıcak çadırlar, sıcak içecekler ve profesyonel rehberlik.',
 NOW() - INTERVAL '2 days',
 NOW() + INTERVAL '3 days'),

-- 5. Güncel etkinlik - bugün başladı
((SELECT zone_id FROM lake_zones ORDER BY zone_id LIMIT 1 OFFSET 4), 
 'Fotoğrafçılık Yarışması', 
 'Van Gölü manzaralarını yakalayın! En iyi fotoğraflar sergilenecek ve ödüllendirilecek.',
 NOW() - INTERVAL '5 hours',
 NOW() + INTERVAL '2 days'),

-- 6. Güncel etkinlik - dün başladı, yarın bitiyor
((SELECT zone_id FROM lake_zones ORDER BY zone_id LIMIT 1 OFFSET 5), 
 'Ekipman Deneme Günü', 
 'Yeni balıkçılık ekipmanlarını ücretsiz deneyin! Tüm ekipmanlar test edilebilir.',
 NOW() - INTERVAL '1 day',
 NOW() + INTERVAL '1 day'),

-- GELECEK ETKİNLİKLER (4 tane)
-- 7. Gelecek etkinlik - 3 gün sonra
((SELECT zone_id FROM lake_zones ORDER BY zone_id LIMIT 1 OFFSET 6), 
 'Yeni Başlayanlar İçin Balıkçılık Eğitimi', 
 'Balıkçılığa yeni başlayanlar için temel eğitim. Teknikler, malzemeler ve güvenlik kuralları.',
 NOW() + INTERVAL '3 days',
 NOW() + INTERVAL '3 days' + INTERVAL '6 hours'),

-- 8. Gelecek etkinlik - 1 hafta sonra
((SELECT zone_id FROM lake_zones ORDER BY zone_id LIMIT 1 OFFSET 7), 
 'Gece Balıkçılığı Turu', 
 'Ay ışığında özel gece balıkçılığı turu. Deneyimli rehberler eşliğinde unutulmaz bir gece.',
 NOW() + INTERVAL '1 week',
 NOW() + INTERVAL '1 week' + INTERVAL '8 hours'),

-- 9. Gelecek etkinlik - 2 hafta sonra
((SELECT zone_id FROM lake_zones ORDER BY zone_id LIMIT 1 OFFSET 8), 
 'Aile Balıkçılık Günü', 
 'Tüm aile bireyleri için özel etkinlik. Çocuklar için oyun alanı ve yetişkinler için yarışmalar.',
 NOW() + INTERVAL '2 weeks',
 NOW() + INTERVAL '2 weeks' + INTERVAL '1 day'),

-- 10. Gelecek etkinlik - 1 ay sonra
((SELECT zone_id FROM lake_zones ORDER BY zone_id LIMIT 1 OFFSET 9), 
 'Büyük Balıkçılık Festivali 2025', 
 'Yılın en büyük balıkçılık festivali! Konserler, yarışmalar, yemek standları ve çok daha fazlası.',
 NOW() + INTERVAL '1 month',
 NOW() + INTERVAL '1 month' + INTERVAL '3 days');

-- Kontrol için: Eklenen etkinlikleri görüntüle
-- SELECT a.activity_id, a.title, z.name as zone_name, a.start_date, a.end_date,
--        CASE 
--          WHEN a.end_date < NOW() THEN 'Geçmiş'
--          WHEN a.start_date <= NOW() AND a.end_date >= NOW() THEN 'Güncel'
--          ELSE 'Gelecek'
--        END as durum
-- FROM activities a
-- JOIN lake_zones z ON a.zone_id = z.zone_id
-- ORDER BY a.start_date;

