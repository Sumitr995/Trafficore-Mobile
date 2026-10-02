import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Hospital as HospitalIcon, RefreshCw } from 'lucide-react-native';
import { useDriverLocation } from '../hooks/useLocation';
import { useTrip } from '../lib/trip';
import { fetchHospitals, loadLast } from '../lib/hospitals';
import { fetchGeoapifyHospitals, mergeHospitals } from '../lib/placesGeoapify';
import TopHospitals from './TopHospitals';

// Minimalist hospital picker: top-3 AI cards + search. Nothing else.
export default function HospitalSheet() {
  const { location, status } = useDriverLocation();
  const { setHospital, trip } = useTrip();
  const origin = location?.coords
    ? { latitude: location.coords.latitude, longitude: location.coords.longitude }
    : null;

  const [phase, setPhase] = useState('idle'); // idle|loading|ready|error
  const [list, setList] = useState([]);
  const [cached, setCached] = useState(false);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState('');
  const started = useRef(false);

  async function load(force = false) {
    if (!origin) return;
    setPhase('loading');
    setError('');
    setOffline(false);
    // sources are isolated: either one alone still shows results
    const [o, g] = await Promise.all([
      fetchHospitals(origin, { force }).catch((e) => ({ error: e })),
      fetchGeoapifyHospitals(origin, { force }).catch(() => ({ data: [] })),
    ]);
    const merged = mergeHospitals(o.data || [], g.data || []);
    if (merged.length) {
      setList(merged);
      setCached(!!o.cached);
      setPhase('ready');
      return;
    }
    // both failed/empty → last-known list with an honest tag
    const last = await loadLast();
    if (last) {
      setList(last.data);
      setOffline(true);
      setPhase('ready');
      return;
    }
    setPhase('error');
    setError(o.error?.message || 'Search failed.');
  }

  useEffect(() => {
    if (origin && !started.current) {
      started.current = true;
      load(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!origin]);

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-2">
        <HospitalIcon size={15} color="#00d992" />
        <Text className="text-muted text-[11px] font-bold tracking-widest flex-1">
          NEARBY HOSPITALS{cached ? ' • CACHED' : ''}
        </Text>
        <TouchableOpacity
          className="w-9 h-9 rounded-full border border-border items-center justify-center"
          onPress={() => load(true)}
        >
          <RefreshCw size={14} color="#f2f2f2" />
        </TouchableOpacity>
      </View>

      {offline && (
        <View className="rounded-2xl border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-4 py-2.5">
          <Text className="text-[#ff6b6b] text-xs font-bold">
            Offline — last known list.
          </Text>
        </View>
      )}

      {!origin && (
        <View className="rounded-2xl border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-4 py-3">
          <Text className="text-[#ff6b6b] text-xs font-bold">
            {status === 'denied'
              ? 'GPS denied — enable Location, then refresh.'
              : 'Waiting for GPS fix…'}
          </Text>
        </View>
      )}

      {phase === 'loading' && (
        <View className="flex-row items-center gap-2 py-4 justify-center">
          <ActivityIndicator color="#00d992" />
          <Text className="text-muted text-xs">Searching around you…</Text>
        </View>
      )}

      {phase === 'error' && (
        <View className="gap-2">
          <View className="rounded-2xl border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-4 py-3">
            <Text className="text-[#ff6b6b] text-xs font-bold">{error}</Text>
          </View>
          <TouchableOpacity
            className="h-12 rounded-full bg-primary items-center justify-center"
            onPress={() => load(true)}
          >
            <Text className="font-black" style={{ color: '#101010' }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === 'ready' && list.length === 0 && (
        <View className="rounded-2xl bg-[#161616] border border-border px-4 py-5 items-center gap-1">
          <HospitalIcon size={28} color="#8b949e" />
          <Text className="text-ink font-extrabold">None mapped nearby</Text>
          <Text className="text-muted text-xs text-center">
            No hospitals within 8 km in OSM.
          </Text>
        </View>
      )}

      {phase === 'ready' && list.length > 0 && (
        <TopHospitals
          candidates={list}
          severity={trip?.severity}
          onNavigate={(h) => setHospital(h)}
        />
      )}

      <Text className="text-muted text-[10px] text-center">
        © OpenStreetMap • Powered by Geoapify
      </Text>
    </View>
  );
}
