// Free routing: OSRM public demo server (driving, GeoJSON). No key.
// Docs: router.project-osrm.org — GET /route/v1/driving/{lon},{lat};{lon},{lat}
const OSRM = 'https://router.project-osrm.org/route/v1/driving';

export function haversineM(a, b) {
  const R = 6371000;
  const dLa = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLo = ((b.longitude - a.longitude) * Math.PI) / 180;
  const la1 = (a.latitude * Math.PI) / 180;
  const la2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLa / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// OSRM returns {routes:[{geometry:{coordinates:[[lon,lat]…]}, distance, duration}]}
export async function fetchRoute(from, to) {
  const url =
    `${OSRM}/${from.longitude},${from.latitude};` +
    `${to.longitude},${to.latitude}` +
    `?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Route server busy (${res.status}). Retry.`);
  const j = await res.json();
  if (j.code !== 'Ok' || !j.routes?.length)
    throw new Error('No road route found. Try again.');
  const r = j.routes[0];
  return {
    // Leaflet wants [lat, lon]
    points: r.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
    distanceM: r.distance,
    durationS: r.duration,
  };
}

// Nearest distance from pos to the route polyline (for deviate detection)
export function distToRouteM(pos, points) {
  let best = Infinity;
  // stride 2 keeps it cheap on long routes
  for (let i = 0; i < points.length; i += 2) {
    const d = haversineM(pos, { latitude: points[i][0], longitude: points[i][1] });
    if (d < best) best = d;
  }
  return best;
}

export function formatKm(m) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

export function formatEta(s) {
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

// Demo patient: fixed offset from first GPS fix (~1.5 km). Real dispatch
// coords will plug in here later — routing code stays identical.
export function demoDestination(from) {
  return { latitude: from.latitude + 0.0135, longitude: from.longitude + 0.008 };
}

export const ARRIVE_M = 300; // 300 m radius = "arrived" (spec)
