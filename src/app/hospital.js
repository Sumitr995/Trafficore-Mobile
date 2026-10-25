import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import {
  Zap, ChevronRight, ChevronLeft, Video, Navigation, Radio, Check,
} from 'lucide-react-native';
import { CONTENT_BOX } from '../../lib/theme';
import { KEYS } from '../../lib/keys';
import CamFeed from '../../components/CamFeed';
import ChatPanel from '../../components/ChatPanel';
import {
  ambulances, corridorSignals, camRooms, chatSeed, patientOf, onLiveChange,
} from '../../lib/dummy';

const beds = [
  { ward: 'ICU', total: 20, occupied: 17, available: 3 },
  { ward: 'Emergency', total: 30, occupied: 22, available: 8 },
  { ward: 'General', total: 80, occupied: 61, available: 19 },
  { ward: 'Pediatric', total: 25, occupied: 14, available: 11 },
];

const recentAdmissions = [
  { name: 'Rajesh Kumar', age: 45, condition: 'Fracture', ward: 'General', time: '10 min ago', status: 'Stable' },
  { name: 'Priya Sharma', age: 29, condition: 'Appendicitis', ward: 'Emergency', time: '35 min ago', status: 'In Surgery' },
  { name: 'Arun Mehta', age: 67, condition: 'Hypertension', ward: 'ICU', time: '1h ago', status: 'Critical' },
];

const barColor = (pct) => (pct > 90 ? '#ff3b30' : pct > 70 ? '#f5a623' : '#06c167');

