// Free-key services read from .env (EXPO_PUBLIC_* is inlined at build).
// CARTO basemap key removes the "API key required" tile watermark.
// GROQ key powers AI hospital ranking (empty = distance order fallback).
// GEOAPIFY key adds a second hospital source (empty = Overpass alone).
export const KEYS = {
  carto: process.env.EXPO_PUBLIC_CARTO_KEY || '',
  groq: process.env.EXPO_PUBLIC_GROQ_KEY || '',
  geoapify: process.env.EXPO_PUBLIC_GEOAPIFY_KEY || '',
};
