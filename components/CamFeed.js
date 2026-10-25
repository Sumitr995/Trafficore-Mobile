import { useState } from 'react';
import { Image, Pressable, View, Text } from 'react-native';

// Dummy live camera feed — picsum placeholder frames, switchable cams.
export default function CamFeed({ cams, title = 'LIVE CAM', style }) {
  const [cam, setCam] = useState(0);
  const [burst, setBurst] = useState(0); // re-roll image for "frame updates"
  const active = cams[cam];

  return (
    <View style={[{ overflow: 'hidden', borderRadius: 12, backgroundColor: '#101010' }, style]}>
      <View className="w-full aspect-[16/10] bg-[#151515]">
        <Image
          source={{ uri: `https://picsum.photos/seed/${active.id}/${960}/${600}?x=${burst}` }}
          className="w-full h-full opacity-90"
          resizeMode="cover"
        />
        <View className="absolute top-2 left-2 flex-row items-center gap-1.5 bg-black/60 rounded-full px-2.5 py-1">
          <View className="w-1.5 h-1.5 rounded-full bg-[#ff3b30]" />
          <Text className="text-white text-[10px] font-black tracking-widest">{title}</Text>
        </View>
        <View className="absolute bottom-2 left-2 bg-black/60 rounded px-2 py-0.5">
          <Text className="text-white text-[10px] font-bold">{active.label}</Text>
        </View>
        <View className="absolute bottom-2 right-2 bg-black/60 rounded px-2 py-0.5">
          <Text className="text-[#06c167] text-[10px] font-black">4G RT · 640×480</Text>
        </View>
      </View>
      {cams.length > 1 && (
        <View className="flex-row gap-2 p-2 bg-[#0d0d0d]">
          {cams.map((c, i) => (
            <Pressable
              key={c.id}
              onPress={() => {
                setCam(i);
                setBurst((b) => b + 1);
              }}
              className={`flex-1 rounded-lg border py-2 items-center ${
                i === cam ? 'border-[#06c167] bg-[#06c167]/10' : 'border-white/10 bg-white/5'
              }`}
            >
              <Text className={`text-[10px] font-bold tracking-wider ${i === cam ? 'text-[#06c167]' : 'text-white/60'}`}>
                {c.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
