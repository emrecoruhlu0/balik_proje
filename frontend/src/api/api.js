// frontend/src/api/api.js

const BASE_URL = 'http://localhost:3000/api';

export const fetchZones = async () => {
  const response = await fetch(`${BASE_URL}/zones`);
  if (!response.ok) throw new Error('Bölgeler çekilemedi');
  return response.json();
};

export const fetchHotspots = async () => {
  const response = await fetch(`${BASE_URL}/hotspots`);
  if (!response.ok) throw new Error('Hotspots çekilemedi');
  return response.json();
};

export const fetchActiveBoats = async () => {
  const response = await fetch(`${BASE_URL}/boats/active`);
  if (!response.ok) throw new Error('Aktif tekneler çekilemedi');
  return response.json();
};

// 🔹 Müsait tekneler (iskelede duranlar)
export const fetchAvailableBoats = async () => {
  const response = await fetch(`${BASE_URL}/boats/available`);
  if (!response.ok) throw new Error('Müsait tekneler çekilemedi');
  return response.json();
};

// 🔹 Tekne kiralama başlat
export const createBoatRental = async (boatId, durationMinutes = 60) => {
  const response = await fetch(`${BASE_URL}/rentals/boat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ boatId, durationMinutes }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || 'Tekne kiralanamadı');
  }

  return response.json();
};

// 🔹 Kiralamayı bitir
export const completeBoatRental = async (rentalId) => {
  const response = await fetch(`${BASE_URL}/rentals/${rentalId}/complete`, {
    method: 'POST',
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || 'Kiralama tamamlanamadı');
  }

  return response.json();
};
