import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../lib/auth';

// First NativeWind component — same look, Tailwind classes.
// Tokens live in global.css (@theme): bg-primary, text-ink, text-muted…
export default function DriverHeader({ online }) {
  const { user, signOut } = useAuth();
  return (
    <View className="flex-row items-center gap-2.5">
      <View className="w-11 h-11 rounded-full bg-primary items-center justify-center">
        <Text className="font-black text-xl" style={{ color: '#101010' }}>
          D
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-ink font-extrabold text-base">
          Ambulance Driver
        </Text>
        <Text className="text-muted text-xs" numberOfLines={1}>
          {user?.email} • ★ 4.9
        </Text>
      </View>
      <View
        className={`rounded-xl px-2.5 py-1.5 ${online ? 'bg-primary' : 'bg-border'}`}
      >
        <Text
          className="font-black text-[11px]"
          style={{ color: '#101010' }}
        >
          {online ? 'ONLINE' : 'OFFLINE'}
        </Text>
      </View>
      <TouchableOpacity onPress={signOut}>
        <Text className="text-primary font-extrabold text-[13px]">
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}
