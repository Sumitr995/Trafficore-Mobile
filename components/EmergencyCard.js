import { useEffect, useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { Check, MapPin, Siren, Star, Timer } from 'lucide-react-native';

// Full-takeover request card with 30 s countdown — declines itself at 0.
export default function EmergencyCard({ request, onAccept, onDecline, seconds = 30 }) {
  const [left, setLeft] = useState(seconds);
  const done = useRef(false);
  const pulse = useRef(new Animated.Value(0)).current;

  // Optical urgency: breathing severity chip + one haptic on arrival of the card.
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 550,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    try {
      Vibration.vibrate([0, 70, 60, 70]);
    } catch {}
    return () => {
      anim.stop();
      Vibration.cancel();
    };
  }, [request?.id, pulse]);

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
      <View className="flex-row items-center gap-2">
        <View className="flex-1 h-1 rounded-full bg-[#f0f0f0] overflow-hidden">
          <View
            className="h-1 rounded-full bg-accent"
            style={{ width: `${Math.max(0, (left / seconds) * 100)}%` }}
          />
        </View>
        <Text className="text-accent text-[11px] font-black tracking-widest w-7 text-right">
          {left}s
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        <Siren size={17} color="#ff6b6b" />
        <Text className="text-ink font-black text-base flex-1 tracking-wide">
          EMERGENCY PICKUP
        </Text>
        <Animated.View
          style={{
            transform: [
              { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) },
            ],
          }}
        >
          <Text
            className="font-black text-[11px] tracking-widest px-2.5 py-1.5 rounded-lg overflow-hidden"
            style={{ color: '#ffffff', backgroundColor: '#ff6b6b' }}
          >
            {request.severity}
          </Text>
        </Animated.View>
      </View>

      <View className="flex-row items-center gap-3 bg-[#f0f0f0] border border-border rounded-2xl px-4 py-3">
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
        <View className="flex-row items-center gap-1">
          <Star size={12} color="#06c167" />
          <Text className="text-primary font-black text-sm">4.8</Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="items-center pt-1">
          <View className="w-2.5 h-2.5 rounded-full bg-primary" />
          <View className="w-[2px] h-6 bg-border my-0.5" />
          <View className="w-2.5 h-2.5 rounded-full bg-[#ff6b6b]" />
        </View>
        <View className="flex-1 gap-1">
          <Text className="text-muted text-[11px] font-bold tracking-widest">
            PICKUP POINT
          </Text>
          <Text className="text-ink font-bold text-[15px]" numberOfLines={2}>
            {request.pickup}
          </Text>
          <Text className="text-muted text-xs">{request.pickupNote}</Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        <View className="flex-row items-center gap-1.5 bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-full">
          <MapPin size={12} color="#06c167" />
          <Text className="text-primary text-xs font-extrabold">
            {request.distanceKm} km
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5 bg-[#f0f0f0] border border-border px-3 py-1.5 rounded-full">
          <Timer size={12} color="#6b7280" />
          <Text className="text-ink text-xs font-extrabold">~{request.etaMin} min</Text>
        </View>
      </View>

      <View className="flex-row gap-3 mt-1">
        <TouchableOpacity
          className="h-14 px-6 rounded-full border border-border items-center justify-center"
          onPress={onDecline}
          activeOpacity={0.7}
        >
          <Text className="text-ink font-extrabold text-sm tracking-widest">DECLINE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 h-14 rounded-full bg-primary flex-row items-center justify-center gap-1.5"
          onPress={onAccept}
          activeOpacity={0.8}
        >
          <Check size={17} color="#ffffff" />
          <Text className="font-black text-base tracking-wide" style={{ color: '#ffffff' }}>
            ACCEPT
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