export default function Hospital() {
  const [activeTab, setActiveTab] = useState('patient');
  const [selectedId, setSelectedId] = useState('AMB-07');
  // eslint-disable-next-line no-unused-vars
  const [force, setForce] = useState(0);

  useEffect(() => onLiveChange(() => setForce((f) => f + 1)), []);

  const amb = ambulances.find((a) => a.id === selectedId);
  const patient = amb ? patientOf(amb.id, amb.patient) : null;

  const totalBeds = beds.reduce((a, b) => a + b.total, 0);
  const totalOccupied = beds.reduce((a, b) => a + b.occupied, 0);
  const totalAvailable = totalBeds - totalOccupied;
  const occupancyPct = Math.round((totalOccupied / totalBeds) * 100);

  const tabs = ['patient', 'incoming', 'overview', 'admissions'];

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, ...CONTENT_BOX }}>
      <View className="mb-6 flex-row items-center justify-between">
        <Text className="text-[10px] tracking-[2px] text-muted font-semibold">HOSPITAL CONSOLE</Text>
        <Pressable onPress={() => router.push('/admin')} className="flex-row items-center gap-1">
          <Text className="text-[10px] tracking-[1.5px] text-muted font-semibold">ADMIN CONSOLE</Text>
          <ChevronRight size={12} color="#6b7280" />
        </Pressable>
      </View>
      <View className="flex-row gap-2 mb-8 flex-wrap">
        {tabs.map((id) => (
          <Pressable
            key={id}
            onPress={() => setActiveTab(id)}
            className={`rounded-full px-4 py-2.5 border ${activeTab === id ? 'bg-primary border-primary' : 'border-border'}`}
          >
            <Text className={`text-xs font-semibold ${activeTab === id ? 'text-white' : 'text-muted'}`}>
              {id.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── SELECTED AMBULANCE: PATIENT + CAMERA + ROUTE + CHAT ──── */}
      {activeTab === 'patient' && amb && (
        <View>
          <View className="flex-row flex-wrap gap-4">
            {/* LEFT · patient + camera */}
            <View style={{ grow: 1, minWidth: 300 }} className="gap-4">
              <View className="flex-row items-center gap-2">
                <Pressable onPress={() => setActiveTab('incoming')} className="flex-row items-center gap-1">
                  <ChevronLeft size={16} color="#6b7280" />
                  <Text className="text-xs text-muted font-semibold">ALL INCOMING</Text>
                </Pressable>
                <View className="flex-1" />
                <Text className="text-[10px] font-bold tracking-wider text-muted bg-[#f6f6f6] px-2 py-0.5 rounded">
                  {amb.id} · {amb.status.toUpperCase()} · ETA {amb.eta}
                </Text>
              </View>

              <View className="rounded-xl border border-border p-4">
                <View className="flex-row items-center gap-3 mb-2">
                  <View className="w-12 h-12 rounded-full bg-primary items-center justify-center">
                    <Text className="text-white text-lg font-black">{patient.name[0]}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-black text-ink">{patient.name}</Text>
                    <Text className="text-[12px] text-muted">
                      {patient.gender === 'M' ? 'Male' : 'Female'}, {patient.age} yrs · SEVERITY {patient.severity.toUpperCase()}
                    </Text>
                  </View>
                  <View className={`w-2.5 h-2.5 rounded-full ${patient.severity === 'critical' ? 'bg-[#ff3b30]' : 'bg-[#f5a623]'}`} />
                </View>
                <PRow label="CONDITION" value={patient.condition} />
                <PRow label="PICKUP" value={patient.pickup} />
                <PRow label="CONTACT" value={patient.contact} />
                <PRow label="DESTINATION" value="Manipal Hospital · Resus Bay 2" />
                <PRow label="CREW NOTES" value={patient.notes} />
                <View className="flex-row gap-2 mt-3">
                  {['Critical', 'ER', 'Cardiac'].map((t) => (
                    <View key={t} className="px-2 py-1 rounded bg-[#4a90d9]/10 border border-[#b7d4f2]">
                      <Text className="text-[10px] font-bold text-[#2c6fb5]">{t.toUpperCase()}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View>
                <View className="flex-row items-center gap-2 mb-2">
                  <Video size={13} color="#ff3b30" />
                  <Text className="text-[11px] tracking-[1.5px] text-muted font-semibold">
                    AMBULANCE CAMERA FEED
                  </Text>
                </View>
                <CamFeed cams={camRooms[amb.id]} stream={KEYS.camUrl} title="PATIENT BAY" style={{ maxWidth: 420 }} />
              </View>
            </View>

            {/* RIGHT · route detail + chat */}
            <View style={{ grow: 1, minWidth: 320 }} className="gap-4">
              <View className="rounded-xl border border-border p-4">
                <View className="flex-row items-center gap-2 mb-3">
                  <Navigation size={13} color="#0b58c7" />
                  <Text className="text-[13px] font-semibold text-ink">ROUTE TO HOSPITAL</Text>
                </View>
                <View className="mb-3">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Text className="text-[11px] text-muted">{amb.status === 'On Scene' ? 'AT PICKUP' : 'EN ROUTE'}</Text>
                    <Text className="text-[11px] font-bold text-accent">{amb.progress}% · ETA {amb.eta}</Text>
                  </View>
                  <View className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                    <View className="h-full rounded-full bg-accent" style={{ width: `${amb.progress}%` }} />
                  </View>
                </View>
                {corridorSignals.map((s, k) => {
                  const crossed = amb.progress > (k + 1) * 16;
                  return (
                    <View key={s.id} className={`flex-row items-center gap-2.5 py-2.5 ${k > 0 ? 'border-t border-border' : ''}`}>
                      <View
                        className="items-center justify-center"
                        style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: crossed ? '#eefbf2' : '#f6f6f6' }}
                      >
                        {crossed ? <Check size={12} color="#06c167" /> : <Radio size={12} color="#9ca3af" />}
                      </View>
                      <View className="flex-1">
                        <Text className="text-[13px] font-medium text-ink">{s.name}</Text>
                        <Text className="text-[11px] text-muted">{s.id} · phase {s.state.toUpperCase()}</Text>
                      </View>
                      <View className={`px-2 py-0.5 rounded-full border ${
                        amb.grant === 'granted' ? 'border-[#c9e8d6] bg-[#eefbf2]' : 'border-border'
                      }`}>
                        <Text className={`text-[10px] font-bold ${
                          amb.grant === 'granted' ? 'text-accent' : 'text-muted'
                        }`}>
                          {amb.grant === 'granted' ? 'GREEN HOLD' : 'NO PRIORITY'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              <ChatPanel seed={chatSeed} peer="AMBULANCE CREW" />
            </View>
          </View>
        </View>
      )}

      {/* ── INCOMING LIST ───────────────────────────────────────── */}
      {activeTab === 'incoming' && (
        <View className="gap-y-3">
          <Text className="text-[11px] tracking-[1.5px] text-muted font-semibold mb-2">
            INBOUND AMBULANCES · TAP FOR CONTROL ROOM VIEW
          </Text>
          {ambulances.map((a) => (
            <Pressable
              key={a.id}
              onPress={() => { setSelectedId(a.id); setActiveTab('patient'); }}
              className={`rounded-xl border p-4 flex-row items-center justify-between ${
                a.patient.severity === 'critical' ? 'border-[#eeb3ae] bg-[#fff5f4]' : 'border-border'
              }`}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View className={`w-10 h-10 rounded-lg items-center justify-center ${a.patient.severity === 'critical' ? 'bg-[#fff0ef]' : 'bg-[#f6f6f6]'}`}>
                  <Zap size={20} color={a.patient.severity === 'critical' ? '#ff3b30' : '#f5a623'} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[15px] font-bold text-ink">{a.id}</Text>
                    <Text className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                      a.patient.severity === 'critical' ? 'border-[#eeb3ae] text-[#ff3b30]' : 'border-border text-muted'
                    }`}>
                      {a.patient.severity.toUpperCase()}
                    </Text>
                  </View>
                  <Text className="text-[13px] text-muted mt-0.5">
                    {a.driver} · Patient {a.patient.name}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-2xl font-bold text-accent tracking-tight">{a.eta}</Text>
                <Text className="text-[10px] tracking-[1px] text-muted font-semibold">TO ARRIVAL</Text>
              </View>
              <ChevronRight size={16} color="#6b7280" style={{ marginLeft: 8 }} />
            </Pressable>
          ))}
        </View>
      )}

      {activeTab === 'overview' && (
        <View>
          <View className="flex-row flex-wrap gap-3">
            {[
              { label: 'Total Beds', value: totalBeds },
              { label: 'Occupied', value: totalOccupied },
              { label: 'Available', value: totalAvailable },
              { label: 'Occupancy', value: `${occupancyPct}%` },
            ].map((c) => (
              <View key={c.label} className="rounded-xl border border-border p-4" style={{ grow: 1, minWidth: '45%' }}>
                <Text className="text-[11px] tracking-[1.5px] text-muted font-semibold mb-2">{c.label.toUpperCase()}</Text>
                <Text className={`text-3xl font-bold tracking-tight ${c.label === 'Available' ? 'text-accent' : 'text-ink'}`}>
                  {c.value}
                </Text>
              </View>
            ))}
          </View>
          <View className="rounded-xl border border-border p-4 mt-6">
            <View className="flex-row items-center gap-2 mb-4">
              <View className="w-1.5 h-1.5 rounded-full bg-accent" />
              <Text className="text-[13px] font-semibold text-ink">WARD CAPACITY</Text>
            </View>
            <View className="gap-y-4">
              {beds.map((ward) => {
                const pct = Math.round((ward.occupied / ward.total) * 100);
                return (
                  <View key={ward.ward}>
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text className="text-[13px] font-medium text-ink">{ward.ward}</Text>
                      <Text className="text-[11px] text-muted">
                        {ward.available} Free / {ward.total} Total
                      </Text>
                    </View>
                    <View className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                      <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor(pct) }} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}

      {activeTab === 'admissions' && (
        <View>
          <Text className="text-[11px] tracking-[1.5px] text-muted font-semibold mb-4">PATIENT REGISTRY (DEMO)</Text>
          <View className="rounded-xl border border-border p-4">
            {recentAdmissions.map((p, i) => (
              <View key={i} className={`py-3.5 ${i > 0 ? 'border-t border-border' : ''}`}>
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-sm font-semibold text-ink">{p.name}</Text>
                    <Text className="text-[11px] text-muted">AGE {p.age} · {p.condition}</Text>
                  </View>
                  <Text className="text-[11px] text-muted">{p.time}</Text>
                </View>
                <View className="flex-row items-center gap-2 mt-2">
                  <Text className="text-[10px] border border-border text-ink px-2 py-0.5 rounded font-bold">
                    {p.ward.toUpperCase()}
                  </Text>
                  <Text
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      p.status === 'Critical'
                        ? 'border-[#eeb3ae] text-[#ff3b30] bg-[#fff0ef]'
                        : p.status === 'In Surgery'
                          ? 'border-[#dccdee] text-[#7b4bbf] bg-[#f7f2fc]'
                          : 'border-[#c9e8d6] text-accent bg-[#eefbf2]'
                    }`}
                  >
                    {p.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function PRow({ label, value }) {
  return (
    <View className="py-2 border-t border-border mt-1.5 flex-row items-start gap-2">
      <Text className="text-[10px] tracking-[1.5px] text-muted font-semibold" style={{ width: 92, marginTop: 2 }}>{label}</Text>
      <Text className="text-[13px] text-ink leading-4 flex-1">{value}</Text>
    </View>
  );
}
