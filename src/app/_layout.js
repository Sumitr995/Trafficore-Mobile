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
          <Stack.Screen name="landing" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ title: 'Admin' }} />
          <Stack.Screen name="hospital" options={{ title: 'Hospital' }} />
          <Stack.Screen name="history" options={{ title: 'Trip History' }} />
          <Stack.Screen name="summary" options={{ title: 'Trip Summary' }} />
        </Stack>
      </TripProvider>
    </AuthProvider>
  );
}
