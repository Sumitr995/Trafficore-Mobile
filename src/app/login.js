import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Redirect, router } from 'expo-router';
import { Ambulance } from 'lucide-react-native';
import { DEMO_DRIVER, useAuth } from '../../lib/auth';

export default function LoginScreen() {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState(DEMO_DRIVER.email);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Redirect href="/" />;

  async function onLogin() {
    setError('');
    setBusy(true);
    try {
      await signIn(email, password);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
      {/* Brand */}
      <View className="items-center mb-6">
        <View className="w-14 h-14 rounded-2xl bg-primary items-center justify-center mb-3">
          <Ambulance size={28} color="#ffffff" />
        </View>
        <Text className="text-ink font-black text-2xl tracking-tight">
          Trafficore
        </Text>
        <Text className="text-muted text-sm mt-1">
          Emergency response, Uber-style.
        </Text>
      </View>

      {/* Form card */}
      <View className="bg-[#f6f6f6] border border-border rounded-3xl p-5 gap-4">
        <View>
          <Text className="text-muted text-[11px] font-extrabold tracking-widest mb-2">
            EMAIL
          </Text>
          <TextInput
            className="h-14 rounded-2xl bg-[#f0f0f0] border border-border px-4 text-ink text-base"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="driver@trafficore.local"
            placeholderTextColor="#6b7280"
          />
        </View>
        <View>
          <Text className="text-muted text-[11px] font-extrabold tracking-widest mb-2">
            PASSWORD
          </Text>
          <TextInput
            className="h-14 rounded-2xl bg-[#f0f0f0] border border-border px-4 text-ink text-base"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#6b7280"
            onSubmitEditing={onLogin}
          />
        </View>

        {error ? (
          <View className="rounded-2xl border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-4 py-3">
            <Text className="text-[#ff6b6b] text-sm font-bold">{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          className={`h-14 rounded-full bg-primary items-center justify-center ${busy ? 'opacity-60' : ''}`}
          onPress={onLogin}
          disabled={busy}
          activeOpacity={0.8}
        >
          {busy ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="font-black text-base" style={{ color: '#ffffff' }}>
              Log In →
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="mt-5 rounded-full border border-border px-4 py-3 items-center"
        onPress={() => {
          setEmail(DEMO_DRIVER.email);
          setPassword(DEMO_DRIVER.password);
        }}
      >
        <Text className="text-muted text-xs font-bold">
          ⚡ Tap to fill demo login
        </Text>
      </TouchableOpacity>

      <Text
        className="text-muted text-[11px] text-center tracking-[1.5px] font-semibold mt-6 mb-2"
        onPress={() => router.push('/landing')}
      >
        T R A F F I C O R E   D A S H B O A R D S
      </Text>
    </ScrollView>
  );
}
