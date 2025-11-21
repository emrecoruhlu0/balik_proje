// frontend/src/components/MapComponent.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Basit bir ikon (Eğer ikon dosyan public klasöründe yoksa hata vermemesi için basit daire)
// Eğer ikonun varsa iconUrl kısmını '/balik-ikonu.svg' yapabilirsin.
const fishIcon = new L.DivIcon({
  className: 'custom-fish-icon',
  html: '<div style="background-color:cyan; width:10px; height:10px; border-radius:50%; box-shadow:0 0 5px cyan;"></div>'
});

function MapComponent() {
  const [lakeData, setLakeData] = useState(null);

  // BACKEND'DEN VERİ ÇEKME İŞLEMİ
  useEffect(() => {
    fetch('http://localhost:3000/api/zones') // Backend adresimiz
      .then(res => res.json())
      .then(data => {
        console.log("Veriler Geldi:", data);
        setLakeData(data);
      })
      .catch(err => console.error("Hata:", err));
  }, []);

  // Stil Fonksiyonu
  const getStyle = (feature) => {
    // Van Gölü ise Mavi, Diğerleri Turuncu
    if (feature.properties.type === 'lake') {
      return { color: '#00ffff', fillColor: '#001133', fillOpacity: 0.3, weight: 2 };
    }
    return { color: '#ffaa00', fillColor: '#ffaa00', fillOpacity: 0.5, weight: 2 };
  };

  const onEachFeature = (feature, layer) => {
    layer.bindPopup(`<b>${feature.properties.name}</b><br>${feature.properties.description}`);
  };

  return (
    <MapContainer center={[38.60, 42.90]} zoom={9} style={{ height: '100%', width: '100%' }}>
      {/* Harita Altlığı */}
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      
      {/* Veritabanından gelen veriler */}
      {lakeData && (
        <GeoJSON data={lakeData} style={getStyle} onEachFeature={onEachFeature} />
      )}
    </MapContainer>
  );
}

export default MapComponent;