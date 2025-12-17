-- ============================================
-- PROJEDE KULLANILAN 10 SQL SORGUSU
-- Tam olarak projede kullanıldığı gibi
-- ============================================

-- ============================================
-- SORGU 1: Kullanıcı Harcama İstatistikleri
-- Dosya: backend/services/usersService.js
-- ============================================
-- Kullanıcı bazlı (getUserStats):
SELECT 
    u.user_id,
    u.full_name,
    u.email,
    COUNT(DISTINCT r.rental_id) AS boat_rental_count,
    COUNT(DISTINCT er.equipment_rental_id) AS equipment_rental_count,
    COALESCE(SUM(p.amount), 0) AS total_spent
FROM users u
LEFT JOIN rentals r ON u.user_id = r.user_id
LEFT JOIN equipment_rentals er ON u.user_id = er.user_id
LEFT JOIN payments p ON (p.rental_id = r.rental_id OR p.equipment_rental_id = er.equipment_rental_id)
WHERE u.user_id = $1
GROUP BY u.user_id, u.full_name, u.email;

-- Tüm kullanıcılar (getAllUsersStats - Admin):
SELECT 
    u.user_id,
    u.full_name,
    u.email,
    COUNT(DISTINCT r.rental_id) AS boat_rental_count,
    COUNT(DISTINCT er.equipment_rental_id) AS equipment_rental_count,
    COALESCE(SUM(p.amount), 0) AS total_spent
FROM users u
LEFT JOIN rentals r ON u.user_id = r.user_id
LEFT JOIN equipment_rentals er ON u.user_id = er.user_id
LEFT JOIN payments p ON (p.rental_id = r.rental_id OR p.equipment_rental_id = er.equipment_rental_id)
GROUP BY u.user_id, u.full_name, u.email
HAVING 
    COUNT(DISTINCT r.rental_id) > 0 OR COUNT(DISTINCT er.equipment_rental_id) > 0
ORDER BY total_spent DESC;

-- ============================================
-- SORGU 2: Bölge İstatistikleri
-- Dosya: backend/services/zonesService.js
-- ============================================
-- Tek bölge (getZoneStats):
SELECT 
    lz.zone_id,
    lz.name AS zone_name,
    COUNT(DISTINCT a.activity_id) AS activity_count,
    COUNT(DISTINCT p.post_id) AS post_count,
    AVG(EXTRACT(EPOCH FROM (a.end_date - a.start_date)) / 3600) AS avg_activity_duration_hours,
    MIN(a.start_date) AS earliest_activity,
    MAX(a.end_date) AS latest_activity
FROM lake_zones lz
LEFT JOIN activities a ON lz.zone_id = a.zone_id
LEFT JOIN posts p ON lz.zone_id = p.zone_id
WHERE lz.zone_id = $1
GROUP BY lz.zone_id, lz.name;

-- Tüm bölgeler (getAllZonesStats):
SELECT 
    lz.zone_id,
    lz.name AS zone_name,
    COUNT(DISTINCT a.activity_id) AS activity_count,
    COUNT(DISTINCT p.post_id) AS post_count,
    AVG(EXTRACT(EPOCH FROM (a.end_date - a.start_date)) / 3600) AS avg_activity_duration_hours,
    MIN(a.start_date) AS earliest_activity,
    MAX(a.end_date) AS latest_activity
FROM lake_zones lz
LEFT JOIN activities a ON lz.zone_id = a.zone_id
LEFT JOIN posts p ON lz.zone_id = p.zone_id
GROUP BY lz.zone_id, lz.name
HAVING 
    COUNT(DISTINCT a.activity_id) > 0 OR COUNT(DISTINCT p.post_id) > 0
ORDER BY activity_count DESC, post_count DESC;

