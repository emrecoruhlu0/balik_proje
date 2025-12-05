// frontend/src/components/Sidebar.jsx
import React, { useState } from 'react';

const TABS = {
  INFO: 'info',
  BOAT: 'boat',
  EQUIP: 'equip',
  FORUM: 'forum',
  ACCOUNT: 'account',
};

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState(TABS.INFO);

  const renderInfoTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <h2
        style={{
          color: '#00ffff',
          marginTop: 0,
          textShadow: '0 0 10px #00ffff',
        }}
      >
        Van Gölü Balıkçılık İşletmesi
      </h2>

      <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: 1.6 }}>
        Türkiye&apos;nin en büyük sodalı gölü olan Van Gölü üzerinde güvenli ve
        kontrollü balıkçılık deneyimi sunuyoruz. Amacımız, hem sürdürülebilir
        avcılığı desteklemek hem de göl ekosistemini koruyarak keyifli bir
        deneyim yaşatmak.
      </p>

      <div
        style={{
          background: 'rgba(0, 255, 255, 0.08)',
          borderRadius: 6,
          padding: 10,
          border: '1px solid #00ffff33',
          fontSize: '0.85rem',
        }}
      >
        <strong>Kuruluş Yılı:</strong> 2025<br />
        <strong>Konum:</strong> Van Gölü / Gevaş Merkezi<br />
        <strong>Hizmetler:</strong> Tekne kiralama, ekipman kiralama, rehberli
        turlar, eğitim ve bilgilendirme.
      </div>

      <div
        style={{
          marginTop: 'auto',
          paddingTop: 16,
          borderTop: '1px solid #123',
          fontSize: '0.8rem',
          color: '#9aa4b1',
        }}
      >
        <p style={{ margin: 0 }}>
          Harita üzerinde görülen balık yoğunlukları ve bölgeler, gerçek zamanlı
          sensör verileri ve kullanıcı gözlemlerine göre güncellenir.
        </p>
      </div>
    </div>
  );

  // Diğer sekmeler (Tekne, Ekipman, Forum, Giriş) bir önce gönderdiğimle aynı kalabilir
  // sadece zoneDetails ile ilgili her şeyi kaldırdık.

  const renderBoatTab = () => (
    <div style={{ marginTop: '10px' }}>
      <h3 style={{ color: '#00ffff', marginTop: 0 }}>🛶 Tekne Kiralama</h3>
      <p style={{ fontSize: '0.9rem', color: '#ccc' }}>
        Tekne kiralayabilmek için giriş yapmanız gerekiyor.
      </p>
      <button
        style={{
          marginTop: '10px',
          width: '100%',
          padding: '10px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          background: '#00ffff',
          color: '#00111f',
          fontWeight: 'bold',
        }}
        onClick={() => setActiveTab(TABS.ACCOUNT)}
      >
        Giriş Yap / Kayıt Ol
      </button>
    </div>
  );

  const renderEquipTab = () => (
    <div style={{ marginTop: '10px' }}>
      <h3 style={{ color: '#00ffff', marginTop: 0 }}>🎣 Ekipman Kiralama</h3>
      <p style={{ fontSize: '0.9rem', color: '#ccc' }}>
        Olta, ağ, can yeleği ve diğer ekipmanları buradan kiralayabileceksiniz.
      </p>
      <p style={{ fontSize: '0.85rem', color: '#888' }}>
        (Bu alanı backend hazır olduğunda gerçek verilerle dolduracağız.)
      </p>
      <button
        style={{
          marginTop: '10px',
          width: '100%',
          padding: '10px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          background: '#00ffff',
          color: '#00111f',
          fontWeight: 'bold',
        }}
        onClick={() => setActiveTab(TABS.ACCOUNT)}
      >
        Giriş Yap / Kayıt Ol
      </button>
    </div>
  );

  const renderForumTab = () => (
    <div style={{ marginTop: '10px' }}>
      <h3 style={{ color: '#00ffff', marginTop: 0 }}>💬 Forum</h3>
      <p style={{ fontSize: '0.9rem', color: '#ccc' }}>
        Diğer balıkçılarla deneyimlerinizi paylaşabileceğiniz alan.
      </p>
      <p style={{ fontSize: '0.85rem', color: '#888' }}>
        (İlk aşamada sadece okunabilir liste, yorum ve paylaşım için giriş
        gerektireceğiz.)
      </p>
    </div>
  );

  const renderAccountTab = () => (
    <div style={{ marginTop: '10px' }}>
      <h3 style={{ color: '#00ffff', marginTop: 0 }}>👤 Hesap</h3>
      <p style={{ fontSize: '0.9rem', color: '#ccc' }}>
        Buraya Supabase tabanlı giriş / kayıt formu gelecek.
      </p>
      <p style={{ fontSize: '0.85rem', color: '#888' }}>
        (Şimdilik taslak, backend auth kısmını birlikte yazacağız.)
      </p>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case TABS.INFO:
        return renderInfoTab();
      case TABS.BOAT:
        return renderBoatTab();
      case TABS.EQUIP:
        return renderEquipTab();
      case TABS.FORUM:
        return renderForumTab();
      case TABS.ACCOUNT:
        return renderAccountTab();
      default:
        return renderInfoTab();
    }
  };

  const tabButtonStyle = (tab) => ({
    flex: 1,
    padding: '8px 6px',
    fontSize: '0.8rem',
    border: 'none',
    cursor: 'pointer',
    background: activeTab === tab ? '#00ffff' : 'transparent',
    color: activeTab === tab ? '#00111f' : '#9aa4b1',
    fontWeight: activeTab === tab ? 'bold' : 'normal',
    borderBottom:
      activeTab === tab ? '2px solid #00ffff' : '1px solid #123',
  });

  return (
    <div
      style={{
        width: '340px',
        background: '#020817',
        color: 'white',
        padding: '14px 16px',
        borderLeft: '2px solid #00ffff',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-5px 0 15px rgba(0,0,0,0.5)',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '12px',
          borderBottom: '1px solid #123',
          paddingBottom: '4px',
        }}
      >
        <button
          style={tabButtonStyle(TABS.INFO)}
          onClick={() => setActiveTab(TABS.INFO)}
        >
          Bilgi
        </button>
        <button
          style={tabButtonStyle(TABS.BOAT)}
          onClick={() => setActiveTab(TABS.BOAT)}
        >
          Tekne
        </button>
        <button
          style={tabButtonStyle(TABS.EQUIP)}
          onClick={() => setActiveTab(TABS.EQUIP)}
        >
          Ekipman
        </button>
        <button
          style={tabButtonStyle(TABS.FORUM)}
          onClick={() => setActiveTab(TABS.FORUM)}
        >
          Forum
        </button>
        <button
          style={tabButtonStyle(TABS.ACCOUNT)}
          onClick={() => setActiveTab(TABS.ACCOUNT)}
        >
          Giriş
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default Sidebar;
