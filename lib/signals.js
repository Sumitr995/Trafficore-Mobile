import { haversineM } from './routing';

// REAL traffic-signal positions: OpenStreetMap tag highway=traffic_signals.
// Free Overpass API, no key. Signals are mapped as nodes, so plain `node`
// search is enough (ways/relations with this tag are virtually nonexistent).
const OVERPASS = 'https://overpass-api.de/api/interpreter';
const RADIUS_M = 2000; // signals only matter when close
const CACHE_S = 60;
const MOVE_M = 500;

let cache = null;

export async function fetchSignals(pos, { force = false } = {}) {
  if (!pos) throw new Error('No GPS fix yet.');
  if (cache && !force) {
    const ageS = (Date.now() - cache.at) / 1000;
    const movedM = haversineM(pos, { latitude: cache.lat, longitude: cache.lon });
    if (ageS < CACHE_S && movedM < MOVE_M)
      return { data: cache.data, cached: true };
  }
  const q =
    `[out:json][timeout:25];` +
    `(node["highway"="traffic_signals"]` +
    `(around:${RADIUS_M},${pos.latitude},${pos.longitude}););` +
    `out tags;`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    const res = await fetch(OVERPASS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(q),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`Signal server busy (${res.status}). Retry.`);
    const j = await res.json();
    const list = (j.elements || [])
      .filter((el) => el.lat != null)
      .map((el) => {
        const p = { latitude: el.lat, longitude: el.lon };
        return {
          id: `node/${el.id}`,
          ...p,
          distM: Math.round(haversineM(pos, p)),
        };
      })
      .sort((a, b) => a.distM - b.distM)
      .slice(0, 8);
    cache = { at: Date.now(), lat: pos.latitude, lon: pos.longitude, data: list };
    return { data: list, cached: false };
  } catch (e) {
    if (e.name === 'AbortError')
      throw new Error('Signal search timed out (offline?). Retry.');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