-- ============================================
-- SORGU 4: Forum İstatistikleri
-- Dosya: backend/services/forumService.js
-- ============================================
-- Kullanıcı bazlı (getUserForumStats):
SELECT 
    u.user_id,
    u.full_name,
    u.email,
    COUNT(DISTINCT p.post_id) AS post_count,
    COUNT(DISTINCT c.comment_id) AS comment_count,
    COUNT(DISTINCT l.post_id) AS liked_post_count,
    COUNT(DISTINCT pp.photo_id) AS total_photos
FROM users u
LEFT JOIN posts p ON u.user_id = p.user_id
LEFT JOIN comments c ON u.user_id = c.user_id
LEFT JOIN likes l ON u.user_id = l.user_id
LEFT JOIN post_photos pp ON p.post_id = pp.post_id
WHERE u.user_id = $1
GROUP BY u.user_id, u.full_name, u.email;

-- Tüm kullanıcılar (getAllUsersForumStats - Admin):
SELECT 
    u.user_id,
    u.full_name,
    u.email,
    COUNT(DISTINCT p.post_id) AS post_count,
    COUNT(DISTINCT c.comment_id) AS comment_count,
    COUNT(DISTINCT l.post_id) AS liked_post_count,
    COUNT(DISTINCT pp.photo_id) AS total_photos
FROM users u
LEFT JOIN posts p ON u.user_id = p.user_id
LEFT JOIN comments c ON u.user_id = c.user_id
LEFT JOIN likes l ON u.user_id = l.user_id
LEFT JOIN post_photos pp ON p.post_id = pp.post_id
GROUP BY u.user_id, u.full_name, u.email
HAVING 
    COUNT(DISTINCT p.post_id) > 0 OR COUNT(DISTINCT c.comment_id) > 0
ORDER BY post_count DESC, comment_count DESC;

-- ============================================
-- SORGU 5: Tekne ve Ekipman Gelir Analizi
-- Dosya: backend/services/rentalsService.js
-- ============================================
-- Tarih filtresi opsiyonel (year, month parametreleri)
SELECT 
    'Boat' AS rental_type,
    b.boat_id AS item_id,
    b.name AS item_name,
    COUNT(r.rental_id) AS rental_count,
    AVG(EXTRACT(EPOCH FROM (r.end_at - r.start_at)) / 3600) AS avg_rental_hours,
    SUM(p.amount) AS total_revenue,
    AVG(p.amount) AS avg_payment
FROM boats b
LEFT JOIN rentals r ON b.boat_id = r.boat_id
LEFT JOIN payments p ON r.rental_id = p.rental_id
WHERE (r.rental_id IS NULL OR p.payment_id IS NOT NULL)
    -- Tarih filtresi: AND DATE_TRUNC('month', p.paid_at) = DATE_TRUNC('month', $1::date)
GROUP BY b.boat_id, b.name
HAVING COUNT(r.rental_id) > 0

UNION ALL

SELECT 
    'Equipment' AS rental_type,
    e.equipment_id AS item_id,
    CONCAT(et.name, ' - ', COALESCE(e.brand, ''), ' ', COALESCE(e.model, '')) AS item_name,
    COUNT(er.equipment_rental_id) AS rental_count,
    AVG(EXTRACT(EPOCH FROM (COALESCE(er.end_at, NOW()) - er.start_at)) / 3600) AS avg_rental_hours,
    SUM(p.amount) AS total_revenue,
    AVG(p.amount) AS avg_payment
FROM equipments e
JOIN equipment_types et ON e.type_id = et.type_id
LEFT JOIN equipment_rentals er ON e.equipment_id = er.equipment_id
LEFT JOIN payments p ON er.equipment_rental_id = p.equipment_rental_id
WHERE (er.equipment_rental_id IS NULL OR p.payment_id IS NOT NULL)
    -- Tarih filtresi: AND DATE_TRUNC('month', p.paid_at) = DATE_TRUNC('month', $1::date)
GROUP BY e.equipment_id, et.name, e.brand, e.model
HAVING COUNT(er.equipment_rental_id) > 0

