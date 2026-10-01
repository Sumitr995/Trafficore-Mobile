import '../../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../../lib/auth';
import { TripProvider } from '../../lib/trip';

export default function RootLayout() {
  return (
    <AuthProvider>
      <TripProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#101010' },
            headerTintColor: '#f2f2f2',
            contentStyle: { backgroundColor: '#101010' },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="summary" options={{ title: 'Trip Summary' }} />
        </Stack>
      </TripProvider>
    </AuthProvider>
  );
}
