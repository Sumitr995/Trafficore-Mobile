import { Text, View } from 'react-native';
import { useDriverLocation } from '../hooks/useLocation';

// Map paused — GPS status card so the trip UI works without native maps.
export default function MapPlaceholder() {
  const { location } = useDriverLocation();
  const c = location?.coords;
  return (
    <View className="h-44 bg-[#161616] border border-dashed border-border rounded-3xl items-center justify-center gap-1.5 px-4">
      <Text className="text-4xl">🛰️</Text>
      <Text className="text-ink font-extrabold text-base">
        {c
          ? `${c.latitude.toFixed(5)}, ${c.longitude.toFixed(5)}`
          : 'Searching GPS…'}
      </Text>
      <View className="flex-row items-center gap-1.5 bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-full">
        <View className="w-2 h-2 rounded-full bg-primary" />
        <Text className="text-primary text-[11px] font-extrabold tracking-widest">
          LIVE GPS • MAP RETURNS SOON
        </Text>
      </View>
    </View>
  );
}
