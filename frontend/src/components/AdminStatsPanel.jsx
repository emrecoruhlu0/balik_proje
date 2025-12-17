// frontend/src/components/AdminStatsPanel.jsx
import React, { useState, useEffect } from 'react';
import { fetchActiveUsers, fetchAllUsersStats, fetchAllUsersForumStats, fetchAllZonesStats, fetchPopularZonesAnalysis } from '../api/api';

const AdminStatsPanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'spending', 'forum', 'zones', 'popular'
  const [activeUsers, setActiveUsers] = useState([]);
  const [allUsersStats, setAllUsersStats] = useState([]);
  const [allUsersForumStats, setAllUsersForumStats] = useState([]);
  const [allZonesStats, setAllZonesStats] = useState([]);
  const [popularZonesAnalysis, setPopularZonesAnalysis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [users, userStats, forumStats, zonesStats, popularZones] = await Promise.all([
        fetchActiveUsers().catch((err) => {
          console.error('Aktif kullanıcılar yüklenemedi:', err);
          return [];
        }),
        fetchAllUsersStats().catch((err) => {
          console.error('Kullanıcı istatistikleri yüklenemedi:', err);
          return [];
        }),
        fetchAllUsersForumStats().catch((err) => {
          console.error('Forum istatistikleri yüklenemedi:', err);
          return [];
        }),
        fetchAllZonesStats().catch((err) => {
          console.error('Bölge istatistikleri yüklenemedi:', err);
          return [];
        }),
        fetchPopularZonesAnalysis().catch((err) => {
          console.error('Popüler bölgeler analizi yüklenemedi:', err);
          console.error('Hata detayı:', err.message, err.stack);
          return [];
        }),
      ]);
      setActiveUsers(users);
      setAllUsersStats(userStats);
      setAllUsersForumStats(forumStats);
      setAllZonesStats(zonesStats);
      setPopularZonesAnalysis(popularZones);
      
      // Eğer popüler bölgeler boşsa ve hata yoksa, konsola bilgi ver
      if (popularZones.length === 0) {
        console.warn('Popüler bölgeler analizi boş döndü. Veritabanında aktivite, post veya yorum olan bölge bulunmuyor olabilir.');
        console.log('Yüklenen diğer veriler:', {
          users: users.length,
          userStats: userStats.length,
          forumStats: forumStats.length,
          zonesStats: zonesStats.length
        });
      } else {
        console.log('Popüler bölgeler yüklendi:', popularZones.length, 'bölge');
      }
    } catch (err) {
      console.error('Admin istatistikleri yüklenirken genel hata:', err);
      setError(err.message || 'İstatistikler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const panelStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px'
  };

  const contentStyle = {
    backgroundColor: '#020817',
    border: '2px solid #00ffff',
    borderRadius: '8px',
    padding: '20px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const buttonStyle = {
    padding: '10px 20px',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem'
  };

  return (
    <div style={panelStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
          <h2 style={{ color: '#00ffff', margin: 0 }}>📊 Sistem İstatistikleri</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>

        {error && (
          <div style={{ background: 'rgba(220, 38, 38, 0.2)', border: '1px solid #dc2626', borderRadius: '4px', padding: '10px', marginBottom: '15px', color: '#fca5a5', flexShrink: 0 }}>
            {error}
          </div>
        )}

        {/* Tab Butonları */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexShrink: 0, flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '8px 16px',
              background: activeTab === 'users' ? '#60a5fa' : '#333',
              color: activeTab === 'users' ? '#00111f' : '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              flex: 1,
              minWidth: '120px'
            }}
          >
            👥 Kullanıcılar
          </button>
          <button
            onClick={() => setActiveTab('spending')}
            style={{
              padding: '8px 16px',
              background: activeTab === 'spending' ? '#4ade80' : '#333',
              color: activeTab === 'spending' ? '#00111f' : '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              flex: 1,
              minWidth: '120px'
            }}
          >
            💰 Harcamalar
          </button>
          <button
            onClick={() => setActiveTab('forum')}
            style={{
              padding: '8px 16px',
              background: activeTab === 'forum' ? '#f59e0b' : '#333',
              color: activeTab === 'forum' ? '#00111f' : '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              flex: 1,
              minWidth: '120px'
            }}
          >
            💬 Forum
          </button>
          <button
            onClick={() => setActiveTab('zones')}
            style={{
              padding: '8px 16px',
              background: activeTab === 'zones' ? '#a855f7' : '#333',
              color: activeTab === 'zones' ? '#00111f' : '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              flex: 1,
              minWidth: '120px'
            }}
          >
            📍 Bölgeler
          </button>
          <button
            onClick={() => setActiveTab('popular')}
            style={{
              padding: '8px 16px',
              background: activeTab === 'popular' ? '#ec4899' : '#333',
              color: activeTab === 'popular' ? '#00111f' : '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              flex: 1,
              minWidth: '120px'
            }}
          >
            🔥 Popüler
          </button>
        </div>

        <div 
          className="admin-stats-panel-scroll" 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            overflowX: 'hidden',
            minHeight: 0,
            maxHeight: 'calc(90vh - 200px)',
            paddingRight: '12px',
            marginRight: '-12px'
          }}
        >
          {loading ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>Yükleniyor...</p>
          ) : (
            <>
              {/* Aktif Kullanıcılar Tab */}
              {activeTab === 'users' && (
                <div>
                  <h3 style={{ color: '#60a5fa', fontSize: '1rem', margin: '0 0 15px 0' }}>👥 Aktif Kullanıcılar ({activeUsers.length})</h3>
                <div style={{ 
                  maxHeight: '200px', 
                  overflowY: 'auto', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '10px',
                  paddingRight: '8px'
                }}>
                  {activeUsers.length > 0 ? (
                    activeUsers.map((user) => (
                      <div
                        key={user.user_id}
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: 8,
                          padding: 12,
                          fontSize: '0.9rem',
                        }}
                      >
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{user.full_name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '2px' }}>{user.email}</div>
                        <div style={{ fontSize: '0.85rem', color: '#aaa' }}>Rol: {user.role_name}</div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#888', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>Aktif kullanıcı bulunamadı.</p>
                  )}
                </div>
              </div>
              )}

              {/* Kullanıcı Harcama İstatistikleri Tab */}
              {activeTab === 'spending' && (
                <div>
                  <h3 style={{ color: '#4ade80', fontSize: '1rem', margin: '0 0 15px 0' }}>💰 Kullanıcı Harcama İstatistikleri</h3>
                <div style={{ 
                  maxHeight: '300px', 
                  overflowY: 'auto', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '10px',
                  paddingRight: '8px'
                }}>
                  {allUsersStats.length > 0 ? (
                    allUsersStats.map((stat) => (
                      <div
                        key={stat.user_id}
                        style={{
                          background: 'rgba(34, 197, 94, 0.1)',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          borderRadius: 8,
                          padding: 12,
                          fontSize: '0.9rem',
                        }}
                      >
                        <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>{stat.full_name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>
                          Tekne: {stat.boat_rental_count || 0} | Ekipman: {stat.equipment_rental_count || 0}
                        </div>
                        <div style={{ fontSize: '1rem', color: '#4ade80', fontWeight: 'bold' }}>
                          Toplam: {parseFloat(stat.total_spent || 0).toFixed(2)} ₺
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#888', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>İstatistik bulunamadı.</p>
                  )}
                </div>
              </div>
              )}

              {/* Forum İstatistikleri Tab */}
              {activeTab === 'forum' && (
                <div>
                  <h3 style={{ color: '#f59e0b', fontSize: '1rem', margin: '0 0 15px 0' }}>💬 Forum İstatistikleri</h3>
                <div style={{ 
                  maxHeight: '300px', 
                  overflowY: 'auto', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '10px',
                  paddingRight: '8px'
                }}>
                  {allUsersForumStats.length > 0 ? (
                    allUsersForumStats.map((stat) => (
                      <div
                        key={stat.user_id}
                        style={{
                          background: 'rgba(245, 158, 11, 0.1)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          borderRadius: 8,
                          padding: 12,
                          fontSize: '0.9rem',
                        }}
                      >
                        <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>{stat.full_name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#aaa' }}>
                          Post: {stat.post_count || 0} | Yorum: {stat.comment_count || 0} | Beğeni: {stat.liked_post_count || 0} | Fotoğraf: {stat.total_photos || 0}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#888', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>Forum istatistiği bulunamadı.</p>
                  )}
                </div>
              </div>
              )}

              {/* Bölge İstatistikleri Tab */}
              {activeTab === 'zones' && (
                <div>
                  <h3 style={{ color: '#a855f7', fontSize: '1rem', margin: '0 0 15px 0' }}>📍 Bölge İstatistikleri</h3>
                <div style={{ 
                  maxHeight: '300px', 
                  overflowY: 'auto', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '10px',
                  paddingRight: '8px'
                }}>
                  {allZonesStats.length > 0 ? (
                    allZonesStats.map((stat) => (
                      <div
                        key={stat.zone_id}
                        style={{
                          background: 'rgba(168, 85, 247, 0.1)',
                          border: '1px solid rgba(168, 85, 247, 0.3)',
                          borderRadius: 8,
                          padding: 12,
                          fontSize: '0.9rem',
                        }}
                      >
                        <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>{stat.zone_name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>
                          Aktivite: {stat.activity_count || 0} | Post: {stat.post_count || 0}
                        </div>
                        {stat.avg_activity_duration_hours && (
                          <div style={{ fontSize: '0.85rem', color: '#aaa' }}>
                            Ort. Süre: {parseFloat(stat.avg_activity_duration_hours).toFixed(1)} saat
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#888', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>Bölge istatistiği bulunamadı.</p>
                  )}
                </div>
              </div>
              )}

              {/* Popüler Bölgeler Analizi Tab */}
              {activeTab === 'popular' && (
                <div>
                  <div style={{ marginBottom: '10px' }}>
                    <h3 style={{ color: '#ec4899', fontSize: '1rem', margin: '0 0 8px 0' }}>🔥 Popüler Bölgeler Analizi</h3>
                    <p style={{ fontSize: '0.75rem', color: '#888', margin: 0, fontStyle: 'italic' }}>
                      Popülerlik Skoru: Aktivite (3 puan) + Post (2 puan) + Yorum (1.5 puan) + Beğeni (1 puan)
                    </p>
                  </div>
                <div style={{ 
                  maxHeight: '300px', 
                  overflowY: 'auto', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '10px',
                  paddingRight: '8px'
                }}>
                  {popularZonesAnalysis.length > 0 ? (
                    popularZonesAnalysis.map((zone) => (
                      <div
                        key={zone.zone_id}
                        style={{
                          background: 'rgba(236, 72, 153, 0.1)',
                          border: '1px solid rgba(236, 72, 153, 0.3)',
                          borderRadius: 8,
                          padding: 12,
                          fontSize: '0.9rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <div style={{ fontWeight: 'bold' }}>{zone.zone_name}</div>
                          <div style={{ fontSize: '0.85rem', color: '#ec4899', fontWeight: 'bold' }}>
                            Skor: {parseFloat(zone.popularity_score || 0).toFixed(1)}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>
                          Aktivite: {zone.total_activities || 0} | Post: {zone.total_posts || 0} | Yorum: {zone.total_comments || 0} | Beğeni: {zone.total_likes || 0}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#aaa' }}>
                          Aktif Kullanıcı: {zone.active_users_count || 0} | Ort. Aktivite/Kullanıcı: {parseFloat(zone.avg_activities_per_user || 0).toFixed(2)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '10px' }}>
                        {loading ? 'Yükleniyor...' : 'Popüler bölge analizi bulunamadı.'}
                      </p>
                      {!loading && (
                        <p style={{ color: '#666', fontSize: '0.75rem', fontStyle: 'italic' }}>
                          Veritabanında aktivite, post, yorum veya beğeni olan bölge bulunmuyor olabilir.
                          <br />
                          Tarayıcı konsolunu (F12) kontrol edin.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              )}
            </>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', flexShrink: 0 }}>
          <button onClick={onClose} style={buttonStyle}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminStatsPanel;

