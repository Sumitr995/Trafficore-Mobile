> Resident context. Trim stale sections after reads; keep only long-lived state.

## Objective
- Build Trafficore corridor software per approved gstack eng-review plan. User reordered mid-Phase-0: **"just build without hardware this time — things able to build with hardware, MQTT etc"** → all software now on the laptop aedes+ws broker stack; hardware-dependent bits (real Pi broker deployment, camera uplink hardware, signal hardware) deferred. Current build step: **ConnectionChip + Phase 1 corridor store** (broker software already runs; roundtrip harness frozen).

## Important Details
- Ponytail mode active (full). Repo = direct commits to `main`, feature-style, push to origin (github.com/Sumitr995/Trafficore-Mobile).
- `.env` now has `EXPO_PUBLIC_LINKED=1` + `EXPO_PUBLIC_MQTT_WS=ws://192.168.0.205:9001` (laptop broker; Pi swap = one line later).
- paho CLI 1.1.0 broken `new Paho.Client(url)` → fixed via `BROKER {host,port}` helper in `lib/keys.js`; `lib/mqtt.js` now constructs `new Paho.Client(host, port, 'trfx-…')` (real bug it exposed).
- aedes v5 API drift fixed in `scripts/broker.js`: `new Aedes()`, WS bridge via manual Duplex + `a.handle(wsStream(conn))` (createConnection removed in v5; ws 'message' args `(data, isBinary)`).
- **Zombie node broker processes hold ports 1883/9001 between tool calls** — ALWAYS `Get-NetTCPConnection -LocalPort 1883,9001 | Stop-Process` before starting broker; past roundtrip failures were tested against stale crashed brokers (unreliable negative results).
- Remaining stuck item: `scripts/roundtrip.js` still times out even against fresh broker (last run: PID 23496 alive, still AMQJSC0001E). Node-paho harness flounded → user told to just build; verify MQTT in the real web app instead of the node harness.
- Uncommitted: login hero removal, landing rewrite, scripts/broker.js + roundtrip.js, package.json (aedes/ws devDeps), lib/keys.js + lib/mqtt.js constructor fix, .env additions, ConnectionChip TBD.
- Reanimated auto-configured (babel-preset-expo); eslint immutability disables placed per line. Syntax check via `$env:NODE_PATH=…; node <Temp>\opencode\syntax-check.js`.
- Approved topic contract (from eng review): `trip/{tripId}/state|position|lastpos|patient|hospital|camera`, `chat/{tripId}/{dir}`, `driver/{id}/presence`, all retained per spec; Phase 1 covers D3/D4/D7/D8/D9/D10 fixes; manual per-phase demo passes = test contract (no formal tests by user choice).
- gstack engagement state: skill plan-eng-review fully run; gstack-review-log skipped; upgrade snoozed 24h; proactive ON; report + sentinel live in /home/sumit/.gstack/projects/Sumitr995-Trafficore-Mobile/.

## Work State
### Completed
- Merge cleanup, hero removal, landing rewrite (uncommitted), dashboards responsive (committed f4a8506), DriverMap web iframe (31bac4b), 213d3c8 web platform.
- Broker debugging saga (all laptop-software): pi probe dead → LAN scan → aedes+ws install (any version) → 4 crash bugs fixed (aedes.Instance→Aedes class, default export→named, paho host/port constructor, v5 createConnection→manual Duplex bridge with ws arg form).
- `.env` updated; `lib/keys.js` + `lib/mqtt.js` constructor fix applied.

