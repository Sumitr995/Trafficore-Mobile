import { createContext, useContext, useRef, useState } from 'react';

// Dummy emergency (M5 spec: dummy pickup data for now)
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

const TripContext = createContext(null);

export function TripProvider({ children }) {
  const [online, setOnline] = useState(false);
  const [status, setStatus] = useState('offline'); // offline|idle|incoming|accepted|picked_up|arrived
  const [request, setRequest] = useState(null);
  const [trip, setTrip] = useState(null); // {…request, acceptedAt, pickedUpAt, arrivedAt}
  const timer = useRef(null);

  function goOnline() {
    setOnline(true);
    setStatus('idle');
    // Simulate dispatch after 2.5s like Uber
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setRequest(DUMMY_REQUEST);
      setStatus('incoming');
    }, 2500);
  }

  function goOffline() {
    clearTimeout(timer.current);
    setOnline(false);
    setStatus('offline');
    setRequest(null);
    setTrip(null);
  }

  function accept() {
    setTrip({ ...request, acceptedAt: new Date().toISOString() });
    setRequest(null);
    setStatus('accepted');
  }

  function decline() {
    setRequest(null);
    setStatus('idle');
  }

  function pickedUp() {
    setTrip((t) => ({ ...t, pickedUpAt: new Date().toISOString() }));
    setStatus('picked_up');
  }

  function arrived() {
    setTrip((t) => ({ ...t, arrivedAt: new Date().toISOString() }));
    setStatus('arrived');
  }

  function resetToIdle() {
    setTrip(null);
    setStatus('idle');
  }

  return (
    <TripContext.Provider
      value={{
        online,
        status,
        request,
        trip,
        goOnline,
        goOffline,
        accept,
        decline,
        pickedUp,
        arrived,
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
