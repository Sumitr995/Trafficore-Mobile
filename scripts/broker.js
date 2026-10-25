// Phase 0 dev broker: stand-in for the LAN Pi's Mosquitto (1883 mqtt + 9001 ws).
// Run: node scripts/broker.js  →  swap out by pointing EXPO_PUBLIC_MQTT_WS at the Pi.
import { Aedes } from 'aedes';
import net from 'net';
import http from 'http';
import { Duplex } from 'stream';
import { WebSocketServer } from 'ws';

const a = new Aedes();
a.on('client', (c) => {
  console.log(`+ client ${c.id}`);
});
a.on('clientDisconnect', (c) => {
  console.log(`- client ${c.id}`);
});
a.on('publish', (pkt, client) => {
  if (client) console.log(`> [${client?.id}] ${pkt.topic} ${pkt.payload}`);
});

const broker = net.createServer(a.handle);
broker.listen(1883, () => console.log('mqtt tcp  :1883'));

const httpServer = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('trafficore dev broker\n');
});
const wss = new WebSocketServer({ server: httpServer });
// aedes v5 dropped createConnection; bridge the ws socket into a
// Duplex stream so a.handle can drive it like a plain net socket.
function wsStream(conn) {
  const d = new Duplex({ read() {} });
  d._write = (chunk, _, cb) => {
    conn.send(chunk, () => cb());
  };
  conn.binaryType = 'nodebuffer';
  conn.on('message', (data, isBinary) => {
    if (d.writableFinished) return;
    d.push(isBinary || Buffer.isBuffer(data) ? data : Buffer.from(data));
  });
  const end = () => d.end();
  conn.on('close', end);
  conn.on('error', end);
  d.on('error', () => {});
  d.on('close', () => { try { conn.close(); } catch (_) {} });
  return d;
}
wss.on('connection', (conn) => {
  a.handle(wsStream(conn));
});
httpServer.listen(9001, () => console.log('mqtt ws   :9001'));
