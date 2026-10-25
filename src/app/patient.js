import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Check } from 'lucide-react-native';
import { CONTENT_BOX } from '../../lib/theme';
import { setLivePatient, setLivePos } from '../../lib/dummy';
import { useDriverLocation } from '../../hooks/useLocation';

const conditions = ['Cardiac', 'Trauma', 'Respiratory', 'Stroke', 'Neuro', 'Other'];
const severities = [
  { id: 'critical', label: 'CRITICAL', on: 'text-[#ff3b30] border-[#eeb3ae] bg-[#fff0ef]' },
  { id: 'high', label: 'HIGH', on: 'text-[#c9860a] border-[#f0e0b0] bg-[#fff8e6]' },
  { id: 'medium', label: 'MEDIUM', on: 'text-accent border-[#c9e8d6] bg-[#eefbf2]' },
];

// Driver side: fill in patient details before/during transport (dummy store).
export default function PatientForm() {
  const router = useRouter();
  const { location } = useDriverLocation();
  const [saved, setSaved] = useState(false);
  const [f, setF] = useState({
    name: '',
    age: '',
    gender: 'M',
    condition: '',
    severity: 'high',
    pickup: '',
    contact: '',
    notes: '',
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const valid = f.name.trim() && f.age.trim() && f.condition && f.pickup.trim();

  useEffect(() => {
    if (location?.coords) setLivePos(location.coords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.coords?.latitude, location?.coords?.longitude]);

  function save() {
    setLivePatient({
      ...f,
      age: Number(f.age) || 0,
      amb: 'AMB-07',
    });
    setSaved(true);
    setTimeout(() => {
      if (router.canGoBack()) router.back();
      else router.replace('/index');
    }, 900);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20, ...CONTENT_BOX }}>
        <Pressable onPress={() => router.back()} className="flex-row items-center gap-1 mb-5">
          <ChevronLeft size={16} color="#6b7280" />
          <Text className="text-xs text-muted font-semibold">SIGNAL &amp; STATUS</Text>
        </Pressable>

        <Text className="text-3xl font-black tracking-tight text-ink mb-1">Patient Details</Text>
        <Text className="text-[13px] text-muted mb-6">
          Shared instantly with hospital intake when submitted.
        </Text>

        <Field label="FULL NAME" value={f.name} onChangeText={(v) => set('name', v)} placeholder="e.g. Suresh Naik" />
        <View className="flex-row gap-3">
          <View style={{ width: 110 }}>
            <Field label="AGE" value={f.age} onChangeText={(v) => set('age', v.replace(/[^0-9]/g, ''))} placeholder="58" keyboardType="number-pad" />
          </View>
          <View className="flex-1">
            <Text className="text-[10px] tracking-[1.5px] text-muted font-semibold mb-1.5">GENDER</Text>
            <View className="flex-row gap-2">
              {['M', 'F', 'O'].map((g) => (
                <Chip key={g} label={g === 'M' ? 'MALE' : g === 'F' ? 'FEMALE' : 'OTHER'} on={f.gender === g}
                  onCls="text-primary border-primary bg-primary/10" offCls="text-muted border-border" onPress={() => set('gender', g)} />
              ))}
            </View>
          </View>
        </View>

        <Text className="text-[10px] tracking-[1.5px] text-muted font-semibold mb-1.5 mt-1">PRIMARY CONDITION</Text>
        <View className="flex-row flex-wrap gap-2 mb-1">
          {conditions.map((c) => (
            <Chip key={c} label={c.toUpperCase()} on={f.condition === c}
              onCls="text-primary border-primary bg-primary/10" offCls="text-muted border-border" onPress={() => set('condition', c)} />
          ))}
        </View>

        <Text className="text-[10px] tracking-[1.5px] text-muted font-semibold mb-1.5 mt-1">SEVERITY</Text>
        <View className="flex-row gap-2 mb-1">
          {severities.map((s) => (
            <Chip key={s.id} label={s.label} on={f.severity === s.id} onCls={s.on} offCls="text-muted border-border" onPress={() => set('severity', s.id)} />
          ))}
        </View>

        <Field label="PICKUP LOCATION" value={f.pickup} onChangeText={(v) => set('pickup', v)} placeholder="e.g. MG Road Metro Gate 2" />
        <Field label="RELATIVE CONTACT" value={f.contact} onChangeText={(v) => set('contact', v)} placeholder="+91 98450 11241" keyboardType="phone-pad" />
        <Field label="CREW NOTES" value={f.notes} onChangeText={(v) => set('notes', v)} placeholder="Vitals, meds given, splint info…" multiline />

        <Pressable
          disabled={!valid || saved}
          onPress={save}
          className="h-16 rounded-full items-center justify-center mt-5 mb-8 flex-row gap-2"
          style={{ backgroundColor: valid ? '#141414' : '#e4e4e6' }}
        >
          {saved && <Check size={18} color="#06c167" />}
          <Text className="font-black text-base tracking-widest" style={{ color: valid ? '#ffffff' : '#9ca3af' }}>
            {saved ? 'SHARED WITH HOSPITAL' : 'SUBMIT PATIENT DETAILS'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, ...props }) {
  return (
    <View className="mb-4">
      <Text className="text-[10px] tracking-[1.5px] text-muted font-semibold mb-1.5">{label}</Text>
      <TextInput
        {...props}
        className="min-h-[46px] rounded-xl border border-border px-4 py-2.5 text-[15px] text-ink bg-white"
        placeholderTextColor="#9ca3af"
      />
    </View>
  );
}

function Chip({ label, on, onCls, offCls, ...props }) {
  return (
    <Pressable
      {...props}
      className={`rounded-full border px-3.5 py-2 ${on ? onCls : offCls}`}
    >
      <Text className={`text-[11px] font-bold ${on ? onCls.split(' ')[0] : offCls.split(' ')[0]}`}>{label}</Text>
    </Pressable>
  );
}
