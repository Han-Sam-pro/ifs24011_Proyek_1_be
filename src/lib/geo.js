const EARTH_RADIUS_KM = 6371;

const toRadians = (deg) => (deg * Math.PI) / 180;

/**
 * Jarak garis lurus (great-circle) antara dua titik dalam kilometer, memakai rumus Haversine.
 * Estimasi jarak hanya memakai Haversine (tanpa Distance Matrix API).
 */
export function haversineKm(a, b) {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}
