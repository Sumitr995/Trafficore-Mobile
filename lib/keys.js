// Free-key services read from .env (EXPO_PUBLIC_* is inlined at build).
// CARTO basemap key removes the "API key required" tile watermark.
// GROQ key powers AI hospital ranking (empty = distance order fallback).
// GEOAPIFY key adds a second hospital source (empty = Overpass alone).
export const KEYS = {
  carto: process.env.EXPO_PUBLIC_CARTO_KEY || '',
  groq: process.env.EXPO_PUBLIC_GROQ_KEY || '',
  geoapify: process.env.EXPO_PUBLIC_GEOAPIFY_KEY || '',
  // Systems-independent demo mode by default. Set EXPO_PUBLIC_LINKED=1 to
  // let the app publish (MQTT) once other Trafficore systems come online.
  linked: process.env.EXPO_PUBLIC_LINKED === '1',
  // Only meaningful when linked: legacy Pi broker LAN from old-rig docs.
  mqttUrl: process.env.EXPO_PUBLIC_MQTT_WS || 'ws://192.168.26.192:9001',
};
