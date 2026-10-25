import { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { History, LogOut, Siren } from 'lucide-react-native';
import { Redirect, router } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { useTrip } from '../../lib/trip';
import { useDriverLocation } from '../../hooks/useLocation';
import DriverMap from '../../components/DriverMap';
import NavigateCard from '../../components/NavigateCard';
import HomeSheet from '../../components/HomeSheet';

// Uber map-first home: live map behind, floating status, bottom sheet.
export default function HomeScreen() {
  const { user, loading, signOut } = useAuth();
  const t = useTrip();
  const { location } = useDriverLocation();

  // Trip telemetry: publish GPS to the broker while a leg is live.
  useEffect(() => {
    if (location?.coords) t.publishPosition(location.coords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.latitude, location?.longitude]);

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted">Loading session…</Text>
      </View>
    );
  }
  if (!user) return <Redirect href="/login" />;

  if (t.status === 'arrived' && t.trip) {
    router.replace('/summary');
  }

  const navigating = t.status === 'accepted' || t.status === 'picked_up';

  return (
    <View className="flex-1 bg-background">
      {/* MAP LAYER */}
      <View className="flex-1">
        {t.status === 'accepted' ? (
          <NavigateCard expanded />
        ) : t.status === 'picked_up' && t.hospital ? (
          <NavigateCard
            expanded
            destination={t.hospital}
            destLabel="HOSPITAL"
            destName="hospital"
            arrivedHint="tap “Arrived at Hospital” below"
          />
        ) : (
          <DriverMap bare showFab follow={navigating} />
        )}
      </View>

      {/* TOP FLOATING CAPSULE — Uber driver style: avatar + status + logout */}
      <View className="absolute top-14 inset-x-4 flex-row items-center">
        <View className="flex-1 flex-row items-center gap-3 bg-background/95 border border-border rounded-full py-2 pl-2.5 pr-4">
          <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
            <Text className="font-black text-lg" style={{ color: '#ffffff' }}>
              D
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-ink font-extrabold text-sm">Ambulance Driver</Text>
            <View className="flex-row items-center gap-1.5">
              <View
                className={`w-1.5 h-1.5 rounded-full ${t.online ? 'bg-accent' : 'bg-muted'}`}
              />
              <Text
                className={`text-[11px] font-extrabold ${t.online ? 'text-primary' : 'text-muted'}`}
              >
                {t.online ? 'ONLINE' : 'OFFLINE'}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          className="w-[52px] h-[52px] bg-background/95 border border-border rounded-full items-center justify-center ml-2"
          onPress={() => router.push('/signal')}
        >
          <Siren size={16} color="#141414" />
        </TouchableOpacity>
        <TouchableOpacity
          className="w-[52px] h-[52px] bg-background/95 border border-border rounded-full items-center justify-center ml-2"
          onPress={() => router.push('/history')}
        >
          <History size={16} color="#141414" />
        </TouchableOpacity>
        <TouchableOpacity
          className="w-[52px] h-[52px] bg-background/95 border border-border rounded-full items-center justify-center ml-2"
          onPress={signOut}
        >
          <LogOut size={16} color="#141414" />
        </TouchableOpacity>
      </View>

      {/* BOTTOM SHEET (trip actions live in nav view while accepted) */}
      {t.status !== 'accepted' && <HomeSheet t={t} />}
    </View>
  );
}