ORDER BY total_revenue DESC NULLS LAST;

-- ============================================
-- SORGU 6: Aktif Kullanıcılar
-- Dosya: backend/services/usersService.js
-- ============================================
SELECT 
    u.user_id,
    u.full_name,
    u.email,
    u.phone,
    r.name AS role_name,
    u.created_at
FROM users u
JOIN roles r ON u.role_id = r.role_id
WHERE u.status = 'active'
ORDER BY u.created_at DESC;

-- ============================================
-- SORGU 7: Gelecek Aktivite Analizi (Bölgeye Göre)
-- Dosya: backend/services/activitiesService.js
-- ============================================
SELECT 
    a.activity_id,
    a.title,
    a.description,
    a.start_date,
    a.end_date,
    lz.name AS zone_name
FROM activities a
JOIN lake_zones lz ON a.zone_id = lz.zone_id
WHERE a.start_date > NOW() AND lz.zone_id = $1
ORDER BY a.start_date ASC;

-- ============================================
-- SORGU 8: Müsait Tekneler (Fiyat Sıralı)
-- Dosya: backend/services/boatsService.js
-- ============================================
SELECT
    boat_id,
    name,
    capacity,
    price_per_hour,
    status,
    ST_AsGeoJSON(current_geom) AS geometry
FROM boats
WHERE status = 'available'
ORDER BY price_per_hour ASC;

-- ============================================
-- SORGU 10: Tüm Aktif Kiralamalar (Admin)
-- Dosya: backend/services/rentalsService.js
-- ============================================
-- Tekne Kiralamaları:
SELECT 
    r.rental_id,
    'boat' as rental_type,
    r.user_id,
    r.start_at,
    r.end_at,
    r.status,
    b.name as item_name,
    b.price_per_hour,
    u.full_name as user_name,
    u.email as user_email,
    EXTRACT(EPOCH FROM (GREATEST(r.end_at, NOW()) - r.start_at)) as duration_seconds,
    EXTRACT(EPOCH FROM (NOW() - r.start_at)) / 3600 AS hours_elapsed,
    CASE 
        WHEN NOW() > r.end_at THEN 'expired'
        ELSE 'active'
    END as rental_status
FROM rentals r
JOIN boats b ON r.boat_id = b.boat_id
JOIN users u ON r.user_id = u.user_id
WHERE r.status = 'ongoing'
ORDER BY r.start_at ASC;

-- Ekipman Kiralamaları:
SELECT 
    er.equipment_rental_id as rental_id,
    'equipment' as rental_type,
    er.user_id,
    er.start_at,
    er.end_at,
    er.status,
    CONCAT(e.brand, ' ', e.model) as item_name,
    e.price_per_hour,
    u.full_name as user_name,
    u.email as user_email,
    EXTRACT(EPOCH FROM (GREATEST(er.end_at, NOW()) - er.start_at)) as duration_seconds,
    EXTRACT(EPOCH FROM (NOW() - er.start_at)) / 3600 AS hours_elapsed,
    CASE 
        WHEN NOW() > er.end_at THEN 'expired'
        ELSE 'active'
    END as rental_status
FROM equipment_rentals er
JOIN equipments e ON er.equipment_id = e.equipment_id
JOIN users u ON er.user_id = u.user_id
WHERE er.status = 'ongoing'
ORDER BY er.start_at ASC;

