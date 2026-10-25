import '../../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../../lib/auth';
import { TripProvider } from '../../lib/trip';

export default function RootLayout() {
  return (
    <AuthProvider>
      <TripProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#ffffff' },
            headerTintColor: '#141414',
            contentStyle: { backgroundColor: '#ffffff' },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="history" options={{ title: 'Trip History' }} />
          <Stack.Screen name="summary" options={{ title: 'Trip Summary' }} />
        </Stack>
      </TripProvider>
    </AuthProvider>
  );
}
