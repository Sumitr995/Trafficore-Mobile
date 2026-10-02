import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Linking,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MapPin, Navigation, Search, Timer } from 'lucide-react-native';
import { rankHospitals } from '../lib/rankHospitals';
import { formatDist } from '../lib/hospitals';

const AUTO_SEC = 10; // no choice in 10 s → auto-route to #1

// Minimalist top-3: rank, countdown, search-across-10, two route buttons.
export default function TopHospitals({ candidates, severity, onNavigate }) {
  const [ranked, setRanked] = useState([]);
  const [source, setSource] = useState('distance');
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState(AUTO_SEC);
  const [query, setQuery] = useState('');
  const key = useRef('');
  const chosen = useRef(false);
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(12)).current;

  const pool = candidates.slice(0, 10); // search + rank pool: nearest 10

  useEffect(() => {
    const sig = candidates.map((h) => h.id).join('|');
    if (!candidates.length || key.current === sig) return;
    key.current = sig;
    chosen.current = false;
    (async () => {
      setBusy(true);
      const r = await rankHospitals(candidates, { severity });
      setRanked(r.ranked);
      setSource(r.source);
      setBusy(false);
      setLeft(AUTO_SEC);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(rise, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]).start();
    })();
  }, [candidates]);

  // 10 s auto-route to #1 unless the driver already chose
  useEffect(() => {
    if (!ranked.length) return;
    const id = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          clearInterval(id);
          if (!chosen.current && ranked[0]) {
            chosen.current = true;
            onNavigate(ranked[0]);
          }
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [ranked]);

  function choose(h) {
    if (chosen.current) return;
    chosen.current = true;
    onNavigate(h);
  }

  const q = query.trim().toLowerCase();
  const matches =
    q.length < 2
      ? []
      : pool
          .filter(
            (h) =>
              h.name.toLowerCase().includes(q) ||
              (h.address || '').toLowerCase().includes(q)
          )
          .slice(0, 5);

  if (!candidates.length) return null;
  return (
    <Animated.View
      className="gap-3"
      style={{ opacity: fade, transform: [{ translateY: rise }] }}
    >
      <View className="flex-row items-center gap-2">
        <Text className="text-muted text-[11px] font-bold tracking-widest flex-1">
          NEARBY HOSPITALS
        </Text>
        <Timer size={12} color="#8b949e" />
        <Text className="text-primary text-[11px] font-black">
          {left}s AUTO
        </Text>
      </View>
      <View className="h-1 rounded-full bg-[#1f1f1f] overflow-hidden">
        <View
          className="h-1 rounded-full bg-primary"
          style={{ width: `${(left / AUTO_SEC) * 100}%` }}
        />
      </View>

      {busy && !ranked.length ? (
        <Text className="text-muted text-xs text-center py-3">
          Ranking nearest options…
        </Text>
      ) : (
        ranked.map((h, i) => (
          <View
            key={h.id}
            className={`rounded-2xl px-4 py-3.5 gap-2.5 border ${i === 0 ? 'bg-[#161616] border-primary' : 'bg-[#161616] border-border'}`}
          >
            <View className="flex-row items-center gap-2.5">
              <Text className="text-muted text-[11px] font-black tracking-widest w-6">
                0{i + 1}
              </Text>
              <Text className="text-ink font-extrabold text-[15px] flex-1" numberOfLines={1}>
                {h.name}
              </Text>
              <Text className="text-primary text-xs font-black">
                {formatDist(h.distM)}
              </Text>
            </View>
            {(h.reasons || []).length > 0 && (
              <Text className="text-muted text-[11px]" numberOfLines={1}>
                {(h.reasons || []).slice(0, 2).join(' • ')}
              </Text>
            )}
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 h-12 rounded-full bg-primary flex-row items-center justify-center gap-1.5"
                onPress={() => choose(h)}
                activeOpacity={0.8}
              >
                <Navigation size={15} color="#101010" />
                <Text className="font-black text-sm" style={{ color: '#101010' }}>
                  Route
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="h-12 px-4 rounded-full border border-border flex-row items-center gap-1.5"
                onPress={() =>
                  Linking.openURL(
                    `https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}`
                  )
                }
              >
                <MapPin size={14} color="#f2f2f2" />
                <Text className="text-ink text-xs font-extrabold">Maps</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* search across the nearest 10 */}
      <View className="flex-row items-center gap-2 h-12 rounded-full bg-[#1f1f1f] border border-border px-4">
        <Search size={15} color="#8b949e" />
        <TextInput
          className="flex-1 text-ink text-sm h-12"
          value={query}
          onChangeText={setQuery}
          placeholder="Search hospital name…"
          placeholderTextColor="#8b949e"
          autoCorrect={false}
        />
      </View>
      {matches.map((h) => (
        <TouchableOpacity
          key={h.id}
          className="flex-row items-center gap-2 px-4 py-3 rounded-2xl bg-[#1f1f1f] border border-border"
          onPress={() => choose(h)}
        >
          <Text className="text-ink text-sm font-bold flex-1" numberOfLines={1}>
            {h.name}
          </Text>
          <Text className="text-primary text-xs font-black">
            {formatDist(h.distM)}
          </Text>
        </TouchableOpacity>
      ))}
      {source === 'distance' && !busy && (
        <Text className="text-muted text-[10px] text-center">
          Ranked by distance
        </Text>
      )}
    </Animated.View>
  );
}
