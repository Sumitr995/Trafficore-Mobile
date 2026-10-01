import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Text, TouchableOpacity, View } from 'react-native';
import { rankHospitals } from '../lib/rankHospitals';
import { formatDist } from '../lib/hospitals';

const MEDALS = ['🥇', '🥈', '🥉'];

// AI top-3: Navigate in-app (primary) or Google Maps (optional backup).
export default function TopHospitals({ candidates, severity, onNavigate }) {
  const [ranked, setRanked] = useState([]);
  const [source, setSource] = useState('distance');
  const [busy, setBusy] = useState(false);
  const key = useRef('');

  useEffect(() => {
    const sig = candidates.map((h) => h.id).join('|');
    if (!candidates.length || key.current === sig) return;
    key.current = sig;
    (async () => {
      setBusy(true);
      const r = await rankHospitals(candidates, { severity });
      setRanked(r.ranked);
      setSource(r.source);
      setBusy(false);
    })();
  }, [candidates]);

  if (!candidates.length) return null;
  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-2">
        <Text className="text-ink font-black text-sm flex-1">
          🤖 AI picks for you
        </Text>
        {busy ? (
          <ActivityIndicator size="small" color="#00d992" />
        ) : (
          <Text className="text-muted text-[10px] font-bold">
            {source === 'ai' ? 'ranked by AI' : 'by distance (AI off)'}
          </Text>
        )}
      </View>

      {ranked.map((h, i) => (
        <View
          key={h.id}
          className={`rounded-2xl px-4 py-3 gap-1.5 border-2 ${i === 0 ? 'bg-[#161616] border-primary' : 'bg-[#161616] border-border'}`}
        >
          <View className="flex-row items-center gap-2">
            <Text className="text-lg">{MEDALS[i]}</Text>
            <Text className="text-ink font-black text-sm flex-1" numberOfLines={1}>
              {h.name}
            </Text>
            <Text className="text-primary text-xs font-black bg-primary/10 border border-primary/30 px-2.5 py-1 rounded-full overflow-hidden">
              {formatDist(h.distM)}
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-1.5">
            {(h.reasons || []).map((r) => (
              <Text
                key={r}
                className="text-[11px] font-bold text-ink bg-[#1f1f1f] border border-border px-2.5 py-1 rounded-full overflow-hidden"
              >
                ✓ {r}
              </Text>
            ))}
          </View>
          <View className="flex-row gap-2 mt-1">
            <TouchableOpacity
              className="flex-1 h-11 rounded-full bg-primary items-center justify-center"
              onPress={() => onNavigate(h)}
              activeOpacity={0.8}
            >
              <Text className="font-black text-sm" style={{ color: '#101010' }}>
                Navigate →
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="h-11 px-4 rounded-full border border-border items-center justify-center"
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}`
                )
              }
            >
              <Text className="text-ink text-xs font-extrabold">Google Maps ↗</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}
