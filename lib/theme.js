// Trafficore theme — dark mode only. Keep these exact values everywhere.
export const COLORS = {
  background: '#101010',
  primary: '#00d992',
  border: '#3d3a39',
  text: '#f2f2f2',
  muted: '#8b949e',
};

// Free dark map tiles via CARTO (key in .env removes the watermark).
// NOTE: keyed endpoint has no {s} subdomain and takes ?key= (docs: carto basemaps FAQ).
export const DARK_TILE_URL =
  'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png';
