import AsyncStorage from '@react-native-async-storage/async-storage';

// Append-only trip log (newest first, capped at 50) so the driver can
// look back at completed runs. Demo DUMMY_REQUEST means history is also
// demo data until Phase 1 dispatch replaces it.
const KEY = 'trafficore.tripHistory.v1';

export function summarize(trip, hospital) {
  return {
    id: trip.tripId,
    patient: trip.patient,
    pickup: trip.pickup,
    severity: trip.severity,
    mode: trip.mode,
    distanceKm: trip.distanceKm,
    acceptedAt: trip.acceptedAt || null,
    pickedUpAt: trip.pickedUpAt || null,
    arrivedAt: trip.arrivedAt || null,
    hospital: hospital?.name || null,
  };
}

export async function loadHistory() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveTrip(record) {
  const list = await loadHistory();
  const next = [record, ...list].slice(0, 50);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
