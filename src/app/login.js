import { useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Redirect } from 'expo-router';
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
    <View className="flex-1 bg-background px-6 justify-center">
      {/* Brand */}
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-3xl bg-primary items-center justify-center mb-4">
          <Ambulance size={38} color="#101010" />
        </View>
        <Text className="text-ink font-black text-3xl tracking-tight">
          Trafficore
        </Text>
        <Text className="text-primary font-extrabold text-sm tracking-[3px] mt-1">
          DRIVER
        </Text>
        <Text className="text-muted text-sm mt-2">
          Emergency response, Uber-style.
        </Text>
      </View>

      {/* Form card */}
      <View className="bg-[#161616] border border-border rounded-3xl p-5 gap-4">
        <View>
          <Text className="text-muted text-[11px] font-extrabold tracking-widest mb-2">
            EMAIL
          </Text>
          <TextInput
            className="h-14 rounded-2xl bg-[#1f1f1f] border border-border px-4 text-ink text-base"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="driver@trafficore.local"
            placeholderTextColor="#8b949e"
          />
        </View>
        <View>
          <Text className="text-muted text-[11px] font-extrabold tracking-widest mb-2">
            PASSWORD
          </Text>
          <TextInput
            className="h-14 rounded-2xl bg-[#1f1f1f] border border-border px-4 text-ink text-base"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#8b949e"
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
            <ActivityIndicator color="#101010" />
          ) : (
            <Text className="font-black text-base" style={{ color: '#101010' }}>
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
    </View>
  );
}