-- ============================================
-- SORGU A: Popüler Bölgeler Analizi (İleri Seviye)
-- Dosya: backend/services/zonesService.js
-- ============================================
SELECT 
    lz.zone_id,
    lz.name AS zone_name,
    COUNT(DISTINCT a.activity_id) AS total_activities,
    COUNT(DISTINCT p.post_id) AS total_posts,
    COUNT(DISTINCT c.comment_id) AS total_comments,
    COUNT(DISTINCT (l.user_id, l.post_id)) AS total_likes,
    COUNT(DISTINCT 
        COALESCE(p.user_id, c.user_id)
    ) AS active_users_count,
    CASE 
        WHEN COUNT(DISTINCT COALESCE(p.user_id, c.user_id)) > 0 
        THEN ROUND(
            COUNT(DISTINCT a.activity_id)::NUMERIC / 
            NULLIF(COUNT(DISTINCT COALESCE(p.user_id, c.user_id)), 0), 
            2
        )
        ELSE 0 
    END AS avg_activities_per_user,
    (
        COUNT(DISTINCT a.activity_id) * 3 +
        COUNT(DISTINCT p.post_id) * 2 +
        COUNT(DISTINCT c.comment_id) * 1.5 +
        COUNT(DISTINCT (l.user_id, l.post_id)) * 1
    ) AS popularity_score
FROM 
    lake_zones lz
    LEFT JOIN activities a ON lz.zone_id = a.zone_id
    LEFT JOIN posts p ON lz.zone_id = p.zone_id
    LEFT JOIN comments c ON p.post_id = c.post_id
    LEFT JOIN likes l ON p.post_id = l.post_id
GROUP BY 
    lz.zone_id, lz.name
ORDER BY 
    popularity_score DESC,
    total_activities DESC,
    total_posts DESC;

