import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { isPointInsidePolygon } from '../../utils/geometry';
import { fetchZones, fetchHotspots, fetchActiveBoats, fetchAllZonesStats, fetchUpcomingActivitiesByZone, fetchZoneStats } from '../../api/api';
import toast from 'react-hot-toast';
import { getZoneStyle } from './MapStyles';
import { fishIcon, boatIcon, HotspotMarker, BoatMarker, ActivityBadgeMarker } from './MapMarkers';

// MapBackgroundClick component
function MapBackgroundClick({ onDeselect }) {
  useMapEvents({
    click: (e) => {
      onDeselect();
    },
  });
  return null;
}

// Scroll zoom sensitivity reducer component
function ScrollZoomControl() {
  const map = useMap();
  
  useEffect(() => {
    if (!map || !map.scrollWheelZoom) return;
    
    // Store original _onWheelScroll function
    const originalOnWheelScroll = map.scrollWheelZoom._onWheelScroll;
    
    // Override with less sensitive version
    map.scrollWheelZoom._onWheelScroll = function(e) {
      // Increase the threshold - require more scrolling to zoom
      // Default wheelPxPerZoomLevel is 60, we'll use 120 (half the sensitivity)
      const wheelPxPerZoomLevel = 120;
      
      const delta = L.DomEvent.getWheelDelta(e);
      const zoom = map.getZoom();
      
      // Only zoom if accumulated delta exceeds threshold
      if (!this._delta) this._delta = 0;
      this._delta += delta;
      
      if (Math.abs(this._delta) >= wheelPxPerZoomLevel) {
        const zoomDelta = this._delta > 0 ? 1 : -1;
        map.setZoom(zoom + zoomDelta);
        this._delta = 0;
      }
      
      L.DomEvent.stop(e);
    };
    
    return () => {
      // Restore original on unmount
      if (originalOnWheelScroll) {
        map.scrollWheelZoom._onWheelScroll = originalOnWheelScroll;
      }
    };
  }, [map]);
  
  return null;
}

