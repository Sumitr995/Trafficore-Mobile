import { createContext, useContext, useRef, useState } from 'react';
import { ensureMqtt, publishMqtt } from './mqtt';
import { saveTrip, summarize } from './history';

// Dummy emergency (M5 spec: dummy pickup data for now — self-start only,
// no dispatcher server exists yet; later this becomes a local caselist/API)
const DUMMY_REQUEST = {
  id: 'EMG-1024',
  patient: 'Ravi Kumar',
  phone: '+91 98XXX XXXXX',
  pickup: 'Connaught Place, Block G, New Delhi',
  pickupNote: 'Near gate 3, bystander with patient',
  distanceKm: 2.4,
  etaMin: 7,
  severity: 'CRITICAL',
};

// MQTT state names per Context/OFFICE-HOURS topic contract:
// idle | trajecting (en route to patient) | transporting | arrived
function mqttStateName(status) {
  return (
    {
      accepted: 'trajecting',
      picked_up: 'transporting',
      arrived: 'arrived',
      idle: 'idle',
    }[status] || status
  );
}

function newTripId() {
  return 'TRP-' + Date.now().toString(36).toUpperCase();
}

const TripContext = createContext(null);

export function TripProvider({ children }) {
  const [online, setOnline] = useState(false);
  const [status, setStatus] = useState('offline'); // offline|idle|incoming|accepted|picked_up|arrived
  const [request, setRequest] = useState(null);
  const [trip, setTrip] = useState(null); // {…request, mode, tripId, acceptedAt, pickedUpAt, arrivedAt}
  const [hospital, setHospital] = useState(null); // {id,name,address,latitude,longitude,distM}
  const lastPosPub = useRef(0);
  const tripIdRef = useRef(null);

  function pushState(nextStatus, fields = {}) {
    const id = tripIdRef.current;
    if (!id) return;
    publishMqtt(
      `trafficore/trip/${id}/state`,
      { status: mqttStateName(nextStatus), mode: trip?.mode, hospitalId: hospital?.id, ...fields, ts: Date.now() },
      { retain: true }
    );
  }

  async function goOnline() {
    setOnline(true);
    setStatus('idle');
    await ensureMqtt();
  }

  function goOffline() {
    publishMqtt(
      `trafficore/trip/${tripIdRef.current || 'unknown'}/state`,
      { status: 'offline', ts: Date.now() },
      { retain: true }
    );
    setOnline(false);
    setStatus('offline');
    setRequest(null);
    setTrip(null);
    setHospital(null);
    tripIdRef.current = null;
  }

  // Driver self-starts a case Uber-style: see the card, then accept it.
  function takeCase() {
    if (!DUMMY_REQUEST) return;
    setRequest({ ...DUMMY_REQUEST });
    setStatus('incoming');
  }

  function accept() {
    const r = request;
    if (!r) return;
    const id = newTripId();
    tripIdRef.current = id;
    const next = { ...r, tripId: id, mode: 'pickup', acceptedAt: new Date().toISOString() };
    setRequest(null);
    setTrip(next);
    setStatus('accepted');
    publishMqtt(
      `trafficore/trip/${id}/state`,
      { status: 'trajecting', mode: 'pickup', tripId: id, ts: Date.now() },
      { retain: true }
    );
  }

  function decline() {
    setRequest(null);
    setStatus('idle');
  }

  // Mode 2: patient already onboard, trip starts at the transport leg.
  function startTransport() {
    const id = newTripId();
    tripIdRef.current = id;
    setTrip({
      ...DUMMY_REQUEST,
      tripId: id,
      mode: 'transport',
      pickup: 'Patient onboard (direct transport)',
      acceptedAt: new Date().toISOString(),
      pickedUpAt: new Date().toISOString(),
    });
    setStatus('picked_up');
    publishMqtt(
      `trafficore/trip/${id}/state`,
      { status: 'transporting', mode: 'transport', tripId: id, ts: Date.now() },
      { retain: true }
    );
    setHospital(null);
  }

  function pickedUp() {
    setTrip((t) => ({ ...t, pickedUpAt: new Date().toISOString() }));
    setStatus('picked_up');
    pushState('picked_up');
  }

  function arrived() {
    const at = new Date().toISOString();
    setTrip((t) => ({ ...t, arrivedAt: at }));
    setStatus('arrived');
    pushState('arrived');
    // log the completed run; never blocks the UI
    saveTrip(summarize({ ...trip, arrivedAt: at }, hospital)).catch(() => {});
  }

  function chooseHospital(h) {
    setHospital(h);
    publishMqtt(
      `trafficore/trip/${tripIdRef.current}/hospital`,
      { hospitalId: h?.id, name: h?.name, lat: h?.latitude, lon: h?.longitude, etaMin: h?.etaMin, ts: Date.now() },
      { retain: true }
    );
  }

  // Live GPS: throttled to ~2s (corridor ETA needs fresher than the 3s GPS tick).
  function publishPosition(coords) {
    const id = tripIdRef.current;
    const live = status === 'accepted' || status === 'picked_up';
    if (!id || !live || !coords) return;
    const now = Date.now();
    if (now - lastPosPub.current < 2000) return;
    lastPosPub.current = now;
    publishMqtt(`trafficore/trip/${id}/position`, {
      lat: coords.latitude,
      lon: coords.longitude,
      ts: now,
    });
  }

  function resetToIdle() {
    tripIdRef.current = null;
    setTrip(null);
    setHospital(null);
    setStatus('idle');
  }

  return (
    <TripContext.Provider
      value={{
        online,
        status,
        request,
        trip,
        hospital,
        setHospital: chooseHospital,
        goOnline,
        goOffline,
        takeCase,
        startTransport,
        accept,
        decline,
        pickedUp,
        arrived,
        publishPosition,
        resetToIdle,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used inside <TripProvider>');
  return ctx;
}