-- ============================================
-- SORGU B: Aylık Kiralama Trend Analizi (İleri Seviye)
-- Dosya: backend/services/rentalsService.js
-- ============================================
WITH monthly_revenue AS (
    SELECT 
        DATE_TRUNC('month', p.paid_at) AS month,
        'Boat' AS rental_type,
        COUNT(DISTINCT r.rental_id) AS rental_count,
        SUM(p.amount) AS total_revenue,
        AVG(p.amount) AS avg_revenue
    FROM 
        payments p
        INNER JOIN rentals r ON p.rental_id = r.rental_id
    WHERE 
        p.paid_at IS NOT NULL
    GROUP BY 
        DATE_TRUNC('month', p.paid_at)
    
    UNION ALL
    
    SELECT 
        DATE_TRUNC('month', p.paid_at) AS month,
        'Equipment' AS rental_type,
        COUNT(DISTINCT er.equipment_rental_id) AS rental_count,
        SUM(p.amount) AS total_revenue,
        AVG(p.amount) AS avg_revenue
    FROM 
        payments p
        INNER JOIN equipment_rentals er ON p.equipment_rental_id = er.equipment_rental_id
    WHERE 
        p.paid_at IS NOT NULL
    GROUP BY 
        DATE_TRUNC('month', p.paid_at)
),
monthly_summary AS (
    SELECT 
        month,
        SUM(CASE WHEN rental_type = 'Boat' THEN rental_count ELSE 0 END) AS boat_rentals,
        SUM(CASE WHEN rental_type = 'Equipment' THEN rental_count ELSE 0 END) AS equipment_rentals,
        SUM(rental_count) AS total_rentals,
        SUM(CASE WHEN rental_type = 'Boat' THEN total_revenue ELSE 0 END) AS boat_revenue,
        SUM(CASE WHEN rental_type = 'Equipment' THEN total_revenue ELSE 0 END) AS equipment_revenue,
        SUM(total_revenue) AS total_revenue,
        AVG(CASE WHEN rental_type = 'Boat' THEN avg_revenue ELSE NULL END) AS avg_boat_revenue,
        AVG(CASE WHEN rental_type = 'Equipment' THEN avg_revenue ELSE NULL END) AS avg_equipment_revenue
    FROM 
        monthly_revenue
    GROUP BY 
        month
),
monthly_with_previous AS (
    SELECT 
        month,
        boat_rentals,
        equipment_rentals,
        total_rentals,
        boat_revenue,
        equipment_revenue,
        total_revenue,
        avg_boat_revenue,
        avg_equipment_revenue,
        LAG(total_revenue) OVER (ORDER BY month) AS previous_month_revenue,
        LAG(total_rentals) OVER (ORDER BY month) AS previous_month_rentals
    FROM 
        monthly_summary
),
daily_peak AS (
    SELECT 
        DATE_TRUNC('month', p.paid_at) AS month,
        DATE_TRUNC('day', p.paid_at) AS peak_day,
        COUNT(*) AS daily_rentals,
        ROW_NUMBER() OVER (PARTITION BY DATE_TRUNC('month', p.paid_at) ORDER BY COUNT(*) DESC) AS rn
    FROM 
        payments p
        INNER JOIN rentals r ON p.rental_id = r.rental_id
    WHERE 
        p.paid_at IS NOT NULL
    GROUP BY 
        DATE_TRUNC('month', p.paid_at), DATE_TRUNC('day', p.paid_at)
    
    UNION ALL
    
    SELECT 
        DATE_TRUNC('month', p.paid_at) AS month,
        DATE_TRUNC('day', p.paid_at) AS peak_day,
        COUNT(*) AS daily_rentals,
        ROW_NUMBER() OVER (PARTITION BY DATE_TRUNC('month', p.paid_at) ORDER BY COUNT(*) DESC) AS rn
    FROM 
        payments p
        INNER JOIN equipment_rentals er ON p.equipment_rental_id = er.equipment_rental_id
    WHERE 
        p.paid_at IS NOT NULL
    GROUP BY 
        DATE_TRUNC('month', p.paid_at), DATE_TRUNC('day', p.paid_at)
)
SELECT 
    TO_CHAR(mwp.month, 'YYYY-MM') AS month_year,
    TO_CHAR(mwp.month, 'Month YYYY') AS month_name,
    mwp.boat_rentals,
    mwp.equipment_rentals,
    mwp.total_rentals,
    ROUND(mwp.boat_revenue::NUMERIC, 2) AS boat_revenue,
    ROUND(mwp.equipment_revenue::NUMERIC, 2) AS equipment_revenue,
    ROUND(mwp.total_revenue::NUMERIC, 2) AS total_revenue,
    ROUND(mwp.avg_boat_revenue::NUMERIC, 2) AS avg_boat_revenue,
    ROUND(mwp.avg_equipment_revenue::NUMERIC, 2) AS avg_equipment_revenue,
    CASE 
        WHEN mwp.previous_month_revenue IS NOT NULL AND mwp.previous_month_revenue > 0
        THEN ROUND(
            ((mwp.total_revenue - mwp.previous_month_revenue) / mwp.previous_month_revenue * 100)::NUMERIC, 
            2
        )
        ELSE NULL
    END AS revenue_change_percent,
    CASE 
        WHEN mwp.previous_month_rentals IS NOT NULL AND mwp.previous_month_rentals > 0
        THEN ROUND(
            ((mwp.total_rentals - mwp.previous_month_rentals)::NUMERIC / mwp.previous_month_rentals * 100), 
            2
        )
        ELSE NULL
    END AS rental_change_percent,
    TO_CHAR(dp.peak_day, 'YYYY-MM-DD') AS peak_day,
    dp.daily_rentals AS peak_day_rentals,
    CASE 
        WHEN mwp.previous_month_revenue IS NOT NULL THEN
            CASE 
                WHEN mwp.total_revenue > mwp.previous_month_revenue THEN '📈 Artış'
                WHEN mwp.total_revenue < mwp.previous_month_revenue THEN '📉 Azalış'
                ELSE '➡️ Sabit'
            END
        ELSE '🆕 Yeni'
    END AS trend
FROM 
    monthly_with_previous mwp
    LEFT JOIN (
        SELECT 
            month,
            peak_day,
            SUM(daily_rentals) AS daily_rentals
        FROM 
            daily_peak
        WHERE 
            rn = 1
        GROUP BY 
            month, peak_day
    ) dp ON mwp.month = dp.month
ORDER BY 
    mwp.month DESC;

