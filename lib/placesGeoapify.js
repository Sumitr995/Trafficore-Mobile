import { haversineM } from './routing';
import { KEYS } from './keys';

// Second hospital pipe: Geoapify Places (free key, no card, 3000 req/day).
// Same OSM base as Overpass, but cleaned + searchable by category + radius.
// Skips silently without a key — Overpass carries the search alone.
const PLACES = 'https://api.geoapify.com/v2/places';
const RADIUS_M = 8000;
const CACHE_S = 60;
const MOVE_M = 500;
const DEDUPE_M = 150; // same building from both sources → one row

let cache = null;

function normalize(f, pos) {
  const p = f.properties || {};
  const [lon, lat] = f.geometry?.coordinates || [];
  if (!p.name || lat == null) return null;
  const at = { latitude: lat, longitude: lon };
  const raw = p.datasource?.raw || {};
  return {
    id: `geo/${p.place_id}`,
    name: p.name,
    address: p.formatted || p.address_line2 || 'Address not listed',
    ...at,
    distM: Math.round(haversineM(pos, at)),
    caps: { healthcare: raw.healthcare },
    phone: p.contact?.phone,
    source: 'geoapify',
  };
}

export async function fetchGeoapifyHospitals(pos, { force = false } = {}) {
  if (!pos || !KEYS.geoapify) return { data: [], skipped: true };
  if (cache && !force) {
    const ageS = (Date.now() - cache.at) / 1000;
    const movedM = haversineM(pos, { latitude: cache.lat, longitude: cache.lon });
    if (ageS < CACHE_S && movedM < MOVE_M)
      return { data: cache.data, cached: true };
  }
  const url =
    `${PLACES}?categories=healthcare.hospital` +
    `&filter=circle:${pos.longitude},${pos.latitude},${RADIUS_M}` +
    `&limit=50&apiKey=${KEYS.geoapify}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`Geoapify busy (${res.status})`);
    const j = await res.json();
    const list = (j.features || [])
      .map((f) => normalize(f, pos))
      .filter(Boolean)
      .sort((a, b) => a.distM - b.distM);
    cache = { at: Date.now(), lat: pos.latitude, lon: pos.longitude, data: list };
    return { data: list, cached: false };
  } finally {
    clearTimeout(timer);
  }
}

// Merge two sources; near-duplicates (<150 m) collapse into the fuller record.
export function mergeHospitals(a, b) {
  const out = [...a];
  for (const h of b) {
    const dup = out.find((x) => haversineM(x, h) < DEDUPE_M);
    if (!dup) {
      out.push(h);
      continue;
    }
    if ((h.address || '').length > (dup.address || '').length) {
      dup.name = h.name;
      dup.address = h.address;
      dup.phone = h.phone || dup.phone;
    }
  }
  return out.sort((x, y) => x.distM - y.distM);
}
