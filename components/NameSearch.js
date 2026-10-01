import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { searchPlaces } from '../lib/geocode';
import { haversineM } from '../lib/routing';

// Type a hospital name → tap → it becomes the trip destination. No coords typed.
export default function NameSearch({ origin, onPick }) {
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const timer = useRef(null);

  // Debounced: ~1 request per 0.8 s (Nominatim fair use)
  useEffect(() => {
    clearTimeout(timer.current);
    if (q.trim().length < 3) {
      setResults([]);
      setBusy(false);
      return;
    }
    setBusy(true);
    timer.current = setTimeout(async () => {
      try {
        setResults(await searchPlaces(q));
        setError('');
      } catch (e) {
        setError(e.message || 'Search failed.');
        setResults([]);
      } finally {
        setBusy(false);
      }
    }, 800);
    return () => clearTimeout(timer.current);
  }, [q]);

  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-2 h-12 rounded-xl bg-[#1f1f1f] border border-border px-3">
        <Text className="text-muted">🔍</Text>
        <TextInput
          className="flex-1 text-ink text-sm h-12"
          value={q}
          onChangeText={setQ}
          placeholder="Type hospital name — e.g. AIIMS"
          placeholderTextColor="#8b949e"
          autoCorrect={false}
        />
        {busy && <ActivityIndicator size="small" color="#00d992" />}
      </View>
      {error ? <Text className="text-[#ff6b6b] text-xs font-bold">{error}</Text> : null}
      {results.map((r) => (
        <TouchableOpacity
          key={r.id}
          className="bg-[#1f1f1f] border border-border rounded-xl px-3 py-2.5"
          onPress={() =>
            onPick({
              ...r,
              distM: origin ? Math.round(haversineM(origin, r)) : 0,
            })
          }
        >
          <Text className="text-ink text-sm font-extrabold" numberOfLines={1}>
            {r.name}
          </Text>
          <Text className="text-muted text-[11px]" numberOfLines={2}>
            {r.kind} • {r.address}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
