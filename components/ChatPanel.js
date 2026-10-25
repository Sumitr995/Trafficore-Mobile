import { useRef, useState } from 'react';
import { Pressable, TextInput, View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { SendHorizontal } from 'lucide-react-native';

// Nurse ↔ ambulance chat panel (dummy replies keep the demo alive).
export default function ChatPanel({ seed, peer = 'AMBULANCE CREW', self = 'HOSPITAL' }) {
  const [msgs, setMsgs] = useState(seed);
  const [draft, setDraft] = useState('');

  const ambReplies = [
    'Copy that.',
    'Victim stable now, continuing escort.',
    'Signal corridor accepted, moving through.',
    'Arriving in 3 minutes, bay ready.',
  ];
  const replyIdx = useRef(0);

  function send() {
    const text = draft.trim();
    if (!text) return;
    setMsgs((m) => [...m, { from: 'hosp', text, t: now() }]);
    setDraft('');
    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        { from: 'amb', text: ambReplies[replyIdx.current % ambReplies.length], t: now() },
      ]);
      replyIdx.current += 1;
    }, 1200);
  }

  const t = now();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="rounded-xl border border-border overflow-hidden">
        <View className="flex-row items-center gap-2 bg-[#f6f6f6] px-3 py-2.5 border-b border-border">
          <View className="w-1.5 h-1.5 rounded-full bg-accent" />
          <Text className="text-[11px] font-bold tracking-[1.5px] text-muted">
            {peer} CHAT
          </Text>
        </View>

        <View className="px-3 py-3 gap-2" style={{ minHeight: 240 }}>
          {msgs.map((m, i) => (
            <View
              key={i}
              className={m.from === 'hosp' ? 'items-end' : 'items-start'}
            >
              <View
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 ${
                  m.from === 'hosp' ? 'bg-primary' : 'bg-[#f0f0f2]'
                }`}
              >
                <Text className={`text-[13px] leading-4 ${m.from === 'hosp' ? 'text-white' : 'text-ink'}`}>
                  {m.text}
                </Text>
                <Text className={`text-[9px] mt-1 ${m.from === 'hosp' ? 'text-white/60' : 'text-muted'}`}>
                  {m.t}
                </Text>
              </View>
            </View>
          ))}
          <Text className="text-[9px] text-center text-muted tracking-widest">{t}</Text>
        </View>

        <View className="flex-row items-center gap-2 border-t border-border p-2">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message ambulance crew…"
            placeholderTextColor="#9ca3af"
            className="flex-1 h-11 rounded-full border border-border px-4 text-[13px] text-ink"
            onSubmitEditing={send}
          />
          <Pressable
            onPress={send}
            className="w-11 h-11 rounded-full bg-primary items-center justify-center"
          >
            <SendHorizontal size={16} color="#ffffff" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function now() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
