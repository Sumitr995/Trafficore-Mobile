import { useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';

function streamHtml(url) {
  return `<!DOCTYPE html>
<html><head><style>
html,body{margin:0;height:100%;background:#000;overflow:hidden}
video{width:100%;height:100%;object-fit:cover}
</style>
<script src="https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js"></script></head>
<body><video id="v" autoplay muted playsinline loop></video>
<script>
var url='${url}';
var v=document.getElementById('v');
if(Hls&&Hls.isSupported()){var h=new Hls();h.loadSource(url);h.attachMedia(v);
  h.on(Hls.Events.ERROR,function(_,d){if(d.fatal&&window.ReactNativeWebView){window.ReactNativeWebView.postMessage('cam:err');}});}
else{v.src=url;v.onerror=function(){if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage('cam:err');};}
var sent=false;
setInterval(function(){var on=v.readyState>=2;
  if(!on)document.title='CONNECTING';else document.title='LIVE';
  if(sent&&on)return;sent=on;
  if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage('cam:'+(on?'on':'off'));}
  else{window.parent.postMessage(JSON.stringify({trfx:'cam',on:on}),'*');}
},1200);
document.addEventListener('visibilitychange',function(){if(!document.hidden&&v.readyState>=1)v.play().catch(function(){});});
</script></body></html>`;
}

function Overlay({ label, severity }) {
  return (
    <View
      pointerEvents="none"
      className="absolute top-2 left-2 flex-row items-center gap-1.5 bg-black/60 rounded-full px-2.5 py-1"
    >
      <View
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: severity === 'live' ? '#ff3b30' : '#9ca3af' }}
      />
      <Text className="text-white text-[10px] font-black tracking-widest">{label}</Text>
    </View>
  );
}

// Camera feed: real RPi HLS stream when a URL is given (hls.js in a frame,
// status bridged out), with SIGNAL LOST fallback + retry; dummy placeholder
// frames otherwise.
export default function CamFeed({ cams, title = 'LIVE CAM', stream, style }) {
  const [mode] = useState(stream ? 'stream' : 'dummy');
  const [cam, setCam] = useState(0);
  const [burst, setBurst] = useState(0);
  const [status, setStatus] = useState('connecting'); // connecting | live | lost
  const timerRef = useRef(null);
  const active = cams?.[cam];
  const frameRef = useRef(null);
  const webRef = useRef(null);
  const [ready, setReady] = useState(false);

  // Status bridge (web) — native keeps a 8s watchdog then flags lost.
  useEffect(() => {
    if (mode !== 'stream') return;
    function handleEvent(e) {
      try {
        const o = typeof e === 'object' && e.nativeEvent ? JSON.parse(e.nativeEvent.data) : JSON.parse(e.data);
        if (o?.trfx === 'cam') {
          setStatus((prev) => (prev === 'lost' ? 'lost' : o.on ? 'live' : 'connecting'));
        }
      } catch (_) {}
    }
    if (Platform.OS === 'web') {
      window.addEventListener('message', handleEvent);
      return () => window.removeEventListener('message', handleEvent);
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== 'stream') return;
    const t = setTimeout(() => {
      setStatus('connecting');
      if (Platform.OS !== 'web') return;
      const doc = frameRef.current?.contentDocument || frameRef.current?.contentWindow?.document;
      const on = doc?.title === 'LIVE' || doc?.getElementById('v')?.readyState >= 2;
      setStatus(on ? 'live' : 'lost');
    }, 8000);
    timerRef.current = t;
    return () => clearTimeout(t);
  }, [mode, stream, burst, ready]);

  function retry() {
    setStatus('connecting');
    setReady(false);
    setBurst((b) => b + 1);
  }

  if (mode === 'stream') {
    const html = Platform.OS === 'web' ? streamHtml(stream) : streamHtml(stream + (stream.includes('?') ? '&' : '?') + 'w=' + burst);
    return (
      <View style={[{ overflow: 'hidden', borderRadius: 12, backgroundColor: '#000' }, style]}>
        <View className="w-full aspect-[16/9] bg-black">
          {Platform.OS === 'web' ? (
            <iframe
              key={burst}
              ref={frameRef}
              srcDoc={html}
              onLoad={() => setReady(true)}
              style={{ border: 0, width: '100%', height: '100%' }}
              title="RPi live camera"
            />
          ) : (
            <WebView
              key={burst}
              ref={webRef}
              source={{ html }}
              style={{}}
              setSupportMultipleWindows={false}
              onMessage={(e) => {
                if (e.nativeEvent.data === 'cam:err') setStatus('lost');
                else if (e.nativeEvent.data === 'cam:on') setStatus('live');
              }}
              onLoadEnd={() => setReady(true)}
            />
          )}
        </View>
        <View className="absolute top-2 left-2 flex-row items-center gap-1.5 bg-black/60 rounded-full px-2.5 py-1">
          <View
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: status === 'live' ? '#ff3b30' : '#9ca3af' }}
          />
          <Text className="text-white text-[10px] font-black tracking-widest">
            {status === 'live' ? 'LIVE CAM' : status === 'lost' ? 'SIGNAL LOST' : 'CONNECTING…'}
          </Text>
        </View>
        <View className="absolute bottom-2 left-2 bg-black/60 rounded px-2 py-0.5">
          <Text className="text-white text-[10px] font-bold">{title}</Text>
        </View>
        {status === 'lost' && (
          <View className="absolute inset-0 items-center justify-center bg-black/70">
            <Text className="text-white text-[12px] font-bold mb-3">
              RPi STREAM NOT REACHABLE
            </Text>
            <Text className="text-white/60 text-[10px] mb-3">http://192.168.0.175:8000/hls_stream/stream.m3u8</Text>
            <Pressable onPress={retry} className="rounded-full bg-[#06c167] px-4 py-2">
              <Text className="text-[11px] font-black text-white tracking-wider">RETRY</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  // Dummy placeholder frames (demo mode, stream unset)
  return (
    <View style={[{ overflow: 'hidden', borderRadius: 12, backgroundColor: '#101010' }, style]}>
      <View className="w-full aspect-[16/10] bg-[#151515]">
        <Image
          source={{ uri: `https://picsum.photos/seed/${active.id}/${960}/${600}?x=${burst}` }}
          className="w-full h-full opacity-90"
          resizeMode="cover"
        />
        <Overlay label={title} severity="live" />
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
