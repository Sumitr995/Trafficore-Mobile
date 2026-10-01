// SIGNAL CONTROL CONTRACT — hardware plugs in here, nowhere else.
// triggerGreenCorridor({intersectionId, ambulanceId}) → {ok, via, at}
// releaseCorridor({intersectionId, ambulanceId})     → {ok, via, at}
// MODE: MOCK. Real signal POSITIONS come from OSM (lib/signals.js), but no
// app can flip a physical light without the city's traffic controller
// integration — when that exists, replace ONLY the bodies below and keep
// the signatures + return shape identical.
import { Alert } from 'react-native';

function stamp(via) {
  return { ok: true, via, at: new Date().toISOString() };
}

export async function triggerGreenCorridor({ intersectionId, ambulanceId }) {
  const res = stamp('mock');
  console.log('[signal:MOCK] green requested', { intersectionId, ambulanceId });
  Alert.alert('Signal requested (MOCK — hardware later)', `Signal ${intersectionId}`);
  return res;
}

export async function releaseCorridor({ intersectionId, ambulanceId }) {
  const res = stamp('mock');
  console.log('[signal:MOCK] corridor released', { intersectionId, ambulanceId });
  return res;
}
