import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useDriverLocation } from '../hooks/useLocation';
import { COLORS } from '../lib/theme';
import { KEYS } from '../lib/keys';

function makeHtml(lat, lon, key) {
  return `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>html,body,#map{height:100%;margin:0;background:#101010}
.you-pill{background:#00d992;color:#101010;font-weight:900;font-size:13px;padding:6px 12px;border-radius:20px;border:2px solid #fff;font-family:sans-serif;white-space:nowrap}
.dest-pill{background:#ff6b6b;color:#101010;font-weight:900;font-size:12px;padding:5px 10px;border-radius:16px;border:2px solid #fff;font-family:sans-serif;white-space:nowrap}
.leaflet-container{background:#101010}</style></head>
<body><div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var map=L.map('map',{zoomControl:false,attributionControl:true}).setView([${lat},${lon}],16);
L.tileLayer('https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${key}',{maxZoom:19,attribution:'© OpenStreetMap © CARTO'}).addTo(map);
var you=L.marker([${lat},${lon}],{icon:L.divIcon({className:'',html:'<div class="you-pill">YOU</div>',iconSize:[60,34],iconAnchor:[30,17]})}).addTo(map);
var routeLine=null,destMark=null;
window.updatePos=function(la,lo,f){you.setLatLng([la,lo]);if(f){map.panTo([la,lo]);}};
window.recenter=function(){map.flyTo(you.getLatLng(),16);};
window.setDest=function(la,lo,label){if(destMark){map.removeLayer(destMark);}destMark=L.marker([la,lo],{icon:L.divIcon({className:'',html:'<div class="dest-pill">'+label+'</div>',iconSize:[90,30],iconAnchor:[45,15]})}).addTo(map);};
window.setRoute=function(pts){if(routeLine){map.removeLayer(routeLine);}routeLine=L.polyline(pts,{color:'#00d992',weight:5,opacity:0.95}).addTo(map);map.fitBounds(routeLine.getBounds().pad(0.3));};
</script></body></html>`;
}

// Free OSM map via WebView — no Google key, no Play Services, no config.
// Props: destination {latitude,longitude,label}, routePoints [[lat,lon]…],
// follow (pan on GPS), compact (trip-card height, no banner).
export default function DriverMap({
  bannerExtra = null,
  compact = false,
  bare = false,
  showFab = null, // null = auto (hide when bare)
  destination = null,
  routePoints = null,
  follow = false,
}) {
  const { location, status, errorMsg, retry } = useDriverLocation();
  const webRef = useRef(null);
  const [ready, setReady] = useState(false);

  const coords = location?.coords
    ? { latitude: location.coords.latitude, longitude: location.coords.longitude }
    : null;

  const firstRef = useRef(null);
  if (coords && !firstRef.current) firstRef.current = coords;
  const start = firstRef.current || coords;

  const html = useMemo(
    () => (start ? makeHtml(start.latitude, start.longitude, KEYS.carto) : ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [!!start]
  );

  // Live GPS → marker (+ pan when following)
  useEffect(() => {
    if (coords && ready && webRef.current) {
      webRef.current.injectJavaScript(
        `window.updatePos(${coords.latitude},${coords.longitude},${follow ? 1 : 0});true;`
      );
    }
  }, [coords?.latitude, coords?.longitude, ready, follow]);

  // Destination pin
  useEffect(() => {
    if (destination && ready && webRef.current) {
      webRef.current.injectJavaScript(
        `window.setDest(${destination.latitude},${destination.longitude},'${destination.label || 'PICKUP'}');true;`
      );
    }
  }, [destination?.latitude, destination?.longitude, ready]);

  // Green route polyline
  useEffect(() => {
    if (routePoints?.length && ready && webRef.current) {
      webRef.current.injectJavaScript(
        `window.setRoute(${JSON.stringify(routePoints)});true;`
      );
    }
  }, [ready, routePoints?.length]);

  function centerOnMe() {
    webRef.current?.injectJavaScript(`window.recenter();true;`);
  }

  const fabVisible = showFab ?? !bare;

  if (!coords) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>TRAFFICORE DRIVER</Text>
        <Text style={styles.muted}>
          {status === 'denied' || status === 'error'
            ? errorMsg
            : 'Waiting for GPS fix… (go outside / enable Location)'}
        </Text>
        {(status === 'denied' || status === 'error') && (
          <TouchableOpacity style={styles.btn} onPress={retry}>
            <Text style={styles.btnText}>Retry GPS</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, compact && !bare && styles.compactBox]}>
      <WebView
        ref={webRef}
        style={styles.map}
        source={{ html }}
        onLoadEnd={() => setReady(true)}
      />
      {!compact && (
        <View style={styles.banner}>
          <Text style={styles.title}>TRAFFICORE DRIVER • OSM</Text>
          <Text style={styles.muted}>
            {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
          </Text>
          {bannerExtra}
        </View>
      )}
      {!bare && <Text style={styles.credit}>© OpenStreetMap © CARTO</Text>}
      {fabVisible && (
        <TouchableOpacity style={styles.fab} onPress={centerOnMe}>
          <Text style={styles.btnText}>◎</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  compactBox: {
    height: 300,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  center: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  map: { flex: 1, backgroundColor: COLORS.background },
  banner: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  title: { color: COLORS.primary, fontWeight: '800', fontSize: 16 },
  muted: { color: COLORS.muted, fontSize: 13 },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  btnText: { color: '#101010', fontWeight: '800' },
  credit: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    color: COLORS.muted,
    fontSize: 10,
  },
});
