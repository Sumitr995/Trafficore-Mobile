import AsyncStorage from '@react-native-async-storage/async-storage';
import { haversineM } from './routing';

// Free hospital search: OpenStreetMap Overpass API. No key, no signup.
// The main endpoint overloads often (504s), so we try a community mirror next.
const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
const LAST_KEY = 'trafficore_last_hospitals';
const RADIUS_M = 8000; // 8 km around GPS (spec)
const CACHE_S = 60; // serve cache when …
const MOVE_M = 500; // … you moved less than 500 m (spec)

let cache = null; // { at, lat, lon, data }

// Overpass QL, piece by piece:
//  nwr            → search nodes + ways + relations (hospitals can be any)
//  ["amenity"="hospital"] → OSM tag filter: only hospitals
//  (around:8000,lat,lon) → within 8 km of you
//  out center tags → return tags + a center lat/lon (ways need this)
export function buildQuery(lat, lon) {
  return (
    `[out:json][timeout:25];` +
    `(nwr["amenity"="hospital"](around:${RADIUS_M},${lat},${lon}););` +
    `out center tags;`
  );
}

function addressOf(tags = {}) {
  const parts = [
    [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' '),
    tags['addr:suburb'] || tags['addr:neighbourhood'],
    tags['addr:city'] || tags['addr:town'] || tags['addr:village'],
  ].filter(Boolean);
  return parts.join(', ') || 'Address not listed in OSM';
}

function pointOf(el) {
  if (el.type === 'node' && el.lat != null)
    return { latitude: el.lat, longitude: el.lon };
  if (el.center) return { latitude: el.center.lat, longitude: el.center.lon };
  return null; // relation without center → skip
}

export async function fetchHospitals(pos, { force = false } = {}) {
  if (!pos) throw new Error('No GPS fix yet.');
  if (cache && !force) {
    const ageS = (Date.now() - cache.at) / 1000;
    const movedM = haversineM(pos, { latitude: cache.lat, longitude: cache.lon });
    if (ageS < CACHE_S && movedM < MOVE_M)
      return { data: cache.data, cached: true };
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  const body = 'data=' + encodeURIComponent(buildQuery(pos.latitude, pos.longitude));
  let lastErr = new Error('Hospital search failed.');
  try {
    for (const url of ENDPOINTS) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`Hospital server busy (${res.status}). Retry.`);
        const j = await res.json();
        const list = (j.elements || [])
          .map((el) => {
            const p = pointOf(el);
            if (!p || !el.tags?.name) return null; // unnamed → skip
            const t = el.tags;
            return {
              id: `${el.type}/${el.id}`,
              name: t.name,
              address: addressOf(t),
              ...p,
              distM: Math.round(haversineM(pos, p)),
              // capability tags feed the AI ranker (absent = unknown, not "no")
              caps: {
                emergency: t.emergency,
                beds: t.beds,
                hours: t.opening_hours,
                healthcare: t.healthcare || t['healthcare:speciality'],
                operator: t.operator,
              },
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.distM - b.distM);
        cache = { at: Date.now(), lat: pos.latitude, lon: pos.longitude, data: list };
        saveLast(list).catch(() => {});
        return { data: list, cached: false };
      } catch (e) {
        if (e.name === 'AbortError') throw new Error('Hospital search timed out (offline?). Retry.');
        lastErr = e; // try next mirror
      }
    }
    throw lastErr;
  } finally {
    clearTimeout(timer);
  }
}

export function formatDist(m) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
}

// Last-good list on disk: shown with an "offline" tag when both APIs fail.
export async function saveLast(list) {
  await AsyncStorage.setItem(LAST_KEY, JSON.stringify({ at: Date.now(), data: list }));
}

export async function loadLast() {
  try {
    const raw = await AsyncStorage.getItem(LAST_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw);
    return Array.isArray(j.data) && j.data.length ? j : null;
  } catch {
    return null;
  }
}
