import { View, Text, Pressable, ScrollView } from 'react-native';
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

export default function Landing() {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 40, ...CONTENT_BOX }}>
      <View className="flex-row items-center justify-between px-6 py-6">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-lg bg-accent items-center justify-center">
            <Zap size={18} color="#ffffff" />
          </View>
          <Text className="text-xl font-bold tracking-tight text-ink">Trafficore</Text>
        </View>
        <Pressable onPress={() => router.push('/admin')} className="rounded-full border border-border px-4 py-2">
          <Text className="text-[12px] font-bold text-ink">DASHBOARDS</Text>
        </Pressable>
      </View>

      <View className="items-center px-6 pt-12 pb-4">
        <View className="flex-row items-center gap-2 rounded-full border border-border px-4 py-1.5 mb-7 bg-[#eefbf2]">
          <View className="w-2 h-2 rounded-full bg-accent" />
          <Text className="text-[10px] font-bold text-accent tracking-[2px]">NEXT-GEN RESPONSE PROTOCOL</Text>
        </View>

        <Text className="text-4xl font-bold tracking-tight text-ink text-center leading-tight">
          Engineered for Emergency Response
        </Text>
        <Text className="text-[17px] text-muted text-center max-w-lg leading-relaxed mt-5">
          Real-time fleet synchronization, hospital resource management, and automated incident triage in a single system.
        </Text>

        <View className="flex-row flex-wrap items-center justify-center gap-3 mt-9">
          <Pressable
            onPress={() => router.push('/admin')}
            className="rounded-full bg-primary px-7 py-4"
          >
            <Text className="text-sm font-bold text-white">EXPLORE DASHBOARDS</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/')} className="rounded-full border border-border px-7 py-4">
            <Text className="text-sm font-bold text-ink">DRIVER CONSOLE</Text>
          </Pressable>
        </View>
      </View>

      <View className="py-8 border-y border-border mt-10">
        <View className="flex-row flex-wrap justify-center gap-x-6 gap-y-3 px-6">
          {partners.map((p) => (
            <Text key={p} className="text-[12px] font-bold uppercase tracking-[2px] text-muted">
              {p}
            </Text>
          ))}
        </View>
      </View>

      <View className="px-5 py-12">
        <View className="flex-row flex-wrap gap-4">
          {features.map(({ title, body, Icon, route }) => (
            <Pressable
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
            </Pressable>
          ))}
        </View>
      </View>

      <View className="border-t border-border pt-8 flex-row items-center justify-center gap-2">
        <View className="w-5 h-5 rounded bg-[#f6f6f6] items-center justify-center">
          <Zap size={12} color="#06c167" />
        </View>
        <Text className="text-xs font-bold text-ink">Trafficore</Text>
        <Text className="text-[10px] text-muted tracking-[1.5px] ml-3">ONE CODE · EVERY PLATFORM</Text>
      </View>
    </ScrollView>
  );
}
