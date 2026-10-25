import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Clock, Hospital as HospitalIcon, MapPin, Siren } from 'lucide-react-native';
import { router } from 'expo-router';
import Reveal from '../../components/Reveal';
import { loadHistory } from '../../lib/history';

// Self-generated demo records until dispatch exists — we label it honestly.
function minsBetween(a, b) {
  if (!a || !b) return null;
  const m = Math.max(1, Math.round((new Date(b) - new Date(a)) / 60000));
  return `${m} min`;
}

function Row({ trip }) {
  const date = trip.acceptedAt ? new Date(trip.acceptedAt) : null;
  const duration = minsBetween(trip.pickedUpAt || trip.acceptedAt, trip.arrivedAt);
  return (
    <Reveal
      changeKey={trip.id}
      className="bg-[#f6f6f6] border border-border rounded-2xl px-4 py-3.5 gap-2"
    >
      <View className="flex-row items-center gap-2">
        <Siren size={14} color="#ff6b6b" />
        <Text className="text-ink font-black text-[15px] flex-1" numberOfLines={1}>
          {trip.patient}
        </Text>
        <View
          className="rounded-lg px-2 py-1.5"
          style={{ backgroundColor: trip.severity === 'CRITICAL' ? '#ff6b6b' : '#141414' }}
        >
          <Text className="text-[10px] font-black tracking-widest" style={{ color: '#ffffff' }}>
            {trip.severity}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <MapPin size={12} color="#6b7280" />
        <Text className="text-muted text-xs flex-1" numberOfLines={1}>
          {trip.pickup}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        <HospitalIcon size={12} color="#6b7280" />
        <Text className="text-muted text-xs flex-1" numberOfLines={1}>
          {trip.hospital || 'No hospital on record'}
        </Text>
      </View>

      {date && (
        <Text className="text-muted text-[10px] tracking-wide">
          {date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          {duration ? ` • ${duration}` : ''}
          {` • ${trip.distanceKm} km • ${trip.mode === 'pickup' ? 'PICKUP LEG' : 'TRANSPORT ONLY'}`}
        </Text>
      )}
    </Reveal>
  );
}

export default function HistoryScreen() {
  const [list, setList] = useState(null);

  useEffect(() => {
    loadHistory().then(setList);
  }, []);

  return (
    <View className="flex-1 bg-background px-4 pt-3">
      <View className="flex-row items-center gap-2 mb-3">
        <Clock size={15} color="#141414" />
        <Text className="text-ink font-black text-base flex-1">
          {list ? `${list.length} completed trip${list.length === 1 ? '' : 's'}` : 'Loading…'}
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-ink text-xs font-extrabold tracking-widest">DONE</Text>
        </TouchableOpacity>
      </View>

      {list && list.length === 0 && (
        <View className="items-center gap-1.5 py-16">
          <Clock size={30} color="#6b7280" />
          <Text className="text-ink font-extrabold">No trips yet</Text>
          <Text className="text-muted text-xs text-center">
            Completed runs land here automatically.
          </Text>
        </View>
      )}

      <View className="gap-3 pb-8">
        {(list || []).map((t) => (
          <Row key={t.id} trip={t} />
        ))}
      </View>
    </View>
  );
}
