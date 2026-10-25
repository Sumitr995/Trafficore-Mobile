// Trafficore theme — Uber-light. Values mirror global.css @theme tokens.
export const COLORS = {
  background: '#ffffff',
  primary: '#141414', // black CTA/buttons — white text on top
  border: '#e4e4e6',
  text: '#141414',
  muted: '#6b7280',
  accent: '#06c167', // status dots, timer, route line, small marks
  danger: '#ff6b6b', // severity/decline
};

// Free light map tiles via CARTO (key in .env removes the watermark).
// NOTE: keyed endpoint has no {s} subdomain and takes ?key= (docs: carto basemaps FAQ).
export const TILE_URL =
  'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';
