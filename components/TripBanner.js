import { Text, TouchableOpacity, View } from 'react-native';
import { ArrowRight, Check, TrafficCone } from 'lucide-react-native';

const STEPS = [
  { key: 'accepted', label: 'Request accepted' },
  { key: 'picked_up', label: 'Patient on board' },
  { key: 'hospital', label: 'To hospital' },
  { key: 'arrived', label: 'Arrived' },
];

function stepIndex(status) {
  if (status === 'accepted') return 0;
  if (status === 'picked_up') return 1;
  return 2;
}

export default function TripBanner({ status, trip, onPickedUp, onArrived }) {
  if (!trip) return null;
  const idx = stepIndex(status);
  return (
    <View className="bg-[#161616] border border-border rounded-3xl p-5 gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-primary text-[11px] font-black tracking-widest">
          {status === 'accepted' ? '● EN ROUTE — PATIENT' : '● EN ROUTE — HOSPITAL'}
        </Text>
        <Text className="text-muted text-[11px] font-bold">{trip.id}</Text>
      </View>

      <View className="flex-row items-center gap-3">
        <View className="w-12 h-12 rounded-full bg-primary items-center justify-center">
          <Text className="font-black text-xl" style={{ color: '#101010' }}>
            {trip.patient.charAt(0)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-ink font-black text-lg">{trip.patient}</Text>
          <Text className="text-muted text-xs" numberOfLines={1}>
            {trip.pickup}
          </Text>
        </View>
      </View>

      <View>
        {STEPS.map((s, i) => {
          const done = i <= idx;
          const last = i === STEPS.length - 1;
          return (
            <View key={s.key} className="flex-row gap-3">
              <View className="items-center">
                <View
                  className={`w-4 h-4 rounded-full border-2 ${done ? 'bg-primary border-primary' : 'border-border'}`}
                />
                {!last && (
                  <View className={`w-[2px] h-5 ${i < idx ? 'bg-primary' : 'bg-border'}`} />
                )}
              </View>
              <Text
                className={`text-sm font-bold pb-4 ${done ? 'text-ink' : 'text-muted'}`}
              >
                {s.label}
              </Text>
            </View>
          );
        })}
      </View>

      {status === 'accepted' && (
        <TouchableOpacity
          className="h-14 rounded-full bg-primary flex-row items-center justify-center gap-1.5"
          onPress={onPickedUp}
          activeOpacity={0.8}
        >
          <Check size={17} color="#101010" />
          <Text className="font-black text-base tracking-wide" style={{ color: '#101010' }}>
            PATIENT ON BOARD
          </Text>
        </TouchableOpacity>
      )}
      {status === 'picked_up' && (
        <TouchableOpacity
          className="h-14 rounded-full bg-primary flex-row items-center justify-center gap-1.5"
          onPress={onArrived}
          activeOpacity={0.8}
        >
          <Text className="font-black text-base tracking-wide" style={{ color: '#101010' }}>
            ARRIVED
          </Text>
          <ArrowRight size={17} color="#101010" />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        className="h-12 rounded-full border border-primary/50 flex-row items-center justify-center gap-1.5"
        onPress={() => alert('Signal requested (MOCK — hardware later)')}
      >
        <TrafficCone size={15} color="#00d992" />
        <Text className="text-primary font-extrabold text-[13px] tracking-widest">
          GREEN CORRIDOR — MOCK
        </Text>
      </TouchableOpacity>
    </View>
  );
}
