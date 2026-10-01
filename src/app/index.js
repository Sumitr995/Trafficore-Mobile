import { Text, TouchableOpacity, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { useTrip } from '../../lib/trip';
import DriverMap from '../../components/DriverMap';
import NavigateCard from '../../components/NavigateCard';
import HomeSheet from '../../components/HomeSheet';

// Uber map-first home: live map behind, floating status, bottom sheet.
export default function HomeScreen() {
  const { user, loading, signOut } = useAuth();
  const t = useTrip();

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

      {/* TOP FLOATING BAR */}
      <View className="absolute top-14 inset-x-4 flex-row items-center gap-2">
        <View
          className={`flex-row items-center gap-1.5 px-3.5 py-2 rounded-full border ${t.online ? 'bg-background/95 border-primary/50' : 'bg-background/95 border-border'}`}
        >
          <View
            className={`w-2 h-2 rounded-full ${t.online ? 'bg-primary' : 'bg-muted'}`}
          />
          <Text
            className={`text-[11px] font-black tracking-widest ${t.online ? 'text-primary' : 'text-muted'}`}
          >
            {t.online ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </View>
        <View className="flex-1" />
        <TouchableOpacity
          className="bg-background/95 border border-border px-3.5 py-2 rounded-full"
          onPress={signOut}
        >
          <Text className="text-ink text-[11px] font-extrabold">Logout</Text>
        </TouchableOpacity>
      </View>

      {/* BOTTOM SHEET (trip actions live in nav view while accepted) */}
      {t.status !== 'accepted' && <HomeSheet t={t} />}
    </View>
  );
}
