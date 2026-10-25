import { useEffect } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { Zap, LayoutDashboard, Building2, Ambulance } from 'lucide-react-native';
import { CONTENT_BOX } from '../../lib/theme';

const partners = [
  'City General Hospital', 'Metro Emergency Services', 'National Trauma Center',
  'Apex Ambulance Fleet', 'Unity Medical Care', 'Rapid Response Units',
];

const features = [
  {
    title: 'Fleet Control',
    body: 'Complete oversight of ambulance status, personnel availability, and systemic metrics via a high-fidelity administrative console.',
    Icon: LayoutDashboard,
    route: '/admin',
  },
  {
    title: 'Resource Sync',
    body: 'Real-time bed availability tracking and patient intake preparation. Sync inbound ambulance vitals directly with emergency wards.',
    Icon: Building2,
    route: '/hospital',
  },
  {
    title: 'Mission Intel',
    body: 'A focused emergency-flow app for first responders. Transmit position and incident data over the corridor MQTT contract.',
    Icon: Ambulance,
    route: '/',
  },
];

// Press feedback: quick spring-down on touch, back on release.
function Tappable({ onPress, className, style, children }) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  // Reanimated shared values are intentional mutable refs on the JS thread
  const pressIn = () => {
    /* eslint-disable-next-line react-hooks/immutability */
    scale.value = withSpring(0.96, { damping: 18, stiffness: 300 });
  };
  const pressOut = () => {
    /* eslint-disable-next-line react-hooks/immutability */
    scale.value = withSpring(1, { damping: 12, stiffness: 220 });
  };
  return (
    <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut}>
      <Animated.View className={className} style={[anim, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

// Fade + rise into place once the block scrolls ~88% up the viewport.
function ScrollReveal({ scrollY, children, className }) {
  const top = useSharedValue(Number.POSITIVE_INFINITY);
  const t = useSharedValue(0);
  const { height: vh } = useWindowDimensions();

  useAnimatedReaction(
    () => top.value - scrollY.value,
    (dist, prevDist) => {
      if (dist < vh * 0.88 && t.value === 0) t.value = 1;
    },
    [vh]
  );

  const anim = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ translateY: 26 * (1 - t.value) }],
  }));

  return (
    <View
      className={className}
      onLayout={(e) => { top.value = e.nativeEvent.layout.y; }}
    >
      <Animated.View style={anim}>{children}</Animated.View>
    </View>
  );
}

// Mercury dot inside the hero chip — heartbeat, forever.
function PulseDot() {
  const p = useSharedValue(1);
  useEffect(() => {
    p.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.linear }),
        withTiming(0.35, { duration: 900, easing: Easing.linear })
      ),
      -1
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <Animated.View className="w-2 h-2 rounded-full bg-accent" style={{ opacity: p }} />;
}

// Hero children enter staggered on mount.
function Enter({ delay, children, style }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const anim = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ translateY: 14 * (1 - t.value) }],
  }));
  return <Animated.View style={[anim, style]}>{children}</Animated.View>;
}

export default function Landing() {
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => { scrollY.value = e.contentOffset.y; });

  // Hero drifts slower than the page and fades as it leaves.
  const heroAnim = useAnimatedStyle(() => ({
    opacity: 1 - Math.min(1, scrollY.value / 280),
    transform: [{ translateY: scrollY.value * 0.28 }],
  }));

  // Header hairline appears past 24px of scroll.
  const hairline = useAnimatedStyle(() => ({
    opacity: scrollY.value > 24 ? 1 : 0,
  }));

  return (
    <Animated.ScrollView
      className="flex-1 bg-background"
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingBottom: 40, ...CONTENT_BOX }}
    >
      {/* Header */}
      <View className="px-6 py-6">
        <View className="flex-row items-center justify-between pb-1">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-lg bg-accent items-center justify-center">
              <Zap size={18} color="#ffffff" />
            </View>
            <Text className="text-xl font-bold tracking-tight text-ink">Trafficore</Text>
          </View>
          <Tappable onPress={() => router.push('/admin')} className="rounded-full border border-border px-4 py-2">
            <Text className="text-[12px] font-bold text-ink">DASHBOARDS</Text>
          </Tappable>
        </View>
        <Animated.View className="absolute bottom-0 left-6 right-6 h-px bg-border" style={hairline} />
      </View>

      {/* Hero */}
      <Animated.View className="px-6" style={heroAnim}>
        <View className="items-center pt-12 pb-4">
          <Enter delay={0}>
            <View className="flex-row items-center gap-2 rounded-full border border-border px-4 py-1.5 mb-7 bg-[#eefbf2]">
              <PulseDot />
              <Text className="text-[10px] font-bold text-accent tracking-[2px]">NEXT-GEN RESPONSE PROTOCOL</Text>
            </View>
          </Enter>

          <Enter delay={120}>
            <Text className="text-4xl font-bold tracking-tight text-ink text-center leading-tight">
              Engineered for Emergency Response
            </Text>
          </Enter>
          <Enter delay={240}>
            <Text className="text-[17px] text-muted text-center max-w-lg leading-relaxed mt-5">
              Real-time fleet synchronization, hospital resource management, and automated incident triage in a single system.
            </Text>
          </Enter>

          <Enter delay={360}>
            <View className="flex-row flex-wrap items-center justify-center gap-3 mt-9">
              <Tappable onPress={() => router.push('/admin')} className="rounded-full bg-primary px-7 py-4">
                <Text className="text-sm font-bold text-white">EXPLORE DASHBOARDS</Text>
              </Tappable>
              <Tappable onPress={() => router.push('/')} className="rounded-full border border-border px-7 py-4">
                <Text className="text-sm font-bold text-ink">DRIVER CONSOLE</Text>
              </Tappable>
            </View>
          </Enter>
        </View>
      </Animated.View>

      <ScrollReveal scrollY={scrollY}>
        <View className="py-8 border-y border-border mt-10">
          <View className="flex-row flex-wrap justify-center gap-x-6 gap-y-3 px-6">
            {partners.map((p) => (
              <Text key={p} className="text-[12px] font-bold uppercase tracking-[2px] text-muted">
                {p}
              </Text>
            ))}
          </View>
        </View>
      </ScrollReveal>

      <View className="px-5 py-12">
        <ScrollReveal scrollY={scrollY}>
          <View className="flex-row flex-wrap gap-4">
            {features.map(({ title, body, Icon, route }) => (
              <Tappable
                key={title}
                onPress={() => router.push(route)}
                className="rounded-2xl border border-border p-6"
                style={{ grow: 1, minWidth: '45%' }}
              >
                <View className="w-11 h-11 rounded-lg bg-[#f6f6f6] items-center justify-center mb-5">
                  <Icon size={22} color="#06c167" />
                </View>
                <Text className="text-lg font-bold text-ink mb-3">{title.toUpperCase()}</Text>
                <Text className="text-[13px] text-muted leading-relaxed">{body}</Text>
              </Tappable>
            ))}
          </View>
        </ScrollReveal>
      </View>

      <View className="border-t border-border pt-8 flex-row items-center justify-center gap-2">
        <View className="w-5 h-5 rounded bg-[#f6f6f6] items-center justify-center">
          <Zap size={12} color="#06c167" />
        </View>
        <Text className="text-xs font-bold text-ink">Trafficore</Text>
        <Text className="text-[10px] text-muted tracking-[1.5px] ml-3">ONE CODE · EVERY PLATFORM</Text>
      </View>
    </Animated.ScrollView>
  );
}
