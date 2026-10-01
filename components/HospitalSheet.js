import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDriverLocation } from '../hooks/useLocation';
import { useTrip } from '../lib/trip';
import { fetchHospitals, formatDist } from '../lib/hospitals';
import NameSearch from './NameSearch';
import TopHospitals from './TopHospitals';

// Real nearby hospitals (Overpass) + Google Maps bridge (no keys anywhere).
export default function HospitalSheet() {
  const { location } = useDriverLocation();
  const { setHospital, trip } = useTrip();
  const origin = location?.coords
    ? { latitude: location.coords.latitude, longitude: location.coords.longitude }
    : null;

  const [phase, setPhase] = useState('idle'); // idle|loading|ready|error
  const [list, setList] = useState([]);
  const [cached, setCached] = useState(false);
  const [error, setError] = useState('');
  const [custom, setCustom] = useState('');
  const [customErr, setCustomErr] = useState('');
  const started = useRef(false);

  async function load(force = false) {
    if (!origin) return;
    setPhase('loading');
    setError('');
    try {
      const { data, cached: hit } = await fetchHospitals(origin, { force });
      setList(data);
      setCached(hit);
      setPhase('ready');
    } catch (e) {
      setPhase('error');
      setError(e.message || 'Search failed.');
    }
  }

  useEffect(() => {
    if (origin && !started.current) {
      started.current = true;
      load(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!origin]);

  function openGMaps(lat, lon) {
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
    );
  }

  // "Give GPS from Google Maps to the app": paste "lat, lon" you long-pressed
  // in Google Maps → we route to it in-app with the green OSRM line.
  function useCustom() {
    setCustomErr('');
    const m = custom.trim().match(/(-?\d+(\.\d+)?)\s*[, ]\s*(-?\d+(\.\d+)?)/);
    if (!m) {
      setCustomErr('Paste like: 28.6139, 77.2090');
      return;
    }
    const latitude = parseFloat(m[1]);
    const longitude = parseFloat(m[3]);
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
      setCustomErr('Those numbers are not valid coordinates.');
      return;
    }
    setHospital({
      id: `pin/${latitude},${longitude}`,
      name: 'Pinned location',
      address: 'Dropped pin from Google Maps',
      latitude,
      longitude,
      distM: 0,
    });
  }

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-2">
        <Text className="text-ink font-black text-base flex-1">
          🏥 Nearest hospitals
        </Text>
        {cached && (
          <Text className="text-muted text-[10px] font-bold">• cached</Text>
        )}
        <TouchableOpacity onPress={() => load(true)}>
          <Text className="text-primary text-xs font-extrabold">↻ Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* automatic: type a name, tap, done — no coordinates typed */}
      <NameSearch origin={origin} onPick={(h) => setHospital(h)} />

      {phase === 'ready' && list.length > 0 && (
        <TopHospitals
          candidates={list}
          severity={trip?.severity}
          onNavigate={(h) => setHospital(h)}
        />
      )}

      {phase === 'loading' && (
        <View className="flex-row items-center gap-2 py-4 justify-center">
          <ActivityIndicator color="#00d992" />
          <Text className="text-muted text-xs">Searching OSM around you…</Text>
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
              Retry Search
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === 'ready' && list.length === 0 && (
        <View className="rounded-2xl bg-[#161616] border border-border px-4 py-5 items-center gap-1">
          <Text className="text-4xl">🏥</Text>
          <Text className="text-ink font-extrabold">
            No hospitals mapped near you
          </Text>
          <Text className="text-muted text-xs text-center">
            OSM has none within 8 km here — use a Google Maps pin below.
          </Text>
        </View>
      )}

      {phase === 'ready' && list.length > 0 && (
        <ScrollView className="max-h-72" nestedScrollEnabled>
          <View className="gap-2">
            {list.slice(0, 12).map((h) => (
              <View
                key={h.id}
                className="bg-[#161616] border border-border rounded-2xl px-4 py-3 gap-1.5"
              >
                <View className="flex-row items-center gap-2">
                  <Text className="text-ink font-extrabold text-sm flex-1" numberOfLines={1}>
                    {h.name}
                  </Text>
                  <Text className="text-primary text-xs font-black bg-primary/10 border border-primary/30 px-2.5 py-1 rounded-full overflow-hidden">
                    {formatDist(h.distM)}
                  </Text>
                </View>
                <Text className="text-muted text-xs" numberOfLines={2}>
                  {h.address}
                </Text>
                <View className="flex-row gap-2 mt-1">
                  <TouchableOpacity
                    className="flex-1 h-11 rounded-full bg-primary items-center justify-center"
                    onPress={() => setHospital(h)}
                    activeOpacity={0.8}
                  >
                    <Text className="font-black text-sm" style={{ color: '#101010' }}>
                      Navigate →
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="h-11 px-4 rounded-full border border-border items-center justify-center"
                    onPress={() => openGMaps(h.latitude, h.longitude)}
                  >
                    <Text className="text-ink text-xs font-extrabold">GMaps</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Google Maps pin → in-app route */}
      <View className="bg-[#161616] border border-border rounded-2xl px-4 py-3 gap-2">
        <Text className="text-muted text-[11px] font-extrabold tracking-widest">
          FROM GOOGLE MAPS — PASTE GPS
        </Text>
        <View className="flex-row gap-2">
          <TextInput
            className="flex-1 h-12 rounded-xl bg-[#1f1f1f] border border-border px-3 text-ink text-sm"
            value={custom}
            onChangeText={setCustom}
            placeholder="28.6139, 77.2090"
            placeholderTextColor="#8b949e"
            keyboardType="numbers-and-punctuation"
          />
          <TouchableOpacity
            className="h-12 px-4 rounded-xl bg-primary items-center justify-center"
            onPress={useCustom}
          >
            <Text className="font-black text-sm" style={{ color: '#101010' }}>
              Go
            </Text>
          </TouchableOpacity>
        </View>
        {customErr ? (
          <Text className="text-[#ff6b6b] text-xs font-bold">{customErr}</Text>
        ) : (
          <Text className="text-muted text-[11px]">
            Long-press any spot in Google Maps → copy its lat,lon → paste here.
          </Text>
        )}
      </View>
    </View>
  );
}
