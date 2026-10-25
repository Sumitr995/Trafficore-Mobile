// Phase 0 acceptance proof: real phone–stack round trip over the EXACT
// client the app uses (paho-mqtt over WebSocket). Exit 0 = pass.
// Run with the broker up: node scripts/roundtrip.js
import Paho from 'paho-mqtt';

const WS = process.env.BROKER_WS || 'ws://127.0.0.1:9001';
const TOPIC = 'trafficore/trip/TEST/state';
const [host, port] = WS.replace('ws://', '').replace('wss://', '').split(':');

function connect(id) {
  return new Promise((resolve, reject) => {
    const c = new Paho.Client(host, Number(port), id);
    c.connect({
      onSuccess: () => resolve(c),
      onFailure: (e) => reject(new Error(id + ': ' + e.errorMessage)),
      timeout: 5,
    });
    c.onConnectionLost = () => {};
  });
}

async function main() {
  const sub = await connect('roundtrip-sub');
  const got = new Promise((resolve) => {
    sub.onMessageArrived = (m) => resolve(m);
  });
  sub.subscribe(TOPIC);

  const pub = await connect('roundtrip-pub');
  const msg = new Paho.Message(
    JSON.stringify({ status: 'trajecting', probe: Date.now() })
  );
  msg.destinationName = TOPIC;
  msg.retained = true;
  pub.send(msg);

  const m = await Promise.race([
    got,
    new Promise((_, rej) => setTimeout(() => rej(new Error('no message in 5s')), 5000)),
  ]);
  const payload = JSON.parse(m.payload.toString());
  if (payload.status !== 'trajecting') throw new Error('bad payload: ' + m.payloadString);
  console.log(`PASS: ${m.topic} -> ${JSON.stringify(payload)}`);
  [sub, pub].forEach((c) => c.disconnect());
  process.exit(0);
}

main().catch((e) => {
  console.error('FAIL:', e.message);
  process.exit(1);
});
