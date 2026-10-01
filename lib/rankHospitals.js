import { KEYS } from './keys';

// AI hospital ranking (free Groq tier) with a strict distance fallback.
// The LLM is ADVISORY: it only reorders real OSM rows — coordinates and
// distances always come from GPS math, and unknown IDs are dropped.
// Groq speaks the OpenAI chat-completions shape; model is overridable via
// EXPO_PUBLIC_GROQ_MODEL so a retired default never needs a code change.
const URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.EXPO_PUBLIC_GROQ_MODEL || 'llama-3.3-70b-versatile';

function contextOf(h) {
  const c = h.caps || {};
  const bits = [
    `${h.distM}m`,
    c.emergency ? `emergency=${c.emergency}` : null,
    c.beds ? `beds=${c.beds}` : null,
    c.hours ? `hours=${c.hours}` : null,
    c.healthcare ? `care=${c.healthcare}` : null,
  ].filter(Boolean);
  return `- ${h.id} | ${h.name} | ${bits.join(' ')}`;
}

function distanceFallback(candidates) {
  return {
    source: 'distance',
    ranked: candidates.slice(0, 3).map((h) => ({
      ...h,
      score: null,
      reasons: ['Nearest by GPS'],
    })),
  };
}

function cleanJson(text) {
  // strip markdown fences some models add around the JSON
  return text.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
}

// Returns { ranked: [hospital… +score +reasons] (max 3), source: 'ai'|'distance' }
export async function rankHospitals(candidates, { severity = 'UNKNOWN' } = {}) {
  const pool = candidates.slice(0, 10);
  if (!pool.length) return { ranked: [], source: 'distance' };
  if (!KEYS.groq) return distanceFallback(pool);

  const prompt =
    `Rank these emergency hospitals for an ambulance driver. ` +
    `Patient severity: ${severity}. ` +
    `Higher score = send the ambulance there. Prefer nearest, ` +
    `emergency=yes, 24/7 opening hours, more beds, matching speciality.\n` +
    pool.map(contextOf).join('\n') +
    `\nReturn ONLY JSON: {"ranking":[{"id":"<exact id>","score":0-100,` +
    `"reasons":["max 3 short reasons"]}]} — top 3 only.`;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    let res;
    try {
      res = await fetch(URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${KEYS.groq}`,
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'You rank hospitals. Reply with JSON only.' },
            { role: 'user', content: prompt },
          ],
        }),
        signal: ctrl.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) throw new Error(`AI busy (${res.status})`);
    const j = await res.json();
    const text = j.choices?.[0]?.message?.content || '';
    const parsed = JSON.parse(cleanJson(text)).ranking || [];
    const byId = new Map(pool.map((h) => [h.id, h]));
    const ranked = [];
    for (const r of parsed) {
      const h = byId.get(r.id); // drop hallucinated IDs
      if (h && !ranked.find((x) => x.id === h.id))
        ranked.push({ ...h, score: r.score ?? null, reasons: (r.reasons || []).slice(0, 3) });
      if (ranked.length === 3) break;
    }
    // pad with nearest so we always show 3
    for (const h of pool) {
      if (ranked.length === 3) break;
      if (!ranked.find((x) => x.id === h.id))
        ranked.push({ ...h, score: null, reasons: ['Nearest by GPS'] });
    }
    return { ranked, source: 'ai' };
  } catch {
    return distanceFallback(pool); // offline, slow, bad key, bad JSON → still useful
  }
}