### Active
- **Dummy-UI corridor build COMPLETE and browser-verified** (user order: UI with dummy data, skip MQTT/broker for now). Files: NEW `lib/dummy.js` (seed trio AMB-07/12/03 + corridor signals SG-01..05 + access list + cams + chat seed + `setLivePatient` mini-store), NEW `components/CorridorMap.js` (Leaflet iframe chart w/ ambulance pills + route lines + signals; structured `{trfx:'setData'}` bridge — NO eval; marker clicks `{trfx:'amb'|'signal'}`), NEW `components/CamFeed.js` (picsum placeholder feed + cam switch), NEW `components/ChatPanel.js` (seed msgs, send + 1.2s dummy crew reply), REWORK `src/app/admin.js` (tabs: Corridor Map / Overview / Incidents / Driver Access / Users — map right rail = patient card + camera; access tab = grant toggles per driver + grant log), REWORK `src/app/hospital.js` (tabs Patient/Incoming/Overview/Admissions; patient card + camera + route-to-hospital with per-signal GREEN HOLD + nurse↔crew ChatPanel), NEW `src/app/signal.js` (corridor list + REQUEST → pending → GRANTED timer + access log), NEW `src/app/patient.js` (name/age/gender/condition/severity/pickup/contact/notes; SUBMIT → `setLivePatient` flow → `SHARED WITH HOSPITAL`), `src/app/_layout.js` register routes, `src/app/index.js` + Siren button to /signal.
- Verified in Chrome against live Metro: /admin (map + markers + click-select + patient card + camera + signal cards), /hospital (patient detail + route + chat + 2 picsum cam images), /signal, /patient (form renders, chips, submit flag). `router.back()` guarded with canGoBack for deep-link opens.
- Map tile bug fixed: CorridorMap initially omitted the CARTO API key → "API KEY REQUIRED" watermark tiles only; now passes `?key=KEYS.carto` same as DriverMap. Verified visually.
- Map markers upgraded per user: ambulances = white circular badge w/ inline-SVG ambulance logo + ID label pill; selected gets green ring/label. Routes now always drawn (grey others / green selected), not only when selected. Verified visually (admin-icons.png).
- RPi HLS camera wired per user's Pi setup (`http://192.168.0.175:8000/hls_stream/stream.m3u8`): `lib/keys.js` gained `camUrl` (`EXPO_PUBLIC_CAM_URL` override), `CamFeed.js` now embeds hls.js (jsdelivr) in a srcDoc iframe/WebView, mutes autoplay video, bridges live status (`{trfx:'cam',on}` web / ReactNativeWebView message native), 8s watchdog → SIGNAL LOST overlay + RETRY (lost not flappable by pings). Admin + hospital pass `stream={KEYS.camUrl}`. Verified offline fallback in Chrome (cam-lost.png); LIVE path can only be confirmed when the Pi actually streams (its IP currently unreachable).

### Blocked
- Real phone round trip pending broker verification inside app runtime (user will test).
- Pre-existing lint debt (33 errors: react-hooks/refs false-positives on Animated refs + HomeSheet apostrophes) — old files only, out of scope. New/edited files: zero lint problems. tsc n/a (JS project, no tsconfig).

### Blocked
- Real phone round trip pending broker verification inside app runtime (user will test).
- Pre-existing lint debt (35 errors) out of scope.

## Next Move
1. Aw aw user review of the dummy-UI build (browser screenshots at Temp\opencode\admin-corridor*.png; user's dev server on 8081 has hot pages: /admin /hospital /signal /patient).
2. Commit the dummy-UI feature (dummy data + three dashboards + driver pages) + push. Suggested split: (a) shared components+data, (b) admin, (c) hospital, (d) driver pages.
3. MQTT/broker work (real corridor link, ConnectionChip, corridor store) parked — resume when user says go real/hardware. Standing rule stays: kill zombie listeners on 1883/9001 before starting `scripts/broker.js`.

## Changelog
- 2026-10-25: User asked "what are you doing" mid Phase-0-broker-debug; answered. User then ordered "just build without hardware this time" → switched from roundtrip-harness debugging to build forward. Created this context state file. Ports zombie-broker killing noted as standing rule.
- 2026-10-25 (cont.): Killed stale port holders (PID 27280 ×2). Fresh broker (PID 23496) ran; roundtrip STILL AMQJSC0001E → harness frozen (node-paho quirk, not app-affecting). Build resumed: ConnectionChip → corridor store. STATE.md sections updated to reflect.
- 2026-10-25 (final): User pivoted: "skip broker/MQTT — main focus UI representation with dummy data". Built full dummy corridor UI (all 3 surfaces + 3 new dashboards components + 2 driver pages), fixed CorridorMap's missing message bridge (structured JSON, no eval), guarded router.back. Verified every surface live in Chrome over user's running Metro (port 8081); Metro EMFILE (OneDrive race) solved by reload. Lint: 0 problems in new files, 33 pre-existing errors untouched.
