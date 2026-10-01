import { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

// Full-takeover request card with 30 s countdown — declines itself at 0.
export default function EmergencyCard({ request, onAccept, onDecline, seconds = 30 }) {
  const [left, setLeft] = useState(seconds);
  const done = useRef(false);

  useEffect(() => {
    setLeft(seconds);
    done.current = false;
    const id = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          clearInterval(id);
          if (!done.current) {
            done.current = true;
            onDecline();
          }
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [request?.id]);

  if (!request) return null;
  return (
    <View className="gap-3">
      {/* countdown */}
      <View className="flex-row items-center gap-2">
        <View className="flex-1 h-1.5 rounded-full bg-[#1f1f1f] overflow-hidden">
          <View
            className="h-1.5 rounded-full bg-primary"
            style={{ width: `${Math.max(0, (left / seconds) * 100)}%` }}
          />
        </View>
        <Text className="text-primary text-xs font-black w-8 text-right">
          {left}s
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        <View className="w-2.5 h-2.5 rounded-full bg-[#ff6b6b]" />
        <Text className="text-ink font-black text-lg flex-1">
          Emergency pickup
        </Text>
        <Text
          className="font-black text-[11px] px-2.5 py-1.5 rounded-lg overflow-hidden"
          style={{ color: '#101010', backgroundColor: '#ff6b6b' }}
        >
          {request.severity}
        </Text>
      </View>

      {/* patient row */}
      <View className="flex-row items-center gap-3 bg-[#1f1f1f] border border-border rounded-2xl px-4 py-3">
        <View className="w-11 h-11 rounded-full bg-primary/15 border border-primary/40 items-center justify-center">
          <Text className="text-primary font-black text-lg">
            {request.patient.charAt(0)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-ink font-extrabold text-[15px]">
            {request.patient}
          </Text>
          <Text className="text-muted text-xs">{request.phone}</Text>
        </View>
        <Text className="text-primary font-black text-sm">
          ★ 4.8
        </Text>
      </View>

      {/* route row — Uber style dot-line-pin */}
      <View className="flex-row gap-3">
        <View className="items-center pt-1">
          <View className="w-2.5 h-2.5 rounded-full bg-primary" />
          <View className="w-[2px] h-6 bg-border my-0.5" />
          <View className="w-2.5 h-2.5 bg-[#ff6b6b]" />
        </View>
        <View className="flex-1 gap-1">
          <Text className="text-muted text-[11px] font-bold">PICKUP POINT</Text>
          <Text className="text-ink font-bold text-[15px]" numberOfLines={2}>
            {request.pickup}
          </Text>
          <Text className="text-muted text-xs">{request.pickupNote}</Text>
        </View>
      </View>

      {/* meta chips */}
      <View className="flex-row gap-2">
        <Text className="text-primary text-xs font-extrabold bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-full overflow-hidden">
          📍 {request.distanceKm} km away
        </Text>
        <Text className="text-ink text-xs font-extrabold bg-[#1f1f1f] border border-border px-3 py-1.5 rounded-full overflow-hidden">
          ⏱ ~{request.etaMin} min
        </Text>
      </View>

      <View className="flex-row gap-3 mt-1">
        <TouchableOpacity
          className="w-28 h-14 rounded-full border border-border items-center justify-center"
          onPress={onDecline}
          activeOpacity={0.7}
        >
          <Text className="text-ink font-extrabold">Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 h-14 rounded-full bg-primary items-center justify-center"
          onPress={onAccept}
          activeOpacity={0.8}
        >
          <Text className="font-black text-base" style={{ color: '#101010' }}>
            Accept ✓
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
