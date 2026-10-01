import { Text, TouchableOpacity, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useTrip } from '../../lib/trip';

export default function SummaryScreen() {
  const { trip, status, resetToIdle } = useTrip();
  if (!trip || status !== 'arrived') return <Redirect href="/" />;

  const rows = [
    ['Trip ID', trip.id],
    ['Patient', trip.patient],
    ['Pickup', trip.pickup],
    ['Distance', `${trip.distanceKm} km (demo)`],
    ['Accepted', trip.acceptedAt],
    ['Picked up', trip.pickedUpAt],
    ['Arrived', trip.arrivedAt],
  ];

  return (
    <View className="flex-1 bg-background px-5 justify-center gap-5">
      <View className="items-center gap-2">
        <View className="w-20 h-20 rounded-full bg-primary items-center justify-center">
          <Text className="text-4xl">✓</Text>
        </View>
        <Text className="text-ink text-2xl font-black mt-2">Trip complete</Text>
        <Text className="text-muted text-sm">
          {trip.id} • {trip.patient} — well done, driver.
        </Text>
      </View>

      {/* receipt */}
      <View className="bg-[#161616] border border-border rounded-3xl px-5 py-2">
        {rows.map(([k, v], i) => (
          <View
            key={k}
            className={`flex-row justify-between gap-3 py-3 ${i < rows.length - 1 ? 'border-b border-border' : ''}`}
          >
            <Text className="text-muted text-xs font-bold flex-shrink-0 w-20 pt-0.5">
              {k.toUpperCase()}
            </Text>
            <Text className="text-ink text-[13px] font-bold flex-1 text-right" numberOfLines={2}>
              {v}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        className="h-14 rounded-full bg-primary items-center justify-center"
        onPress={() => {
          resetToIdle();
          router.replace('/');
        }}
        activeOpacity={0.8}
      >
        <Text className="font-black text-base" style={{ color: '#101010' }}>
          Done → New Trip
        </Text>
      </TouchableOpacity>
    </View>
  );
}
