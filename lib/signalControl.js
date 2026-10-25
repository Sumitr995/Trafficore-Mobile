// SIGNAL CONTROL CONTRACT — hardware plugs in here, nowhere else.
// triggerGreenCorridor({intersectionId, ambulanceId}) → {ok, via, at}
// releaseCorridor({intersectionId, ambulanceId})     → {ok, via, at}
// MODE: MQTT publish (broker from EXPO_PUBLIC_MQTT_WS; silent no-op offline).
// Wire: publish-only. Corridor requests go to the new contract topic, AND to
// the legacy `trafficore/ambulance` topic when the caller supplies legacyPath —
// the old ESP32 rig speaks {path(A-D), direction, reset} and has no ack
// channel, so nothing here waits for a reply
// (see GOAT/trafficore-OG/resources/PROTOCOLS.md). When the acknowledged real
// controller exists, replace ONLY the bodies and keep shapes identical.
import { publishMqtt } from './mqtt';
import { Alert } from 'react-native';
import { KEYS } from './keys';

function stamp(via) {
  return { ok: true, via, at: new Date().toISOString() };
}

export async function triggerGreenCorridor({ intersectionId, ambulanceId, legacyPath, legacyDirection = 'STRAIGHT' }) {
  publishMqtt('trafficore/corridor/request', {
    action: 'request',
    intersectionId,
    ambulanceId,
    ts: Date.now(),
  });
  // Legacy hardware bridge: the old rig subscribers sit on this topic.
  if (legacyPath) {
    publishMqtt('trafficore/ambulance', { path: legacyPath, direction: legacyDirection });
  }
  // Demo mode (no broker): in-app feedback so the button still feels alive.
  if (!KEYS.linked) {
    Alert.alert('Signal requested (demo)', `Intersection ${intersectionId}`);
  }
  return stamp(KEYS.linked ? 'mqtt' : 'mock');
}

export async function releaseCorridor({ intersectionId, ambulanceId }) {
  publishMqtt('trafficore/corridor/request', {
    action: 'release',
    intersectionId,
    ambulanceId,
    ts: Date.now(),
  });
  // Legacy rig: reset means back to normal cycle; there is no per-side release.
  publishMqtt('trafficore/ambulance', { reset: true });
  if (!KEYS.linked) {
    Alert.alert('Corridor released (demo)', `Intersection ${intersectionId}`);
  }
  return stamp(KEYS.linked ? 'mqtt' : 'mock');
}
