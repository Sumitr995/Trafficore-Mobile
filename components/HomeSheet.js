import { Text, TouchableOpacity, View } from 'react-native';
import { Hospital as HospitalIcon, X } from 'lucide-react-native';
import EmergencyCard from './EmergencyCard';
import HospitalSheet from './HospitalSheet';
import Reveal from './Reveal';

// Uber-style bottom sheet: one card per driver state, handle on top.
export default function HomeSheet({ t }) {
  return (
    <Reveal
      changeKey={t.status}
      className="absolute bottom-0 inset-x-0 bg-background border-t border-border rounded-t-[28px] px-5 pt-2.5 pb-6"
    >
      <View className="w-10 h-1 rounded-full bg-border self-center mb-3" />

      {t.status === 'offline' && (
        <View className="items-center gap-2 py-2">
          <Text className="text-ink text-xl font-black">You're offline</Text>
          <Text className="text-muted text-sm text-center">
            Go online to receive emergency pickups near you.
          </Text>
          <TouchableOpacity
            className="h-16 w-full rounded-full bg-primary items-center justify-center mt-2"
            onPress={t.goOnline}
            activeOpacity={0.85}
          >
            <Text
              className="font-black text-lg tracking-wide"
              style={{ color: '#ffffff' }}
            >
              GO ONLINE
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {t.status === 'idle' && (
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <View className="w-2.5 h-2.5 rounded-full bg-accent" />
            <Text className="text-ink font-black text-base flex-1">
              You're online
            </Text>
            <TouchableOpacity onPress={t.goOffline}>
              <Text className="text-muted text-xs font-extrabold tracking-widest">
                GO OFFLINE
              </Text>
            </TouchableOpacity>
          </View>
          {/* Driver self-starts a trip: pick up a case, or patient already onboard */}
          <TouchableOpacity
            className="h-14 rounded-full bg-primary items-center justify-center"
            onPress={t.takeCase}
            activeOpacity={0.85}
          >
            <Text className="text-[#ffffff] font-black text-base tracking-wide">
              TAKE A CASE
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="h-14 rounded-full border border-primary/40 bg-primary/10 items-center justify-center"
            onPress={t.startTransport}
            activeOpacity={0.85}
          >
            <Text className="text-primary font-black text-base tracking-wide">
              PATIENT ONBOARD — TRANSPORT NOW
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {t.status === 'incoming' && (
        <EmergencyCard
          request={t.request}
          onAccept={t.accept}
          onDecline={t.decline}
        />
      )}

      {/* picked_up: search hospitals until one is chosen (nav view then
          carries the trip actions). Accepted phase hides this sheet. */}
      {t.status === 'picked_up' && !t.hospital && <HospitalSheet />}
      {t.status === 'picked_up' && t.hospital && (
        <TouchableOpacity
          className="flex-row items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2.5"
          onPress={() => t.setHospital(null)}
        >
          <HospitalIcon size={14} color="#06c167" />
          <Text className="text-primary text-xs font-black flex-1" numberOfLines={1}>
            {t.hospital.name}
          </Text>
          <X size={14} color="#06c167" />
        </TouchableOpacity>
      )}
    </Reveal>
  );
}
