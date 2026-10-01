import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'trafficore_driver_session';

// Seed ONE demo driver (local only, no backend yet)
export const DEMO_DRIVER = {
  email: 'driver@trafficore.local',
  password: 'trafficore123',
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { email, at } or null
  const [loading, setLoading] = useState(true);

  // Load saved session on boot
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (raw) setUser(JSON.parse(raw));
      } catch {
        // corrupt storage -> start logged out, never crash
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function signIn(email, password) {
    const e = (email || '').trim().toLowerCase();
    const p = password || '';
    if (e === DEMO_DRIVER.email && p === DEMO_DRIVER.password) {
      const session = { email: e, at: new Date().toISOString() };
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
      return session;
    }
    throw new Error('Invalid email or password.');
  }

  async function signOut() {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
