import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS, TILE_URL } from '../lib/theme';
import { KEYS } from '../lib/keys';

function makeHtml([centLat, centLon]) {
  return `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>html,body,#map{height:100%;margin:0;background:#fff}
.amb{background:${COLORS.primary};color:#fff;font:700 12px sans-serif;padding:6px 10px;border-radius:18px;border:2px solid #fff;white-space:nowrap}
.amb.sel{background:${COLORS.accent}}
.hosp{background:#0b58c7;color:#fff;font-weight:900;font-size:11px;padding:5px 9px;border-radius:14px;border:2px solid #fff;font-family:sans-serif;white-space:nowrap}
.pk{background:#ff6b6b;color:#fff;font-weight:900;font-size:10px;padding:3px 8px;border-radius:12px;border:2px solid #fff;font-family:sans-serif;white-space:nowrap}
.sig{width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.35)}
.ambic{display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer}
.bub{width:40px;height:40px;border-radius:50%;background:#fff;border:2px solid #e4e4e6;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.ambic.sel .bub{border-color:#06c167;box-shadow:0 0 0 3px rgba(6,193,103,.25)}
.lbl{font:700 10px sans-serif;background:#141414;color:#fff;padding:2px 8px;border-radius:9px;border:2px solid #fff;white-space:nowrap}
.ambic.sel .lbl{background:#06c167}</style></head>
<body><div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var map=L.map('map',{zoomControl:false}).setView([${centLat},${centLon}],14);
L.tileLayer('${TILE_URL}?key=${KEYS.carto}',{maxZoom:19,attribution:'© OpenStreetMap © CARTO'}).addTo(map);
var g=L.layerGroup();map.addLayer(g);
function emit(o){var s=JSON.stringify(o);
  if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(s);}
  else{window.parent.postMessage(s,'*');}}
window.setData=function(d){g.clearLayers();
  var AMB='<svg viewBox="0 0 36 24" width="24" height="16">'+
   '<path d="M3 8 Q3 5 6 5 H20 L25 10 H32 Q34 10 34 12.5 V16 Q34 18 32 18 H30 A4.2 4.2 0 0 0 22 18 H15 A4.2 4.2 0 0 0 7 18 H5 Q3 18 3 16 Z" fill="#141414"/>'+
   '<path d="M20.5 6.5 24.5 10 H20.5 Z" fill="#cfe3ff"/>'+
   '<rect x="9" y="8.5" width="7.5" height="7.5" rx="1" fill="#ffffff"/>'+
   '<path d="M12.75 9.7v4.6M10.45 12h4.6" stroke="#ff3b30" stroke-width="1.6" stroke-linecap="round"/>'+
   '<circle cx="11" cy="18.2" r="2.3" fill="#fff" stroke="#141414" stroke-width="1.8"/>'+
   '<circle cx="26" cy="18.2" r="2.3" fill="#fff" stroke="#141414" stroke-width="1.8"/></svg>';
  d.ambulances.forEach(function(a){L.polyline(a.route,(a.id===d.selected)?{color:'#06c167',weight:5,opacity:.95}:{color:'#c7c7cc',weight:2,opacity:.55}).addTo(g);});
  d.signals.forEach(function(s){var c=s.state==='green'?'#06c167':(s.state==='amber'?'#f5a623':'#ff3b30');
    var m=L.marker([s.lat,s.lon],{icon:L.divIcon({className:'',html:'<div class="sig" style="background:'+c+'"></div>',iconSize:[14,14],iconAnchor:[7,7]})});
    m.on('click',function(){emit({trfx:'signal',id:s.id});});m.addTo(g);});
  if(d.patient)L.marker([d.patient[0],d.patient[1]],{icon:L.divIcon({className:'',html:'<div class="pk">PICKUP</div>',iconSize:[56,20],iconAnchor:[28,10]}),interactive:false}).addTo(g);
  L.marker([d.hospital.lat,d.hospital.lon],{icon:L.divIcon({className:'',html:'<div class="hosp">'+d.hospital.name+'</div>',iconSize:[80,22],iconAnchor:[40,11]}),interactive:false}).addTo(g);
  var moved=false;
  d.ambulances.forEach(function(a){var html='<div class="ambic'+(a.id===d.selected?' sel':'')+'"><span class="bub">'+AMB+'</span><span class="lbl">'+a.id+'</span></div>';
    var m=L.marker([a.position[0],a.position[1]],{icon:L.divIcon({className:'',html:html,iconSize:[80,64],iconAnchor:[40,26]}),zIndexOffset:a.id===d.selected?900:400});
    m.on('click',function(){emit({trfx:'amb',id:a.id});});m.addTo(g);
    if(a.id===d.selected){map.flyTo([a.position[0],a.position[1]],14);moved=true;}});
  if(!moved)map.fitBounds(L.latLngBounds(d.ambulances.map(function(a){return a.position;})).pad(0.25));
};
// Structured message bridge (no eval): only {trfx:'setData', data} is applied.
window.addEventListener('message',function(e){try{var o=JSON.parse(e.data);
  if(o&&o.trfx==='setData')window.setData(o.data);}catch(_){}});
</script></body></html>`;
}

// Dummy corridor map: ambulance pills + route lines + traffic lights.
// Clicking an ambulance or signal calls back via onSelect({trfx, id}).
export default function CorridorMap({
  ambulances,
  signals,
  hospital,
  patient, // [lat, lon]
  selected, // ambulance id or null
  onSelect,
  style,
  height = 320,
}) {
  const frameRef = useRef(null);
  const webRef = useRef(null);
  const [ready, setReady] = useState(false);

  const html = useMemo(
    () => makeHtml(hospital ? [hospital.lat, hospital.lon] : [12.95, 77.59]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hospital?.id]
  );

  // Events out (marker click → selection).
  function handleEvent(e) {
    try {
      const o = typeof e === 'object' && e.nativeEvent ? JSON.parse(e.nativeEvent.data) : JSON.parse(e.data);
      if (o?.trfx) onSelect?.(o);
    } catch (_) {}
  }
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const fn = (e) => handleEvent(e);
    window.addEventListener('message', fn);
    return () => window.removeEventListener('message', fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSelect]);

  // Data in — full picture on every change (dummy scale, cheap).
  useEffect(() => {
    if (!ready) return;
    const data = { trfx: 'setData', data: { ambulances, signals, hospital, patient, selected } };
    if (Platform.OS === 'web') {
      frameRef.current?.contentWindow?.postMessage(JSON.stringify(data), '*');
    } else {
      webRef.current?.injectJavaScript(
        `window.setData(${JSON.stringify(data.data)});true;`
      );
    }
  }, [ready, ambulances, selected, signals, hospital, patient]);

  return (
    <View style={[styles.box, style, { height }]}>
      {Platform.OS === 'web' ? (
        <iframe
          ref={frameRef}
          srcDoc={html}
          onLoad={() => setReady(true)}
          style={{ border: 0, width: '100%', height: '100%', backgroundColor: '#fff' }}
          title="Corridor map"
        />
      ) : (
        <WebView
          ref={webRef}
          style={StyleSheet.absoluteFill}
          source={{ html }}
          onLoadEnd={() => setReady(true)}
          onMessage={handleEvent}
        />
      )}
      <View style={styles.legend}>
        <Text style={styles.legendText}>🟢 open · 🟡 advisory · 🔴 hold</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  legend: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    backgroundColor: 'rgba(255,255,255,.9)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  legendText: { fontSize: 10, color: COLORS.muted },
});
