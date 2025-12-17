-- ============================================
-- İLERİ SEVİYE SQL SORGULARI
-- İptal edilen iki sorgunun zorluk muadilleri
-- ============================================

-- ============================================
-- SORGU A: Kullanıcı Bazlı En Popüler Bölgeler ve Aktivite Analizi
-- Zorluk: Orta-İleri (4+ JOIN, Aggregate Functions, GROUP BY, HAVING, ORDER BY, CASE)
-- ============================================
-- Bu sorgu, her bölge için:
-- - Toplam aktivite sayısı
-- - Toplam forum post sayısı
-- - Toplam yorum sayısı
-- - Toplam beğeni sayısı
-- - En aktif kullanıcı sayısı (aktivite, post, yorum yapan)
-- - Ortalama kullanıcı başına aktivite sayısı
-- bilgilerini getirir ve popülerlik sıralaması yapar.

SELECT 
    lz.zone_id,
    lz.name AS zone_name,
    COUNT(DISTINCT a.activity_id) AS total_activities,
    COUNT(DISTINCT p.post_id) AS total_posts,
    COUNT(DISTINCT c.comment_id) AS total_comments,
    COUNT(DISTINCT l.like_id) AS total_likes,
    COUNT(DISTINCT 
        CASE 
            WHEN a.activity_id IS NOT NULL THEN a.activity_id
            WHEN p.post_id IS NOT NULL THEN p.user_id
            WHEN c.comment_id IS NOT NULL THEN c.user_id
        END
    ) AS active_users_count,
    CASE 
        WHEN COUNT(DISTINCT 
            CASE 
                WHEN a.activity_id IS NOT NULL THEN a.activity_id
                WHEN p.post_id IS NOT NULL THEN p.user_id
                WHEN c.comment_id IS NOT NULL THEN c.user_id
            END
        ) > 0 
        THEN ROUND(
            COUNT(DISTINCT a.activity_id)::NUMERIC / 
            NULLIF(COUNT(DISTINCT 
                CASE 
                    WHEN a.activity_id IS NOT NULL THEN a.activity_id
                    WHEN p.post_id IS NOT NULL THEN p.user_id
                    WHEN c.comment_id IS NOT NULL THEN c.user_id
                END
            ), 0), 
            2
        )
        ELSE 0 
    END AS avg_activities_per_user,
    -- Popülerlik skoru (aktivite + post + yorum + beğeni ağırlıklı)
    (
        COUNT(DISTINCT a.activity_id) * 3 +
        COUNT(DISTINCT p.post_id) * 2 +
        COUNT(DISTINCT c.comment_id) * 1.5 +
        COUNT(DISTINCT l.like_id) * 1
    ) AS popularity_score
FROM 
    lake_zones lz
    LEFT JOIN activities a ON lz.zone_id = a.zone_id
    LEFT JOIN posts p ON lz.zone_id = p.zone_id
    LEFT JOIN comments c ON p.post_id = c.post_id
    LEFT JOIN likes l ON p.post_id = l.post_id
GROUP BY 
    lz.zone_id, lz.name
HAVING 
    COUNT(DISTINCT a.activity_id) > 0 
    OR COUNT(DISTINCT p.post_id) > 0 
    OR COUNT(DISTINCT c.comment_id) > 0
ORDER BY 
    popularity_score DESC,
    total_activities DESC,
    total_posts DESC;

-- ============================================
-- SORGU B: Aylık Kiralama Trend Analizi ve Karşılaştırma
-- Zorluk: İleri (Window Functions, Subquery, Aggregate Functions, CASE, CTE)
-- ============================================
-- Bu sorgu, her ay için:
-- - Tekne kiralama sayısı ve geliri
-- - Ekipman kiralama sayısı ve geliri
-- - Toplam gelir
-- - Önceki aya göre değişim yüzdesi
-- - En yoğun gün (ay içinde)
-- bilgilerini getirir ve trend analizi yapar.

WITH monthly_revenue AS (
    -- Tekne kiralamaları için aylık gelir
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
    
    -- Ekipman kiralamaları için aylık gelir
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
    -- Her ay için en yoğun günü bul (tekne kiralamaları)
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
    
    -- Her ay için en yoğun günü bul (ekipman kiralamaları)
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
    -- Önceki aya göre gelir değişim yüzdesi
    CASE 
        WHEN mwp.previous_month_revenue IS NOT NULL AND mwp.previous_month_revenue > 0
        THEN ROUND(
            ((mwp.total_revenue - mwp.previous_month_revenue) / mwp.previous_month_revenue * 100)::NUMERIC, 
            2
        )
        ELSE NULL
    END AS revenue_change_percent,
    -- Önceki aya göre kiralama değişim yüzdesi
    CASE 
        WHEN mwp.previous_month_rentals IS NOT NULL AND mwp.previous_month_rentals > 0
        THEN ROUND(
            ((mwp.total_rentals - mwp.previous_month_rentals)::NUMERIC / mwp.previous_month_rentals * 100), 
            2
        )
        ELSE NULL
    END AS rental_change_percent,
    -- En yoğun gün
    TO_CHAR(dp.peak_day, 'YYYY-MM-DD') AS peak_day,
    dp.daily_rentals AS peak_day_rentals,
    -- Trend göstergesi
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

