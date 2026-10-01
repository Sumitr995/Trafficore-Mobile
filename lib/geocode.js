// Free name search: OSM Nominatim. No key — fair use is ~1 request/second,
// so callers must debounce typing (see NameSearch). Usage policy requires
// a valid referrer/client; plain RN fetch is accepted for low-volume use.
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

// Returns [{id, name, address, latitude, longitude}] — same shape as a
// hospital row, so picking one feeds straight into setHospital + routing.
export async function searchPlaces(text, { limit = 5 } = {}) {
  const q = text.trim();
  if (q.length < 3) return [];
  const url =
    `${NOMINATIM}?format=jsonv2&limit=${limit}&addressdetails=1` +
    `&accept-language=en&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Search busy (${res.status}). Retry.`);
  const j = await res.json();
  return (Array.isArray(j) ? j : []).map((r) => ({
    id: `nom/${r.place_id}`,
    name: (r.display_name || 'Unknown').split(',').slice(0, 2).join(','),
    address: r.display_name || '',
    latitude: parseFloat(r.lat),
    longitude: parseFloat(r.lon),
    kind: [r.class, r.type].filter(Boolean).join('/'),
  }));
}
