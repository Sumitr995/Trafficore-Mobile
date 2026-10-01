import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

// Single place for all GPS logic.
// High accuracy + update every ~3s / 5m (matches M1 spec).
export function useDriverLocation() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ok | denied | error
  const [errorMsg, setErrorMsg] = useState('');

  async function startWatching() {
    try {
      setStatus('loading');
      setErrorMsg('');

      const { status: perm } =
        await Location.requestForegroundPermissionsAsync();
      if (perm !== 'granted') {
        setStatus('denied');
        setErrorMsg('Location permission denied. Enable it in phone Settings.');
        return;
      }

      // 1) Fast first fix so map centers immediately
      const first = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(first);
      setStatus('ok');

      // 2) Live updates every ~3s or 5m
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        (loc) => {
          setLocation(loc);
          setStatus('ok');
        }
      );
    } catch (e) {
      setStatus('error');
      setErrorMsg(e?.message || 'Could not get GPS fix.');
    }
  }

  useEffect(() => {
    let alive = true;
    if (alive) startWatching();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { location, status, errorMsg, retry: startWatching };
}