const GameMap = ({ onZoneSelect, onOpenForumTab }) => {
  const [lakeData, setLakeData] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [fishPos, setFishPos] = useState([38.60, 42.90]);
  const lakePolygonRef = useRef(null);
  const [boats, setBoats] = useState([]);
  const [zoneActivityMarkers, setZoneActivityMarkers] = useState([]);
  const lastErrorToastAtRef = useRef(0);

  // Load zones
  useEffect(() => {
    const loadZones = async () => {
      try {
        const data = await fetchZones();
        setLakeData(data);
        const lakeFeature = data.features.find(f => f.properties.type === 'lake' || (f.properties.name && f.properties.name.includes('Van')));
        if (lakeFeature) {
          if (lakeFeature.geometry.type === 'Polygon') {
            lakePolygonRef.current = lakeFeature.geometry.coordinates[0];
          } else if (lakeFeature.geometry.type === 'MultiPolygon') {
            lakePolygonRef.current = lakeFeature.geometry.coordinates[0][0];
          }
        }
      } catch (err) {
        console.error('Zones hatası:', err);
        toast.error('Harita bölgeleri yüklenemedi.');
      }
    };
    loadZones();
  }, []);

  // Load zone activity markers
  // Load zone activity markers - runs only once at start then every 30 seconds
  useEffect(() => {
    if (!lakeData) return;

    const loadActivityMarkers = async () => {
      try {
        const markers = [];
        
        // Get upcoming activities for all zones
        for (const feature of lakeData.features) {
          const zoneId = feature.properties.zone_id || feature.properties.id;
          if (!zoneId) continue;

          try {
            const upcomingActivities = await fetchUpcomingActivitiesByZone(zoneId);
            
            // Filter for active and future activities only (not past)
            const now = new Date();
            const activeAndFutureCount = Array.isArray(upcomingActivities)
              ? upcomingActivities.filter(a => {
                  const startDate = new Date(a.start_date);
                  const endDate = new Date(a.end_date);
                  return endDate > now; // Show if activity hasn't ended yet
                }).length
              : 0;

            if (activeAndFutureCount > 0) {
              let center = null;
              if (feature.geometry.type === 'Polygon') {
                const coords = feature.geometry.coordinates[0];
                let sumLng = 0, sumLat = 0;
                coords.forEach(coord => {
                  sumLng += coord[0];
                  sumLat += coord[1];
                });
                center = [sumLat / coords.length, sumLng / coords.length];
              } else if (feature.geometry.type === 'MultiPolygon') {
                const coords = feature.geometry.coordinates[0][0];
                let sumLng = 0, sumLat = 0;
                coords.forEach(coord => {
                  sumLng += coord[0];
                  sumLat += coord[1];
                });
                center = [sumLat / coords.length, sumLng / coords.length];
              }

              if (center) {
                markers.push({
                  zoneId: parseInt(zoneId),
                  position: center,
                  activityCount: activeAndFutureCount
                });
              }
            }
          } catch (err) {
            console.error(`Zone ${zoneId} etkinlikleri yüklenemedi:`, err);
          }
        }

        setZoneActivityMarkers(markers);
      } catch (err) {
        console.error('Bölge etkinlik marker\'ları yüklenemedi:', err);
      }
    };

    loadActivityMarkers();
    // Refresh every 30 seconds
    const interval = setInterval(loadActivityMarkers, 30000);
    return () => clearInterval(interval);
  }, [lakeData]);

  // Load hotspots and boats
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const hData = await fetchHotspots();
        const bData = await fetchActiveBoats();
        if (isMounted) {
          setHotspots(hData.features || []);
          setBoats(bData || []);
        }
      } catch (err) {
        console.error('Veri hatası:', err);
        const now = Date.now();
        if (now - lastErrorToastAtRef.current > 30000) {
          toast.error('Harita verileri güncellenemedi (hotspot/tekne).');
          lastErrorToastAtRef.current = now;
        }
      }
    };
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  // Demo fish movement
  useEffect(() => {
    if (!lakeData || !lakePolygonRef.current) return;
    const interval = setInterval(() => {
      let movementLat = (Math.random() - 0.5) * 0.01;
      let movementLng = (Math.random() - 0.5) * 0.01;
      let newLat = fishPos[0] + movementLat;
      let newLng = fishPos[1] + movementLng;
      let candidate = [newLat, newLng];
      if (isPointInsidePolygon(candidate, lakePolygonRef.current)) {
        setFishPos(candidate);
      } else {
        setFishPos([fishPos[0] - movementLat, fishPos[1] - movementLng]);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [lakeData, fishPos]);

  const onEachFeature = (feature, layer) => {
    const name = feature.properties.name || 'Bölge';
    const zoneId = feature.properties.zone_id || feature.properties.id;

    const loadingContent = `
      <strong>${name}</strong><br/>
      <span style="font-size:11px; color:#aaa;">Bölge ID: ${zoneId}</span><br/>
      <span style="font-size:11px; color:#888;">Bilgiler yükleniyor...</span>
    `;

    layer.bindPopup(loadingContent);

    layer.on('popupopen', async () => {
      if (!zoneId) return;

      try {
        const stats = await fetchZoneStats(zoneId);

        const forumId = `forum-link-${zoneId}`;
        const statsContent = `
          <div style="min-width: 220px;">
            <strong style="font-size: 13px; color: #f59e0b;">${name}</strong><br/>
            <span style="font-size:10px; color:#999;">Bölge ID: ${zoneId}</span>
            <hr style="margin: 8px 0; border-color: #333;">
            <div style="font-size:11px; line-height: 1.8;">
              <div><strong>📊 Aktivite:</strong> ${stats.activity_count || 0}</div>
              <div 
                  id="${forumId}"
                style="cursor: pointer; color: #3b82f6; padding: 2px 4px; border-radius: 3px; transition: background 0.2s; user-select: none;"
                >
                <strong>💬 Forum:</strong> ${stats.post_count || 0}
              </div>
              ${stats.avg_activity_duration_hours ?
            `<div><strong>⏱️ Ort. Süre:</strong> ${parseFloat(stats.avg_activity_duration_hours).toFixed(1)}h</div>` : ''}
            </div>
          </div>
        `;
        
        layer.setPopupContent(statsContent);
        
        // Add click event listener after popup content is set
        setTimeout(() => {
          const forumLink = document.getElementById(forumId);
          if (forumLink && onOpenForumTab) {
            const handleClick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              // Pass zone properties to open forum tab
              onOpenForumTab(feature.properties);
            };
            
            const handleMouseEnter = () => {
              forumLink.style.background = 'rgba(59, 130, 246, 0.2)';
            };
            
            const handleMouseLeave = () => {
              forumLink.style.background = 'transparent';
            };
            
            // Remove existing listeners if any, then add new ones
            forumLink.removeEventListener('click', handleClick);
            forumLink.removeEventListener('mouseenter', handleMouseEnter);
            forumLink.removeEventListener('mouseleave', handleMouseLeave);
            
            forumLink.addEventListener('click', handleClick);
            forumLink.addEventListener('mouseenter', handleMouseEnter);
            forumLink.addEventListener('mouseleave', handleMouseLeave);
          }
        }, 150);
      } catch (err) {
        console.error('Bölge bilgileri yüklenemedi:', err);
        const errorContent = `
          <strong>${name}</strong><br/>
          <span style="font-size:11px; color:#aaa;">Bölge ID: ${zoneId}</span><br/>
          <span style="font-size:11px; color:#dc2626;">Bilgiler yüklenemedi</span>
        `;
        layer.setPopupContent(errorContent);
      }
    });

    layer.on('click', () => {
      onZoneSelect(feature.properties);
    });
  };

  return (
    <MapContainer
      center={[38.60, 42.90]}
      zoom={9}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

      <MapBackgroundClick onDeselect={() => onZoneSelect(null)} />
      <ScrollZoomControl />

      {lakeData && (
        <GeoJSON
          data={lakeData}
          style={getZoneStyle}
          onEachFeature={onEachFeature}
        />
      )}

      {/* Hotspots */}
      {hotspots.map((feature) => (
        <HotspotMarker key={`hotspot-${feature.properties.id}`} feature={feature} />
      ))}

      {/* Boats */}
      {boats.map((boat) => (
        <BoatMarker key={`boat-${boat.boat_id}`} boat={boat} />
      ))}

      {/* Demo Fish */}
      <Marker position={fishPos} icon={fishIcon}>
        <Popup>Demo Balık</Popup>
      </Marker>

      {/* Zone Activity Badges */}
      {zoneActivityMarkers.map((marker) => (
        <ActivityBadgeMarker
          key={`activity-${marker.zoneId}`}
          zoneId={marker.zoneId}
          position={marker.position}
          activityCount={marker.activityCount}
        />
      ))}
    </MapContainer>
  );
};

export default GameMap;





