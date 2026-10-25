// MQTT over WebSocket for the driver app. Broker comes from EXPO_PUBLIC_MQTT_WS;
// default points at the legacy LAN Pi from the old Trafficore rig (1883/9001 split).
// Publish-only today: state/positions/corridor events. No consumers subscribed yet.
import Paho from 'paho-mqtt';
import { KEYS, BROKER } from './keys';

let client = null;
let connecting = null;
const listeners = new Set();

export function onMqttStatus(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function emit(status) {
  for (const cb of listeners) cb(status);
}

function getClient() {
  if (!KEYS.linked) return null; // demo mode: nothing publishes, nothing connects
  if (client) return client;
  if (!KEYS.mqttUrl) return null;
    try {
      client = new Paho.Client(
        BROKER.host,
        BROKER.port,
        'trfx-' + Math.random().toString(36).slice(2, 10)
      );
      client.onConnectionLost = () => emit('reconnecting');
    } catch (e) {
    client = null;
    emit('error');
  }
  return client;
}

// Resolves the client once connected; never throws — callers treat MQTT as
// best-effort so the app works with no broker on the network.
export async function ensureMqtt() {
  const c = getClient();
  if (!c) return null;
  if (c.isConnected()) return c;
  if (connecting) return connecting;
  connecting = new Promise((resolve, reject) => {
    c.connect({
      onSuccess: () => {
        connecting = null;
        emit('online');
        resolve(c);
      },
      onFailure: () => {
        connecting = null;
        emit('error');
        reject(new Error('mqtt connect failed'));
      },
      keepAliveInterval: 30,
      timeout: 8,
      reconnect: true,
    });
  }).catch(() => null);
  return connecting;
}

// Fire-and-forget publish. Returns false (never throws) when offline.
export function publishMqtt(topic, payload, { retain = false } = {}) {
  const c = getClient();
  if (!c || !c.isConnected()) return false;
  try {
    const msg = new Paho.Message(
      typeof payload === 'string' ? payload : JSON.stringify(payload)
    );
    msg.destinationName = topic;
    msg.retained = retain;
    c.send(msg);
    return true;
  } catch (e) {
    return false;
  }
}
