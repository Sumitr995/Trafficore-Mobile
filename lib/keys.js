// Free-key services read from .env (EXPO_PUBLIC_* is inlined at build).
// CARTO basemap key removes the "API key required" tile watermark.
// GEMINI key powers AI hospital ranking (empty = distance order fallback).
export const KEYS = {
  carto: process.env.EXPO_PUBLIC_CARTO_KEY || '',
  gemini: process.env.EXPO_PUBLIC_GEMINI_KEY || '',
};
