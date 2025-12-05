// frontend/src/App.jsx
import React from 'react';
import GameMap from './components/GameMap';
import Sidebar from './components/SideBar';
import './styles/index.css';

function App() {
  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <GameMap />
      </div>

      <Sidebar />
    </div>
  );
}

export default App;
