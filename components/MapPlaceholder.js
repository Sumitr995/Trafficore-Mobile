import { Text, View } from 'react-native';
import { Satellite } from 'lucide-react-native';
import { useDriverLocation } from '../hooks/useLocation';

// Map is paused — GPS status card so the trip UI works without native maps.
export default function MapPlaceholder() {
  const { location } = useDriverLocation();
  const c = location?.coords;
  return (
    <View className="h-44 bg-[#161616] border border-border rounded-3xl items-center justify-center gap-1.5 px-4">
      <Satellite size={30} color="#8b949e" />
      <Text className="text-ink font-extrabold text-base tracking-wide">
        {c
          ? `${c.latitude.toFixed(5)}, ${c.longitude.toFixed(5)}`
          : 'SEARCHING GPS…'}
      </Text>
      <View className="flex-row items-center gap-1.5 bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-full">
        <View className="w-2 h-2 rounded-full bg-primary" />
        <Text className="text-primary text-[11px] font-extrabold tracking-widest">
          LIVE GPS
        </Text>
      </View>
    </View>
  );
}
