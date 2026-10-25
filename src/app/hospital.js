import { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Zap, ChevronRight } from 'lucide-react-native';
import { CONTENT_BOX } from '../../lib/theme';

const beds = [
  { ward: 'ICU', total: 20, occupied: 17, available: 3 },
  { ward: 'Emergency', total: 30, occupied: 22, available: 8 },
  { ward: 'General', total: 80, occupied: 61, available: 19 },
  { ward: 'Pediatric', total: 25, occupied: 14, available: 11 },
];

const incomingAmbulances = [
  { id: 'AMB-07', eta: '3 min', patient: 'Male, 58', condition: 'Cardiac Arrest', priority: 'critical' },
  { id: 'AMB-12', eta: '8 min', patient: 'Female, 34', condition: 'Road Accident', priority: 'high' },
  { id: 'AMB-22', eta: '14 min', patient: 'Male, 72', condition: 'Stroke', priority: 'high' },
];

const recentAdmissions = [
  { name: 'Rajesh Kumar', age: 45, condition: 'Fracture', ward: 'General', time: '10 min ago', status: 'Stable' },
  { name: 'Priya Sharma', age: 29, condition: 'Appendicitis', ward: 'Emergency', time: '35 min ago', status: 'In Surgery' },
  { name: 'Arun Mehta', age: 67, condition: 'Hypertension', ward: 'ICU', time: '1h ago', status: 'Critical' },
];

const tabs = ['overview', 'incoming', 'admissions'];

const barColor = (pct) => (pct > 90 ? '#ff3b30' : pct > 70 ? '#f5a623' : '#06c167');

export default function Hospital() {
  const [activeTab, setActiveTab] = useState('overview');

  const totalBeds = beds.reduce((a, b) => a + b.total, 0);
  const totalOccupied = beds.reduce((a, b) => a + b.occupied, 0);
  const totalAvailable = totalBeds - totalOccupied;
  const occupancyPct = Math.round((totalOccupied / totalBeds) * 100);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, ...CONTENT_BOX }}>
      <View className="mb-8">
        <Text className="text-[10px] tracking-[2px] text-muted font-semibold">HOSPITAL CONSOLE</Text>
      </View>
      <View className="flex-row gap-2 mb-8">
        {tabs.map((id) => (
          <Pressable
            key={id}
            onPress={() => setActiveTab(id)}
            className={`rounded-full px-4 py-2.5 border ${activeTab === id ? 'bg-primary border-primary' : 'border-border'}`}
          >
            <Text className={`text-xs font-semibold ${activeTab === id ? 'text-white' : 'text-muted'}`}>
              {id === 'incoming' ? 'INCOMING' : id.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

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

          <Pressable
            onPress={() => setActiveTab('incoming')}
            className="mt-4 rounded-xl border border-border p-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-2 h-2 rounded-full bg-accent" />
              <Text className="text-sm font-semibold text-accent tracking-tight">
                {incomingAmbulances.length} AMBULANCES INBOUND
              </Text>
            </View>
            <ChevronRight size={16} color="#06c167" />
          </Pressable>
        </View>
      )}

      {activeTab === 'incoming' && (
        <View className="gap-y-3">
          <Text className="text-[11px] tracking-[1.5px] text-muted font-semibold mb-2">REAL-TIME TRAFFIC (DEMO)</Text>
          {incomingAmbulances.map((amb) => (
            <View
              key={amb.id}
              className={`rounded-xl border p-4 flex-row items-center justify-between ${
                amb.priority === 'critical' ? 'border-[#eeb3ae] bg-[#fff5f4]' : 'border-border'
              }`}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View className={`w-10 h-10 rounded-lg items-center justify-center ${amb.priority === 'critical' ? 'bg-[#fff0ef]' : 'bg-[#f6f6f6]'}`}>
                  <Zap size={20} color={amb.priority === 'critical' ? '#ff3b30' : '#f5a623'} />
                </View>
                <View>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[15px] font-bold text-ink">{amb.id}</Text>
                    <Text className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                      amb.priority === 'critical' ? 'border-[#eeb3ae] text-[#ff3b30]' : 'border-border text-muted'
                    }`}>
                      {amb.priority.toUpperCase()}
                    </Text>
                  </View>
                  <Text className="text-[13px] text-muted mt-0.5">
                    {amb.patient} · {amb.condition}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-2xl font-bold text-accent tracking-tight">{amb.eta}</Text>
                <Text className="text-[10px] tracking-[1px] text-muted font-semibold">TO ARRIVAL</Text>
              </View>
            </View>
          ))}
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

      <Pressable
        onPress={() => router.push('/admin')}
        className="flex-row items-center justify-between self-start rounded-full border border-border px-5 py-3.5 mt-8 mb-4"
      >
        <Text className="text-sm font-semibold text-ink">Open Admin Dashboard</Text>
        <ChevronRight size={16} color="#6b7280" />
      </Pressable>
    </ScrollView>
  );
}
