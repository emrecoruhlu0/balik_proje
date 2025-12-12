// components/Forum.jsx
import React, { useState, useEffect } from 'react';
import { fetchAllPosts, fetchZonePosts, createPost } from '../api/api';

const Forum = ({ selectedZone, currentUser }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Verileri Çekme
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        let data;
        
        // --- DÜZELTME BURADA ---
        // Harita verisi bazen 'zone_id', bazen 'id' olarak gelebilir.
        // İkisini de kontrol edip hangisi varsa onu alıyoruz.
        const activeZoneId = selectedZone ? (selectedZone.zone_id || selectedZone.id) : null;

        if (activeZoneId) {
          console.log(`Bölge ID (${activeZoneId}) için postlar çekiliyor...`);
          data = await fetchZonePosts(activeZoneId);
        } else {
          // Zone seçili değilse veya ID bulunamadıysa genel akış
          console.log("Filtre yok veya ID bulunamadı, tüm postlar getiriliyor...");
          data = await fetchAllPosts();
        }
        
        // Gelen verinin dizi olduğundan emin oluyoruz
        setPosts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Forum hatası:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [selectedZone]);

  // Post Gönderme
  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = currentUser ? currentUser.user_id : 1; 
    
    // ID kontrolünü burada da yapıyoruz
    const activeZoneId = selectedZone ? (selectedZone.zone_id || selectedZone.id) : null;

    try {
      const postData = {
        user_id: userId,
        title: newTitle,
        content: newContent,
        zone_id: activeZoneId, // Düzeltilmiş ID
        visibility: 'public'
      };

      await createPost(postData);
      setNewTitle('');
      setNewContent('');
      setIsModalOpen(false);
      alert("Post gönderildi!");
      
      // Listeyi yenile
      if (activeZoneId) {
          const updated = await fetchZonePosts(activeZoneId);
          setPosts(Array.isArray(updated) ? updated : []);
      } else {
          const updated = await fetchAllPosts();
          setPosts(Array.isArray(updated) ? updated : []);
      }
    } catch (err) {
      alert("Hata: " + err.message);
    }
  };

  // Modal'ı kapat
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewTitle('');
    setNewContent('');
  };

  return (
    <div style={{ padding: '14px', color: 'white', height: '100%', overflowY: 'auto', position: 'relative' }}>
      {/* Başlık ve Gönderi Paylaş Butonu */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '16px',
        position: 'sticky',
        top: 0,
        background: '#020817',
        paddingBottom: '12px',
        zIndex: 10
      }}>
        <h3 style={{ 
          color: '#00ffff', 
          marginTop: 0, 
          fontSize: '1rem',
          fontWeight: 'bold',
          textShadow: '0 0 10px #00ffff'
        }}>
          {selectedZone ? `📍 ${selectedZone.name} Forumu` : "🌐 Genel Balıkçı Forumu"}
        </h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            background: '#00ffff',
            color: '#00111f',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#00e6e6';
            e.target.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#00ffff';
            e.target.style.boxShadow = 'none';
          }}
        >
          <span>+</span>
          <span>Gönderi Paylaş</span>
        </button>
      </div>

      {/* Post Kartları */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>Yükleniyor...</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '12px',
          paddingBottom: '40px'
        }}>
          {posts.length === 0 && (
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ color: '#ccc', fontSize: '0.85rem', textAlign: 'center', padding: '32px 0' }}>
                Burada henüz ses yok.
              </p>
            </div>
          )}
          
          {posts.map((post) => (
            <div 
              key={post.post_id}
              style={{
                background: 'rgba(0, 255, 255, 0.05)',
                border: '1px solid #00ffff33',
                borderRadius: 6,
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                fontSize: '0.85rem',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = '#00ffff66';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = '#00ffff33';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <h4 style={{ 
                  fontWeight: 'bold', 
                  color: 'white', 
                  flex: 1, 
                  paddingRight: '8px',
                  fontSize: '0.9rem',
                  margin: 0
                }}>
                  {post.title}
                </h4>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: '#888',
                  whiteSpace: 'nowrap'
                }}>
                  {new Date(post.created_at).toLocaleDateString('tr-TR', { 
                    day: 'numeric', 
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <p style={{ 
                color: '#ccc', 
                fontSize: '0.85rem', 
                marginTop: '8px', 
                marginBottom: '12px',
                flex: 1,
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {post.content}
              </p>
              <div style={{ 
                marginTop: 'auto', 
                paddingTop: '10px', 
                borderTop: '1px solid #00ffff22',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.75rem', color: '#00ffff', fontWeight: '500' }}>
                  👤 {post.author || "Anonim"}
                </span>
                {!selectedZone && post.zone_name && (
                  <span style={{
                    background: 'rgba(0, 255, 255, 0.1)',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: '0.75rem',
                    color: '#ccc'
                  }}>
                    📍 {post.zone_name}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Overlay - Tam Ekranın Ortasında */}
      {isModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={handleCloseModal}
        >
          <div 
            style={{
              background: '#020817',
              borderRadius: 6,
              border: '1px solid #00ffff33',
              boxShadow: '0 0 30px rgba(0, 255, 255, 0.3)',
              width: '100%',
              maxWidth: '500px',
              padding: '20px',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ 
                color: '#00ffff', 
                marginTop: 0, 
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textShadow: '0 0 10px #00ffff'
              }}>
                Yeni Gönderi Oluştur
              </h3>
              <button
                onClick={handleCloseModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9aa4b1',
                  fontSize: '28px',
                  lineHeight: 1,
                  cursor: 'pointer',
                  padding: 0,
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#fff'}
                onMouseLeave={(e) => e.target.style.color = '#9aa4b1'}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.85rem', 
                  color: '#ccc', 
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  Başlık
                </label>
                <input 
                  type="text" 
                  placeholder="Gönderi başlığı..." 
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(0, 255, 255, 0.05)',
                    border: '1px solid #00ffff33',
                    borderRadius: 6,
                    color: 'white',
                    fontSize: '0.85rem',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#00ffff66';
                    e.target.style.background = 'rgba(0, 255, 255, 0.08)';
                    e.target.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#00ffff33';
                    e.target.style.background = 'rgba(0, 255, 255, 0.05)';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                  autoFocus
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.85rem', 
                  color: '#ccc', 
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  İçerik
                </label>
                <textarea 
                  placeholder="Deneyimlerini paylaş..." 
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(0, 255, 255, 0.05)',
                    border: '1px solid #00ffff33',
                    borderRadius: 6,
                    color: 'white',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'none',
                    minHeight: '120px',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease'
                  }}
                  rows="6"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#00ffff66';
                    e.target.style.background = 'rgba(0, 255, 255, 0.08)';
                    e.target.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#00ffff33';
                    e.target.style.background = 'rgba(0, 255, 255, 0.05)';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 6,
                    border: '1px solid #00ffff33',
                    background: 'rgba(0, 255, 255, 0.05)',
                    color: '#ccc',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(0, 255, 255, 0.1)';
                    e.target.style.borderColor = '#00ffff66';
                    e.target.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(0, 255, 255, 0.05)';
                    e.target.style.borderColor = '#00ffff33';
                    e.target.style.color = '#ccc';
                  }}
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 6,
                    border: 'none',
                    background: '#00ffff',
                    color: '#00111f',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#00e6e6';
                    e.target.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#00ffff';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Paylaş
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forum;