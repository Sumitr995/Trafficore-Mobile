import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Text, TouchableOpacity, View } from 'react-native';
import DriverMap from './DriverMap';
import TripBanner from './TripBanner';
import SignalPanel from './SignalPanel';
import { useDriverLocation } from '../hooks/useLocation';
import { useTrip } from '../lib/trip';
import {
  ARRIVE_M,
  demoDestination,
  distToRouteM,
  fetchRoute,
  formatEta,
  formatKm,
  haversineM,
} from '../lib/routing';

// Uber-navigation unit: live map + green OSRM route + Start Trip + ETA.
// NOTE: uses its own GPS read; later we lift location to one shared context.
export default function NavigateCard({
  expanded = false,
  destination = null, // {latitude,longitude} — hospital leg; null = demo patient
  destLabel = 'PICKUP',
  destName = 'pickup',
  arrivedHint = 'tap “Picked Up Patient”',
}) {
  const { location } = useDriverLocation();
  const { trip, status, pickedUp, arrived: arrivedAction } = useTrip();
  const origin = location?.coords
    ? { latitude: location.coords.latitude, longitude: location.coords.longitude }
    : null;

  const [phase, setPhase] = useState('idle'); // idle|loading|ready|error
  const [route, setRoute] = useState(null);
  const [error, setError] = useState('');
  const [follow, setFollow] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [sigs, setSigs] = useState([]); // real OSM signals → map pins
  const destRef = useRef(null);
  const lastFetch = useRef(0);

  // Destination: hospital prop or demo patient (~1.5 km). A new key
  // resets the route (render-phase reset — React's derived-state pattern).
  const destKey = destination
    ? `${destination.latitude.toFixed(4)},${destination.longitude.toFixed(4)}`
    : 'demo';
  if (destRef.key !== destKey) {
    destRef.key = destKey;
    destRef.current = null;
    destRef.fetched = false;
    setRoute(null);
    setPhase('idle');
    setArrived(false);
  }
  if (origin && !destRef.current) {
    destRef.current = destination
      ? { ...destination, label: destLabel }
      : { ...demoDestination(origin), label: 'PICKUP' };
  }
  const dest = destRef.current;

  async function load(from = origin, silent = false) {
    if (!from || !dest) return;
    if (!silent) {
      setPhase('loading');
      setError('');
    }
    try {
      const r = await fetchRoute(from, dest);
      lastFetch.current = Date.now();
      setRoute(r);
      setPhase('ready');
    } catch (e) {
      if (!silent) {
        setPhase('error');
        setError(e.message || 'Route failed.');
      }
    }
  }

  useEffect(() => {
    if (origin && !destRef.fetched && phase === 'idle') {
      destRef.fetched = true;
      load(origin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!origin]);

  useEffect(() => {
    if (origin && dest) setArrived(haversineM(origin, dest) < ARRIVE_M);
  }, [origin?.latitude, origin?.longitude]);

  useEffect(() => {
    if (follow && route && origin && Date.now() - lastFetch.current > 15000) {
      if (distToRouteM(origin, route.points) > 120) load(origin, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin?.latitude, origin?.longitude, follow]);

  function openGMaps() {
    if (!origin || !dest) return;
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1` +
        `&origin=${origin.latitude},${origin.longitude}` +
        `&destination=${dest.latitude},${dest.longitude}&travelmode=driving`
    );
  }

  return (
    <View className={expanded ? 'flex-1 gap-3 pb-2' : 'gap-3'}>
      {/* map with floating ETA chip */}
      <View
        className={
          expanded
            ? 'flex-1 relative'
            : 'relative rounded-3xl overflow-hidden border border-border'
        }
      >
        <View className={expanded ? 'flex-1' : 'h-[300px]'}>
          <DriverMap
            compact
            bare
            destination={dest}
            routePoints={route?.points || null}
            signals={sigs.map((s) => [s.latitude, s.longitude])}
            follow={follow}
          />
        </View>
        <View className="absolute top-3 left-3 bg-background/95 border border-primary/40 px-4 py-2.5 rounded-full">
          {phase === 'ready' && route ? (
            <Text className="text-primary font-black text-sm">
              🟢 {formatKm(route.distanceM)} • ~{formatEta(route.durationS)}
              {follow ? ' • following' : ''}
            </Text>
          ) : phase === 'loading' ? (
            <Text className="text-muted text-xs font-bold">Finding route…</Text>
          ) : (
            <Text className="text-muted text-xs font-bold">Route to {destName}</Text>
          )}
        </View>
      </View>

      <View className="bg-[#161616] border border-border rounded-3xl p-4 gap-3">
        {phase === 'loading' && (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator color="#00d992" />
            <Text className="text-muted text-xs">Finding road route…</Text>
          </View>
        )}
        {phase === 'error' && (
          <>
            <View className="rounded-2xl border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-4 py-3">
              <Text className="text-[#ff6b6b] text-xs font-bold">{error}</Text>
            </View>
            <TouchableOpacity
              className="h-12 rounded-full bg-primary items-center justify-center"
              onPress={() => load()}
            >
              <Text className="font-black" style={{ color: '#101010' }}>
                Retry Route
              </Text>
            </TouchableOpacity>
          </>
        )}
        {arrived && (
          <View className="rounded-2xl bg-primary/15 border border-primary/40 px-4 py-3">
            <Text className="text-primary font-black text-[13px]">
              ✅ ARRIVED (within 300 m) — {arrivedHint}
            </Text>
          </View>
        )}
        <View className="flex-row gap-3">
          <TouchableOpacity
            className={`flex-1 h-14 rounded-full items-center justify-center ${follow ? 'bg-[#ff6b6b]' : 'bg-primary'}`}
            onPress={() => setFollow((f) => !f)}
            activeOpacity={0.8}
          >
            <Text className="font-black text-base" style={{ color: '#101010' }}>
              {follow ? '■ Stop' : '▶ Start Trip'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="h-14 px-5 rounded-full border border-border items-center justify-center"
            onPress={openGMaps}
          >
            <Text className="text-ink font-extrabold">🗺️ Backup</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* trip actions live here in full-screen nav mode (no sheet then) */}
      {expanded && trip && (status === 'accepted' || status === 'picked_up') && (
        <View className="px-4 pb-4 bg-background">
          <TripBanner
            status={status}
            trip={trip}
            onPickedUp={pickedUp}
            onArrived={arrivedAction}
          />
        </View>
      )}
      <SignalPanel
        origin={origin}
        ambulanceId={trip?.id || 'AMB-DEMO'}
        onSignals={setSigs}
      />
    </View>
  );
}
