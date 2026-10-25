// Dummy corridor data — UI demonstration only (no broker, no MQTT).
// Bengaluru corridor MG Road → Manipal Hospital.

export const corridorSignals = [
  { id: 'SG-01', name: 'MG Road Junction', lat: 12.9759, lon: 77.6013, state: 'red', grant: 'none' },
  { id: 'SG-02', name: 'Anil Kumble Circle', lat: 12.9744, lon: 77.5967, state: 'green', grant: 'none' },
  { id: 'SG-03', name: 'Corporation Circle', lat: 12.9650, lon: 77.5874, state: 'red', grant: 'none' },
  { id: 'SG-04', name: 'Kanakapura Road', lat: 12.9256, lon: 77.5858, state: 'amber', grant: 'none' },
  { id: 'SG-05', name: 'Manipal Entry', lat: 12.9294, lon: 77.5885, state: 'green', grant: 'none' },
];

export const hospitals = {
  M1: { id: 'M1', name: 'Manipal Hospital', lat: 12.9294, lon: 77.5885 },
};

export const ambulances = [
  {
    id: 'AMB-07',
    driver: 'Ramesh K.',
    status: 'En Route',
    eta: '4 min',
    progress: 58,
    grant: 'granted',
    position: [12.9705, 77.5931],
    dest: [12.9294, 77.5885],
    route: [
      [12.9759, 77.6013], [12.9705, 77.5931], [12.9660, 77.5902],
      [12.9530, 77.5880], [12.9412, 77.5864], [12.9294, 77.5885],
    ],
    patient: {
      name: 'Suresh Naik',
      age: 58,
      gender: 'M',
      condition: 'Cardiac Arrest',
      severity: 'critical',
      pickup: 'MG Road Metro, Bengaluru',
      contact: '+91 98450 11241',
      notes: 'CPR en route · 2 EPI given, needs cath lab immediately.',
    },
  },
  {
    id: 'AMB-12',
    driver: 'Sunil M.',
    status: 'On Scene',
    eta: '9 min',
    progress: 12,
    grant: 'none',
    position: [12.9789, 77.6062],
    dest: [12.9294, 77.5885],
    route: [
      [12.9789, 77.6062], [12.9740, 77.5990], [12.9650, 77.5874],
      [12.9530, 77.5880], [12.9294, 77.5885],
    ],
    patient: {
      name: 'Divya Rao',
      age: 34,
      gender: 'F',
      condition: 'Road Accident — head trauma',
      severity: 'high',
      pickup: 'Church Street, Bengaluru',
      contact: '+91 99000 45200',
      notes: 'Immobilised, GCS 12 · trauma team standby.',
    },
  },
  {
    id: 'AMB-03',
    driver: 'Anand P.',
    status: 'Transporting',
    eta: '14 min',
    progress: 30,
    grant: 'requested',
    position: [12.9560, 77.5876],
    dest: [12.9294, 77.5885],
    route: [
      [12.9650, 77.5874], [12.9560, 77.5876], [12.9412, 77.5864],
      [12.9294, 77.5885],
    ],
    patient: {
      name: 'Mohan Das',
      age: 72,
      gender: 'M',
      condition: 'Stroke (suspected)',
      severity: 'high',
      pickup: 'Corporation Circle, Bengaluru',
      contact: '+91 98123 00432',
      notes: 'Stroke window 40 min, BS 7.8 · radiology alerted.',
    },
  },
];

export const accessList = [
  { id: 'AMB-07', driver: 'Ramesh K.', platform: 'Android', signal: 'granted' },
  { id: 'AMB-12', driver: 'Sunil M.', platform: 'Web', signal: 'none' },
  { id: 'AMB-03', driver: 'Anand P.', platform: 'Android', signal: 'requested' },
  { id: 'AMB-19', driver: 'Vikram S.', platform: 'Android', signal: 'none' },
];

export const camRooms = {
  'AMB-07': [{ id: 'c1', label: 'CAB VIEW' }, { id: 'c2', label: 'PATIENT BAY' }],
  'AMB-12': [{ id: 'c3', label: 'CAB VIEW' }, { id: 'c4', label: 'TRAUMA KIT' }],
  'AMB-03': [{ id: 'c5', label: 'CAB VIEW' }, { id: 'c6', label: 'STROKE MON' }],
};

export const chatSeed = [
  { from: 'amb', text: 'Patient secured, BP 90/60 and dropping.', t: '09:41' },
  { from: 'hosp', text: 'Noted. Resus Bay 2 ready, ABG on standby.', t: '09:41' },
  { from: 'amb', text: 'Requesting signal corridor ahead — 4 junctions.', t: '09:42' },
  { from: 'hosp', text: 'Forwarded to admin, hold tight.', t: '09:42' },
];

export const signalLog = [
  { id: 'SL-1', amb: 'AMB-07', signal: 'MG Road Junction', act: 'GRANTED', at: '09:40:12' },
  { id: 'SL-2', amb: 'AMB-07', signal: 'Anil Kumble Circle', act: 'GRANTED', at: '09:41:02' },
  { id: 'SL-3', amb: 'AMB-03', signal: 'Corporation Circle', act: 'REQUESTED', at: '09:42:31' },
];

// Latest submitted driver patient form (overrides the seeded one when set).
const watchers = new Set();
export let livePatient = null;
export function setLivePatient(p) {
  livePatient = p;
  watchers.forEach((w) => w());
}
export function onLiveChange(fn) {
  watchers.add(fn);
  return () => watchers.delete(fn);
}
export function patientOf(ambId, seed) {
  return livePatient?.amb === ambId ? livePatient : seed;
}

// Live driver GPS feed (same watch the driver map uses). null until a
// driver page has a fix; corridor pages consume it to move AMB-07.
const posWatchers = new Set();
export let livePos = null;
export function setLivePos(coords) {
  if (!coords || coords.latitude == null) return;
  livePos = [coords.latitude, coords.longitude];
  posWatchers.forEach((w) => w());
}
export function onPosChange(fn) {
  posWatchers.add(fn);
  return () => posWatchers.delete(fn);
}

// How far along the seed route the live position sits (0..1).
function progressOnRoute(route, pos) {
  let bi = 0;
  let bd = Infinity;
  route.forEach(([la, lo], i) => {
    const d = (la - pos[0]) ** 2 + (lo - pos[1]) ** 2;
    if (d < bd) { bd = d; bi = i; }
  });
  return route.length > 1 ? bi / (route.length - 1) : 0;
}

// Seed fleet with the live GPS folded into the own rig (AMB-07).
export function fleetWithLive(list = ambulances, pos = livePos) {
  if (!pos) return list;
  return list.map((a) => {
    if (a.id !== 'AMB-07') return a;
    const p = progressOnRoute(a.route, pos);
    return {
      ...a,
      position: pos,
      route: [...a.route.slice(0, -1), pos],
      progress: Math.round(Math.min(1, p) * 100),
      eta: `${Math.max(1, Math.round((1 - Math.min(1, p)) * 4))} min`,
    };
  });
}
