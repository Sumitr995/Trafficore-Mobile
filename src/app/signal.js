import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft, Radio, ShieldCheck, Clock3, FilePlus2, Check,
} from 'lucide-react-native';
import { CONTENT_BOX } from '../../lib/theme';
import { corridorSignals, setLivePos } from '../../lib/dummy';
import { useDriverLocation } from '../../hooks/useLocation';

// Ambulance side: signal access permission (dummy — request → granted).
export default function SignalAccess() {
  const router = useRouter();
  const { location } = useDriverLocation();
  const [phase, setPhase] = useState('idle'); // idle → pending → granted
  const [log, setLog] = useState([
    { signal: 'Anil Kumble Circle', act: 'PASSED', at: '09:38:41' },
  ]);

  useEffect(() => {
    if (location?.coords) setLivePos(location.coords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.coords?.latitude, location?.coords?.longitude]);

  useEffect(() => {
    if (phase !== 'pending') return;
    const t = setTimeout(() => {
      setPhase('granted');
      setLog((l) => [{ signal: 'Corridor request', act: 'GRANTED', at: now() }, ...l]);
    }, 1500);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, ...CONTENT_BOX }}
    >
      <Pressable onPress={() => router.back()} className="flex-row items-center gap-1 mb-5">
        <ChevronLeft size={16} color="#6b7280" />
        <Text className="text-xs text-muted font-semibold">DRIVER HOME</Text>
      </Pressable>

      <Text className="text-3xl font-black tracking-tight text-ink mb-1">Signal Access</Text>
      <Text className="text-[13px] text-muted mb-6">
        Ask admin to hold corridor signals green along your route.
      </Text>

      <View className="rounded-xl border border-border p-5 mb-4">
        <View className="flex-row items-center gap-2 mb-3">
          <Radio size={14} color={phase === 'granted' ? '#06c167' : '#6b7280'} />
          <Text className="text-[11px] tracking-[1.5px] text-muted font-semibold">
            CORRIDOR · MG ROAD → MANIPAL HOSPITAL
          </Text>
        </View>
        {corridorSignals.map((s, k) => {
          const col = s.state === 'green' ? '#06c167' : s.state === 'amber' ? '#f5a623' : '#ff3b30';
          return (
            <View key={s.id} className={`flex-row items-center justify-between py-2.5 border-t border-border ${k > 0 ? '' : ''}`}>
              <View className="flex-row items-center gap-2.5 flex-1">
                <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col }} />
                <View className="flex-1">
                  <Text className="text-[13px] font-medium text-ink">{s.name}</Text>
                  <Text className="text-[11px] text-muted">{s.id}</Text>
                </View>
              </View>
              {phase === 'granted' ? (
                <View className="px-2.5 py-1 rounded-full bg-[#eefbf2] border border-[#c9e8d6]">
                  <Text className="text-[10px] font-black text-accent">GREEN HOLD</Text>
                </View>
              ) : phase === 'pending' ? (
                <View className="px-2.5 py-1 rounded-full bg-[#fff8e6] border border-[#f0e0b0]">
                  <Text className="text-[10px] font-black text-[#c9860a]">REQUESTED</Text>
                </View>
              ) : (
                <View className="px-2.5 py-1 rounded-full bg-[#f6f6f6] border border-border">
                  <Text className="text-[10px] font-black text-muted">{s.state.toUpperCase()}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <Pressable
        disabled={phase !== 'idle'}
        onPress={() => {
          setPhase('pending');
          setLog((l) => [{ signal: 'Corridor request', act: 'REQUESTED', at: now() }, ...l]);
        }}
        className="h-16 rounded-full items-center justify-center mb-6 mt-2"
        style={{
          backgroundColor: phase === 'pending' ? '#f6f6f6' : '#141414',
          opacity: phase === 'pending' ? 0.8 : 1,
        }}
      >
        <Text
          className="font-black text-base tracking-widest"
          style={{ color: phase === 'pending' ? '#9ca3af' : '#ffffff' }}
        >
          {phase === 'idle' ? 'REQUEST SIGNAL CORRIDOR' : phase === 'pending' ? 'WAITING FOR ADMIN…' : 'CORRIDOR GRANTED'}
        </Text>
      </Pressable>

      <View className="rounded-xl border border-border p-4 mb-4">
        <Text className="text-[13px] font-semibold text-ink mb-3">ACCESS LOG</Text>
        {log.map((l, i) => (
          <View key={i} className="flex-row items-center gap-2.5 py-2.5 border-t border-border">
            {l.act === 'GRANTED' ? <ShieldCheck size={13} color="#06c167" /> : l.act === 'PASSED' ? <Check size={13} color="#06c167" /> : <Clock3 size={13} color="#f5a623" />}
            <Text className="text-[11px] font-mono text-muted">{l.at}</Text>
            <Text className="text-[12px] text-ink flex-1">{l.signal}</Text>
            <Text className={`text-[10px] font-black px-2 py-0.5 rounded ${l.act === 'REQUESTED' ? 'text-[#c9860a] bg-[#fff8e6]' : 'text-accent bg-[#eefbf2]'}`}>
              {l.act}
            </Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => router.push('/patient')}
        className="flex-row items-center justify-between rounded-full border border-primary/40 bg-primary/10 px-5 py-3.5 mb-6"
      >
        <View className="flex-row items-center gap-2">
          <FilePlus2 size={16} color="#06c167" />
          <Text className="text-sm font-black text-primary">PATIENT DETAILS FORM</Text>
        </View>
        <Text className="text-xs font-extrabold text-muted">OPEN →</Text>
      </Pressable>
    </ScrollView>
  );
}

function now() {
  return new Date().toLocaleTimeString('en-IN', { hour12: false });
}
