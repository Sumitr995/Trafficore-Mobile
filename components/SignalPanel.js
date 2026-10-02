import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { RefreshCw, Siren } from 'lucide-react-native';
import { fetchSignals } from '../lib/signals';
import { formatDist } from '../lib/hospitals';
import { triggerGreenCorridor, releaseCorridor } from '../lib/signalControl';

// REAL signals ahead: OSM positions + stable corridor contract per signal.
export default function SignalPanel({ origin, ambulanceId, onSignals }) {
  const [sigs, setSigs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [requested, setRequested] = useState({}); // id → true
  const started = useRef(false);

  async function load() {
    if (!origin) return;
    setBusy(true);
    try {
      const { data } = await fetchSignals(origin);
      setSigs(data);
      onSignals?.(data);
    } catch {
      // signals are advisory — route works without them, stay silent
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (origin && !started.current) {
      started.current = true;
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!origin]);

  async function toggle(s) {
    if (requested[s.id]) {
      await releaseCorridor({ intersectionId: s.id, ambulanceId });
      setRequested((m) => ({ ...m, [s.id]: false }));
    } else {
      await triggerGreenCorridor({ intersectionId: s.id, ambulanceId });
      setRequested((m) => ({ ...m, [s.id]: true }));
    }
  }

  if (!sigs.length) return null;
  return (
    <View className="bg-[#161616] border border-border rounded-3xl p-4 gap-2.5">
      <View className="flex-row items-center gap-2">
        <Siren size={14} color="#00d992" />
        <Text className="text-muted text-[11px] font-bold tracking-widest flex-1">
          SIGNALS AHEAD — {sigs.length}
        </Text>
        {busy && <ActivityIndicator size="small" color="#00d992" />}
        <TouchableOpacity
          className="w-8 h-8 rounded-full border border-border items-center justify-center"
          onPress={load}
        >
          <RefreshCw size={12} color="#f2f2f2" />
        </TouchableOpacity>
      </View>
      {sigs.slice(0, 3).map((s, i) => (
        <View key={s.id} className="flex-row items-center gap-2">
          <Text className="text-muted text-[11px] font-black tracking-widest w-7">
            0{i + 1}
          </Text>
          <Text className="text-ink text-xs font-bold flex-1">
            {formatDist(s.distM)} ahead
          </Text>
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${requested[s.id] ? 'bg-[#ff6b6b]' : 'bg-primary'}`}
            onPress={() => toggle(s)}
          >
            <Text className="text-[11px] font-black tracking-widest" style={{ color: '#101010' }}>
              {requested[s.id] ? 'RELEASE' : 'GO GREEN'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
