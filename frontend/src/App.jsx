import React, { useEffect, useState, useRef } from 'react';
import GameMap from './components/GameMap';
import Sidebar from './components/Sidebar';
import { fetchMe } from './api/api';
import './styles/index.css';
import toast from 'react-hot-toast';

function App() {
  const [selectedZone, setSelectedZone] = useState(null);

  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(null);
  const sidebarTabChangeRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setCurrentUser(null);
        return;
      }
      try {
        const me = await fetchMe(token);
        setCurrentUser(me);
      } catch (e) {
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
        toast.error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      }
    };
    load();
  }, [token]);

  const handleLoginSuccess = (newToken, user) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <GameMap 
          onZoneSelect={(zone) => setSelectedZone(zone)}
          onOpenForumTab={(zoneProps) => {
            // Select the zone first, then open forum tab
            if (zoneProps && sidebarTabChangeRef.current) {
              const zone = {
                zone_id: zoneProps.zone_id || zoneProps.id,
                id: zoneProps.zone_id || zoneProps.id,
                name: zoneProps.name
              };
              setSelectedZone(zone);
              // Use setTimeout to ensure zone is selected before opening forum tab
              setTimeout(() => {
                if (sidebarTabChangeRef.current) {
                  sidebarTabChangeRef.current('forum');
                }
              }, 50);
            }
          }}
          onOpenInfoTab={(zoneProps) => {
            // Select the zone first, then open info tab
            if (zoneProps && sidebarTabChangeRef.current) {
              const zone = {
                zone_id: zoneProps.zone_id || zoneProps.id,
                id: zoneProps.zone_id || zoneProps.id,
                name: zoneProps.name
              };
              setSelectedZone(zone);
              // Use setTimeout to ensure zone is selected before opening info tab
              setTimeout(() => {
                if (sidebarTabChangeRef.current) {
                  sidebarTabChangeRef.current('info');
                }
              }, 50);
            }
          }}
        />
        {selectedZone && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '60px',
            zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: '#00ffff',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #00ffff',
            backdropFilter: 'blur(4px)'
          }}>
            📍 Seçili Bölge: <strong>{selectedZone.name}</strong>
          </div>
        )}
      </div>

      <Sidebar
        selectedZone={selectedZone}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onTabChangeRef={sidebarTabChangeRef}
      />
    </div>
  );
}

export default App;
