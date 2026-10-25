import { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LayoutDashboard, Building2, Ambulance, ChevronRight } from 'lucide-react-native';
import { CONTENT_BOX } from '../../lib/theme';

const navItems = [
  { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { id: 'incidents', label: 'Incidents', Icon: Ambulance },
  { id: 'users', label: 'Users & Roles', Icon: Building2 },
];

const stats = [
  { label: 'Active Ambulances', value: '24', delta: '+3' },
  { label: 'Hospitals Online', value: '12', delta: '0' },
  { label: 'Active Incidents', value: '7', delta: '+2' },
  { label: 'Avg Response Time', value: '4.2m', delta: '-0.3m' },
];

const incidents = [
  { id: 'INC-001', type: 'Cardiac Arrest', location: 'MG Road, Bengaluru', ambulance: 'AMB-07', hospital: 'Apollo', status: 'En Route', time: '2m ago', priority: 'critical' },
  { id: 'INC-002', type: 'Road Accident', location: 'Andheri West, Mumbai', ambulance: 'AMB-12', hospital: 'Lilavati', status: 'On Scene', time: '8m ago', priority: 'high' },
  { id: 'INC-003', type: 'Respiratory', location: 'Sector 18, Noida', ambulance: 'AMB-03', hospital: 'Max Health', status: 'Transporting', time: '15m ago', priority: 'medium' },
  { id: 'INC-004', type: 'Fall Injury', location: 'Connaught Place, Delhi', ambulance: 'AMB-19', hospital: 'AIIMS', status: 'Arrived', time: '22m ago', priority: 'low' },
];

const users = [
  { name: 'City Hospital Mumbai', role: 'hospital', status: 'active' },
  { name: 'AMB Driver - Ramesh K.', role: 'ambulance', status: 'active' },
  { name: 'Apollo Delhi', role: 'hospital', status: 'inactive' },
  { name: 'AMB Driver - Sunil M.', role: 'ambulance', status: 'active' },
];

const dot = {
  critical: 'bg-[#ff3b30]',
  high: 'bg-[#f5a623]',
  medium: 'bg-[#f5a623]',
  low: 'bg-[#d1d1d6]',
};

const statusDot = {
  'En Route': 'bg-[#f5a623]',
  'On Scene': 'bg-[#4a90d9]',
  Transporting: 'bg-[#a86ee8]',
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, ...CONTENT_BOX }}>
      <View className="mb-6">
        <Text className="text-[10px] tracking-[2px] text-muted font-semibold">ADMIN CONSOLE</Text>
      </View>
      <View className="flex-row gap-2 mb-8">
        {navItems.map(({ id, label, Icon }) => (
          <Pressable
            key={id}
            onPress={() => setActiveTab(id)}
            className={`flex-row items-center gap-2 rounded-full px-4 py-2.5 border ${
              activeTab === id ? 'bg-primary border-primary' : 'border-border'
            }`}
          >
            <Icon size={15} color={activeTab === id ? '#ffffff' : '#6b7280'} />
            <Text className={`text-xs font-semibold ${activeTab === id ? 'text-white' : 'text-muted'}`}>
              {label.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'overview' && (
        <View>
          <View className="flex-row flex-wrap gap-3">
            {stats.map((s) => (
              <View key={s.label} className="rounded-xl border border-border p-4" style={{ grow: 1, minWidth: '45%' }}>
                <Text className="text-[11px] tracking-[1.5px] text-muted font-semibold mb-2">{s.label.toUpperCase()}</Text>
                <View className="flex-row items-end justify-between">
                  <Text className="text-2xl font-bold text-ink">{s.value}</Text>
                  <Text className="text-[13px] text-muted">{s.delta}</Text>
                </View>
              </View>
            ))}
          </View>

          <View className="rounded-xl border border-border p-4 mt-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[13px] font-semibold text-ink">RECENT INCIDENTS</Text>
              <Pressable onPress={() => setActiveTab('incidents')}>
                <Text className="text-accent text-xs underline">View all</Text>
              </Pressable>
            </View>
            <IncidentList rows={incidents.slice(0, 3)} />
          </View>
        </View>
      )}

      {activeTab === 'incidents' && (
        <View>
          <Text className="text-3xl font-bold tracking-tight text-ink mb-6">Active Incidents</Text>
          <View className="rounded-xl border border-border p-4">
            <IncidentList rows={incidents} />
          </View>
        </View>
      )}

      {activeTab === 'users' && (
        <View>
          <Text className="text-3xl font-bold tracking-tight text-ink mb-6">Users & Role Management</Text>
          <View className="rounded-xl border border-border p-4 mb-4">
            <Text className="text-[13px] font-semibold text-ink mb-4">REGISTERED USERS</Text>
            {users.map((u, i) => (
              <View key={i} className="flex-row items-center justify-between py-3 border-t border-border">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-8 h-8 rounded-full bg-[#f6f6f6] items-center justify-center">
                    <Text className="text-xs font-bold text-ink">{u.name[0]}</Text>
                  </View>
                  <View>
                    <Text className="text-sm font-medium text-ink">{u.name}</Text>
                    <Text className="text-xs text-muted capitalize">{u.role}</Text>
                  </View>
                </View>
                <View className={`w-2 h-2 rounded-full mr-2 ${u.status === 'active' ? 'bg-accent' : 'bg-[#d1d1d6]'}`} />
              </View>
            ))}
          </View>
          <View className="rounded-xl border border-border bg-[#f6f6f6] p-4">
            <Text className="text-sm font-semibold text-ink mb-3">HOW ROLES WORK</Text>
            <Text className="text-xs text-muted leading-5">
              admin sees this console · hospital manages beds and intake · ambulance runs the emergency flow.
            </Text>
          </View>
        </View>
      )}

      <View className="flex-row flex-wrap gap-3 mt-8 mb-4">
        <Pressable
          onPress={() => router.push('/hospital')}
          className="flex-row items-center justify-between self-start rounded-full bg-primary px-5 py-3.5"
        >
          <Text className="text-sm font-semibold text-white">Open Hospital Dashboard</Text>
          <ChevronRight size={16} color="#ffffff" />
        </Pressable>
        <Pressable
          onPress={() => router.push('/landing')}
          className="flex-row items-center justify-between self-start rounded-full border border-border px-5 py-3.5"
        >
          <Text className="text-sm font-semibold text-ink">Trafficore Landing</Text>
          <ChevronRight size={16} color="#6b7280" />
        </Pressable>
      </View>
    </ScrollView>
  );
}

function IncidentList({ rows }) {
  return (
    <View>
      {rows.map((inc, k) => (
        <View key={inc.id} className={`py-3.5 ${k > 0 ? 'border-t border-border' : ''}`}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text className="text-[11px] px-2 py-0.5 rounded font-mono font-medium text-muted bg-[#f6f6f6]">
                {inc.priority.toUpperCase()}
              </Text>
              <View className={`w-1.5 h-1.5 rounded-full ${dot[inc.priority]}`} />
            </View>
            <Text className="text-xs text-muted">{inc.time}</Text>
          </View>
          <Text className="text-sm font-semibold text-ink mt-1.5">{inc.type}</Text>
          <Text className="text-xs text-muted mt-0.5">
            {inc.location} · {inc.ambulance} → {inc.hospital}
          </Text>
          <View className="flex-row items-center gap-2 mt-1.5">
            <View className={`w-1.5 h-1.5 rounded-full ${statusDot[inc.status] || 'bg-accent'}`} />
            <Text className="text-xs text-ink">{inc.status}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
