# Trafficore — Darling Driver App as Broadcast System (office-hours design doc)

- **Date:** 2026-10-24
- **Session:** office-hours (opencode, gstack)
- **Mode chosen:** Builder (hackathon/demo-style collaboration)
- **Chosen approach:** **C — Broadcast stream + simulated city** (creative/lateral)
- **Status:** draft, awaiting founder approval
- **Canonical copy:** `~/.gstack/projects/trafficore-mobile/` (state root) · **repo copy:** this file

---

## 1. Full session context log (what was said and what was read, nothing lost)

> The builder asked that every piece of conversation context — said or not said — live in an md file. This section is that log.

### 1.1 What the builder chose in this session

| Decision point | Result |
|---|---|
| D1 — Goal | **Hackathon / demo** (builder mode) |
| Q1 — Sticking point | Answered in free text: Trafficore is a multi-part EMS; focus now is the native driver app "like Uber", with connectivity hooks for the website + hardware later; dashboard redesign wanted but not now |
| Q2 — Trip flow | **Driver self-starts** (no central dispatcher for v1) |
| Q3 — Pickup leg | **Both modes** (pickup leg optional per trip) |
| Q4 — Web research | **Skip — keep session private** (Phase 2.75 landscape research not run) |
| D2 — Premises | **Agreed to all 5** with corrections (see 1.2) |
| D3 — Second opinion | "use whatever is best for me" → in-host subagent used (Codex CLI not installed) |
| D4 — Approach | **C: broadcast + sim** (over B driver-experience-first and A spine-only) |

### 1.2 The builder's own words (near-verbatim)

- "Trafficore is a Emergency Management System which have multiple parts and systems working parallely."
- Three pillars: **hardware for traffic signal management for ambulance** · **dashboards for hospital, driver & admin** (admin watches ambulance GPS, route, patient/incident details) · **the mobile native app for the ambulance driver**.
- "I already have build dashboard but i want its just a dummy I didnt like it at all i want to redesign it." Dashboard code lives at `C:\Users\SUMIT\OneDrive\Desktop\GOAT\Trafficore-test`.
- "I want to connect this mobile app, hardware and my dashboard website to each other later."
- "my focus for now is building this native app like a uber for ambulance driver. make it like that and have some connectivity for the website and hardware."
- "its an official funded project of my college." **No deadline yet** (will be announced later).
- "make sure every convo context etc which i said or not said should be noted somewhere in md file." → this document.
- On Uber claim: "Uber for ambulance is not over claim, i just want UI/UX like that for an ambulance driver to operate it. There are multiple systems with multiple feature which are connected to each other. I will focus it one by one and explain you at that time."
- On TCP-style machine state: "the ambulance and traffic signal logic is whole different, unorganised, dummy, etc. i want to make it organised, working product."
- Strategy: "i will provide you all context code etc one by one. first i want to build all systems individually with semi-demo for testing etc then later connect it with each other."

### 1.3 What was read from the codebase (read, not asserted by the builder)

**Trafficore Mobile (this repo):** Expo/React Native + Expo Router, dark OSM map + GPS. `lib/` has `auth.js` (local demo auth only — one seeded driver `driver@trafficore.local`, AsyncStorage, no backend), `hospitals.js`, `placesGeoapify.js`, `rankHospitals.js` (Groq AI ranking), `routing.js`, `trip.js`, `signals.js` (signal positions from OSM), **`signalControl.js`** — a deliberate **contract stub**: `triggerGreenCorridor({intersectionId, ambulanceId}) → {ok, via, at}` / `releaseCorridor(...)`, comment reads "hardware plugs in here, nowhere else… MODE: MOCK". Components: DriverMap, HomeSheet, HospitalSheet, NavigateCard, SignalPanel, TopHospitals, TripBanner, EmergencyCard, etc. `git log` shows 15 commits from `Initial commit` → `Minimalist icon and motion polish across driver flow`.

**Trafficore-test (dashboard):** React 19 + Vite 7 + Clerk auth + Tailwind 4 + shadcn/radix + three.js, `bun`-managed, and a **Mosquitto MQTT config committed at the root** (listener 1883 mqtt + 9001 websockets, anonymous allowed, persistence on) — the builder already intends MQTT as a pillar.

**Hardware:** extracted from the legacy `Trafficore-OG` repo (branch-per-system, unstructured). Full extraction lives in `GOAT/trafficore-OG/resources/` (`README.md`, `BRANCH-MAP.md`, `HARDWARE.md`, `PROTOCOLS.md`, `EXECUTION-CONTEXT.md`, `code/`). Key facts: ESP32 4-way controller with MQTT priority (topic `trafficore/ambulance`, JSON `{path(A-D),direction(LEFT/RIGHT/STRAIGHT)}` or `{reset:true}`, 5s normal cycle, 10s override auto-timeout, non-blocking yellow blink); Raspberry Pi 4 = LAN broker (Mosquitto 1883/9001) + GPIO button console + HLS camera stream (port 8000) + patient/GPS/chat publish to `hospital/*`; Arduino UNO + SX1278 LoRa 433MHz pair on the shelf as a backup channel (SF7/125k/CR4-5/20dBm); Spring Boot (Maven, H2) test backend bridging MQTT→DB with per-topic adapters. Notable redesign gaps confirmed by the legacy code: no ack channel back to publishers, single-ambulance topic, hardcoded IPs/credentials, anonymous broker.

### 1.4 What was inferred but not said (mark: *not said — derived*)

- Broker choice is nearly settled by the committed Mosquitto config; nothing in the mobile repo contradicts it.
- Precedent for "dumb display first, redesign later": the fake dashboard pattern in Trafficore-test's early v1 iteration is replaceable without touching Clerk.
- "Uber for ambulance" reads as **one-screen operator craft** (map-first, one-tap states), not marketplace — confirmed by the builder's own correction.
- The corridor broadcast model means **no dispatch server ever** for v1; the trip lives in the phone, the broker just carries radio waves of it.
- Recording + replaying the trip gives a demo artifact the college can evaluate even before hardware arrives — this is why the builder selected C.

## 2. Agreed premises (D2, with builder corrections)

Landscape research (Phase 2.75), run after the builder later granted permission, landed as a **supplementary section (§2.75)** at the end of this document; the premises below were agreed before it and survived it, with one contract upgrade (ack status codes, §5.1) that came from it — see the EUREKA note there.

1. **Trip source of truth = driver's phone** in v1 (driver self-starts; dashboards mirror; no central dispatch server).
2. **One MQTT broker (Mosquitto) is the spine** for app↔dashboard↔hardware; the `signalControl.js` contract stays identical, only its mock body gets replaced with a publish.
3. **Dashboard redesign is deferred.** The existing Trafficore-test app becomes a live subscriber ("dumb display"); redesign happens later.
4. **"Uber for ambulance drivers" is a UX claim only** — no payments, ratings, marketplace. Builder explicitly confirmed this: the request is the operating UI/UX for the driver.
5. **Pickup leg optional per trip** — a "both modes" trip state machine (driver-goes-to-patient leg insertable, skip flag on trip start).

## 3. Problem statement

The physical chain "ambulance → green corridor → hospital handoff" in India today is unorganized, informal, and unmeasured. Trafficore is the builder's EMS to make it organized and demonstrable, funded by their college. The immediate system to make first-class: **the ambulance driver's operating app that behaves like Uber for the driver and broadcasts its trip so hardware, hospital, and admin systems can be built and tested against it independently.**

## 4. Cross-model second opinion (in-host subagent; full text in session chat)

Four takeaways, intact:
1. **Coolest unconsidered version:** invert "driver asks for green" into a **broadcast time-stream**: `ambulance/{tripId}/corridor` publishes position + destination + ETA-to-next-signal; anything subscribes — signal controllers, dashboards, and a **public corridor page** ("Ambulance inbound — ETA to your junction: 42s") shareable to ward staff and other cars. Plus **trip replay**: record every MQTT stream; demo the hardware corridor without hardware by replaying a recorded trip.
2. **What excites the builder:** driver UX craft under the Uber claim ("map-first, one-tap trip start, clean trip states").
3. **50% tool:** **Traccar** (open-source GPS fleet platform) or **SUMO+TraCI** (simulated city corridor). My synthesis: both are "later" — the app + broker + a 60-line fake signal controller gets the proof with 1% of the learning curve.
4. **Weekend shape:** Mosquitto up → swap signalControl mock body → fake signal controller acks → corridor ribbon on the map lights green per ack → dashboard subscribes over WS 9001. Skip backend auth, dispatch server, TS migration, multi-driver, Traccar.

### Cross-model synthesis
- Agree: phone-as-truth + broker spine; fake controller = "semi-demo for testing", almost free.
- Upgraded: trip replay echoed the builder's "officially funded, no deadline" patience — it is both a testing tool and a submission artifact.
- Disagreement (mine, mild): don't adopt Traccar or SUMO in v1; keep them parked for a serious year-2 demo. Chosen-path C shrinks to "broadcast model + fake controller + replay recorder + corridor page", not a full simulator adoption.

## 5. Selected approach: C — Broadcast stream + simulated city

### 5.0 Order of work (C includes A's spine as its first day)

**Phase 0 — Broadcast spine (first build unit)**
1. Mosquitto broker up with the existing config (1883 mqtt + 9001 websockets).
2. Replace ONLY bodies inside `lib/signalControl.js` w/ MQTT publish; contract stays `{ok, via, at}`.
3. Throttled (1–2s) position publish while a trip is live.
4. A `sim/` node script: **fake signal controller** subscribing to corridor requests, acking each segment after a small delay, so the driver-app map renders a **corridor ribbon** lighting green segment by segment as acks arrive.
5. **Replay recorder**: record all publishes of oneTrip to disk (JSONL). Any recorded trip becomes replayable (semester demo + hardware bring-up input).

**Phase 1 — One-screen driver rebuild (both modes), the actual Uber feel**
One map + one sheet: one-tap trip start w/ **pickup-leg toggle** (single boolean), close trip states (idle → en route to patient → patient onboard → arrived) with haptics + timeline, live ETA-to-hospital card. State machine belongs in `lib/trip.js`; presenter components already exist (TripBanner, SignalPanel) and get consumed fresh from states, not screens reworking.

**Phase 2 — Everything mirrors the truth, without new servers**
- Hospital dashboard: `mqtt.js` over WS 9001; drops an ambulance marker + trip state. Clerk untouched.
- Corridor public page: same stream, no login, static. "Ambulance inbound — ETA to your junction."
- Admin view additionally gets GPS breadcrumb routes (it can stay the subscriber it already is in concept).

**Phase 3 — Hardware bring-up (later, builder provides context)**
Real controller (or SUMO sim) subscribes to the same corridor topics; only the *ack* comes from hardware. The contract, the app, the replay recorder do not change. Not to be designed further here — builder brings hardware context.

### 5.1 Proposed topic contract (starter, builder revises)

```
trafficore/trip/{tripId}/state      ← idle|trajecting|transporting|arrived
trafficore/trip/{tripId}/position   ← {lat,lon,speed,ts} @1-2s
trafficore/trip/{tripId}/hospital   ← {hospitalId, etaMin}
trafficore/corridor/{tripId}/request  ← {intersectionId, ambulanceId}            (preemption semantics — seizes, not adjusts)
trafficore/corridor/{tripId}/ack      ← {intersectionId, status, grantedTs?}     (status mirrors SAE J2735 SSM: requested|processing|granted|rejected)
```
Retained messages on state; clean session off; replay = `mosquitto_pub -f recorded.jsonl` + `-ss` skews nothing — replay script reads the JSONL's own `ts`.

### 5.2 Wireframe (rough sketch)

Sketch HTML (3 panels: driver screen w/ corridor ribbon + states, public corridor page w/ countdown, semi-demo flow notes), style-constrained by this repo's `Context/DESIGN.md` (Spasex language: black canvas, uppercase micro labels, ghost pills, hairlines):
**`C:\Users\SUMIT\AppData\Local\Temp\gstack-sketch.Jllcu7\sketch.html`** — renders unavailable on this machine (no bun/browser pipeline); open the file manually if useful. Screenshot step skipped, no artifact generated.

### 5.3 Pipeline / wireframe artifact

- Sketch: `C:\Users\SUMIT\AppData\Local\Temp\gstack-sketch.Jllcu7\sketch.html` (not committed, in temp; copy anywhere needed).
- No screenshot (render tooling unavailable here — no bun; says unverified visually).

## 6. Risks & open questions

- **RN MQTT over WS:** test `paho`/`mqtt` RN client quirks on device before building on assumptions. First engineering task after the broker spins up.
- **Nothing in hardware context:** everything corridor-related stays provable in mock until the builder supplies hardware detail; bring it one system at a time, as the builder requested.
- **Groq ranking**, hospital data, and keys are **not audited** in this session (builder focuses the app; APIs exist on the machine per the folder layout).
- **No deadline yet**: the plan phases tolerate reordering; nothing on the critical path depends on an announced date.

## 6.1 Build progress log (2026-10-24, first driver-app build unit)

Implemented in Trafficore Mobile (build unit: driver self-start both modes + MQTT driver stream + legacy-compat corridor publish):
- **Dep:** `paho-mqtt@1.1.0` (pure-JS MQTT-over-WebSocket; supports RN's `global.WebSocket`).
- **`lib/mqtt.js` (new):** publish-only client; broker `EXPO_PUBLIC_MQTT_WS`, default `ws://192.168.26.192:9001` (legacy Pi LAN from the extracted hardware docs). Best-effort: never throws when the broker is unreachable.
- **`lib/trip.js` (rewritten):** dispatch timer removed; driver self-starts with two actions — `takeCase()` (pickup leg: case card → accept → navigate) and `startTransport()` (patient onboard → straight to hospital selection, both-modes premise). MQTT retained state on `trafficore/trip/{tripId}/state` (mapping: accepted→trajecting, picked_up→transporting, arrived→arrived), hospital beats on `trafficore/trip/{tripId}/hospital`, and `publishPosition()` throttled to 2s on `trafficore/trip/{tripId}/position`.
- **`lib/signalControl.js`:** contract signatures unchanged; mock bodies replaced with publish to `trafficore/corridor/request` plus legacy `trafficore/ambulance` (`{path(A-D), direction}` on request when caller passes `legacyPath`; `{reset:true}` on release).
- **`components/HomeSheet.js`:** idle card now shows TAKE A CASE / PATIENT ONBOARD — TRANSPORT NOW; stats row dropped.
- **`src/app/index.js`:** publishes throttled GPS while a leg is live (reuses `useDriverLocation`; the map keeps its own watcher).
- **Verified:** all six touched files parse + transpile via `babel-preset-expo` with JSX (ESLint and tsc are not configured in this JS project — noted as tooling debt).

Corridor topic deviation from the office-hours contract: request topics are `trafficore/corridor/request` (no `/{tripId}` — tripId lives in payload; single-trip reality of the device today) and ack is not subscribed yet (no controller).

**Update (same day, builder pivot):** builder wants every system working independently first, connectivity later. All MQTT wiring is now inert by default — `EXPO_PUBLIC_LINKED=1` (keys.js `linked`) is the single switch that activates publishing/connection; until then the app is a fully self-contained demo (corridor buttons fall back to in-app Alert feedback, `via: 'mock'`, zero network calls to any broker). The trip stream, corridor contract, and legacy-compat publishes all survive unchanged behind the flag.

## 6.2 Build progress log (2026-10-24, second driver-app build unit: Uber-light overhaul + trip history)

Follow-up unit in the same repo, all demo-independent (MQTT stays behind `EXPO_PUBLIC_LINKED`):

**Visual direction pivot — "Uber light (authentic)".** Builder picked the direction via prompts; scope chosen: all screens. Reconstructed from knowledge (Mobbin MCP is behind a paid plan; builder asked about pulling real Uber/Ola APKs — advised against reverse-engineering modern server-driven apps, poor yield). The driver app moved from its old dark theme (`#161616` canvas, `#00d992` green) to Uber's light chrome:
- **Tokens:** `global.css` `@theme` + `lib/theme.js` now: background `#ffffff`, primary `#141414` (black CTA, white label on top — Uber's signature inversion), border `#e4e4e6`, text ink `#141414`, muted `#6b7280`, **accent `#06c167`** (Uber-green — status dots, trip stepper done-dots/connectors, EN-ROUTE label, emergency timer bar/seconds), danger `#ff6b6b`. `app.json` `userInterfaceStyle: "light"`; `_layout.js` status/header chrome light.
- **Sweep method:** mechanical bulk replace across `components/*.js`, `src/app/*.js`, `global.css`, `lib/theme.js`, `app.json` (documented hex→hex mappings), then targeted fixes in 5 icon spots.
- **Map:** CARTO Voyager light raster tiles (`lib/theme.js` `TILE_URL` export; DriverMap uses the same URL inline, `?key=` param kept).
- **Driver shape (from earlier Uber-driver references):** floating top capsule in idle/expanded modes — avatar, live status dot, round History + LogOut icon buttons; NavigateCard shows a big bottom-left ETA card in expanded nav mode and a compact chip in compact mode; button labels GO / STOP. Dead `components/DriverHeader.js` deleted (grep-verified no importers).

**Trip history (new feature, no new dep — AsyncStorage 2.2.0 already present):**
- `lib/history.js` (new): `summarize` / `loadHistory` / `saveTrip`; key `trafficore.tripHistory.v1`, newest-first, capped at 50.
- `lib/trip.js` `arrived()` persists the completed trip fire-and-forget (never blocks the UI).
- `src/app/history.js` (new screen): Reveal-card list of past trips, empty state; route registered in `_layout.js`.
- Entry points: capsule History icon + "VIEW TRIP HISTORY" link on the summary receipt.

**Emergency response feel:** EmergencyCard now has a breathing severity chip (`Animated.loop` scale 1→1.12) and fires `Vibration.vibrate([0,70,60,70])` (try/caught) when the case card arrives.

**Hairline figure — `corridor` (first gstack/hairline figure published into the repo):**
- Built with the `hairline-create` skill pipeline in a real-Chrome look harness; validated (structure/behavior constraints) and look-checked. Geometry: street with 7 signal poles; pointer opens the corridor (head lifts with distance falloff); slider = corridor radius `range [12, 22, 38]`; rules [1, 3, 5, 9]; tour waypoints `[[120,190],[282,190],[200,148],null]`. GMAX 34; head rings `rings(x-4.2,-4.2,x+4.2,4.2,2.1,0.9)`; fit max z 84.
- One look-violation consciously accepted: 26% ink movement at thumbnail vs 37% bar — justified because the field is a single-row city block (vertical exertion reads as intent there).
- Skill-native bug found and fixed upstream in our copy: the initial register loop gated drawing behind `if (m)`, so heads never rendered at rest — now draws all poles unconditionally after the spring step.
- Shipped artifacts: `assets/hairline/` (`corridor.js` source, standalone `hairline-corridor.html`, look proof sheet PNG).

**Login reworked to host the figure:** ScrollView, hero `<CorridorHero />` above the brand block, demo-bind button, light form card. Hero embed hard-won:
- Expo Go denies `file://` asset URIs in WebView (`ERR_ACCESS_DENIED`) → fix: `Asset.fromModule(...).downloadAsync()` then read to text and render with `source={{ html }}`.
- Expo SDK 54 deprecated `readAsStringAsync` on the main import → migrated to the new filesystem API: `new File(a.localUri || a.uri).textSync()`. Confirmed working on-device by the builder.

**Verification debt unchanged:** Babel/expo transpile check (`babel-preset-expo` with JSX) over 21+ files; ESLint and tsc still not configured in this JS project. On-device confirmation exists for the login hero only; the light-swept screens, history flow, and light map tiles need a builder eyeball pass. Note: `Context/DESIGN.md` documents an older "Spasex" brand-language consultation — never governed the driver app and is untouched.

## 7. Founder signals observed (for the record)

Articulated a real problem (unorganized signal logic) · pushes back on wording ("Uber is not over claim" — with a reason) · shows taste (rejected own dashboard; wants "organised, working product") · shows agency (three working systems already in flight, funded) · project solves a problem other people need. Signals count: 5 of 8.

## 8. The Assignment (real-world action, not code)

**Record one real trip end-to-end tonight and replay it to two people who weren't you.**
Concretely: broker up, run a mock trip around your campus gate with the recorder on (any drive works — walk it, bus it, drive it), then play the JSONL back into the fake signal controller while a friend watches the driver app fill with green. If the same trip plays back on a dashboard you did not touch, the broadcast architecture is proven — and you have a college- submission artifact before one line of dashboard redesign.

---

*Session ran in builder mode; landscape research ran as the supplementary §2.75 after the builder later granted permission. All claims above marked: code facts = read from repos this session; quotes = builder messages; everything else is inference and marked as §1.4.*

---

## 2.75 — Landscape findings (supplementary; added after the builder later granted web research)

Builder-mode searches, generalized terms only: "ambulance green corridor traffic signal preemption system how it works 2026" and "Open source ambulance GPS fleet tracking MQTT dispatch 2026". Untrusted web content, cited not followed.

**Layer 1 — what everyone already knows**
- Emergency vehicle priority splits into **vehicle-based** (infrared emitter + receiver per intersection; blind to distance/speed) and **system-based** (GPS + central system + geofenced intersections). Sources: FHWA Traffic Analysis Tools Vol 4 Appendix N; WSDOT TSMO EVP page.
- Quantified upside: response times down 14–23% (Denver; ~70s average), emergency-vehicle crashes down 71% in St. Paul, MN; ~25s average preemption duration clearing one cycle from side streets (FHWA NextGen TIM fhwahop24019; ITSKRS).
- Verified sources: `ops-dr.fhwa.dot.gov/publications/fhwahop24019/fhwahop24019.pdf`, `tsmowa.org/category/intelligent-transportation-systems/emergency-vehicle-preemption`, `ops-dr.fhwa.dot.gov/trafficanalysistools/tat_vol4/app_n.htm`.

**Layer 2 — current discourse (2026)**
- The industry is moving to system-based EVP at scale: Hillsborough County, 600 intersections + 175 vehicles on GPS + cellular + radio (`hcfl.gov` EVP page); Singapore's ST Engineering Traffic Priority System activates a green corridor via V2X within 200m of hospital-adjacent junctions, live from 2024 (`stengg.com`); FDOT DSRC/V2X pilot improved response times ~90s (ITSKRS 2025-B01994).
- V2X standardization maps cleanly onto our design: the SAE J2735 SRM/SSM conversation defines the full request lifecycle the PRS logs are already meant to capture (requested → processing → granted → rejected or priorityCancellation; role, importance lanes). See `cv2x.itsroads.com/guides/signal-priority`.
- Practitioner pattern for ambulance telemetry: MQTT topics like `ambulance/{id}/vitals|gps|dispatch` with QoS 1 store-and-forward, then MQTT→Kafka bridge at the hospital (senior-engineer write-up, denvermobileappdeveloper.com). Matches our broker-first spine retrospectively.
- Open-source direct neighbours:
  - **GoldenHourEngine** (MIT, Sherin-SEF-AI) — full adjacent scope (vision detection → dispatch scoring → hospital matching → corridor manager) built on Mosquitto MQTT + OSRM + PostGIS; note its corridor manager is MQTT via publishers.
  - **MediGo** (kavinu1) — React admin + NestJS + Firebase + Flutter driver app (our dashboard/app analog, different architecture).
  - **VISTA** (eng-Mahmoud-Shreef) — student academic prototype with ESP32 ambulance node, Flask dashboard, and an ambulance → incident → hospital workflow already proven to work.
  - **Trek Medics Beacon** (MIT) — decentralized SMS/WebSocket dispatch backend; **open-fleetr** (MIT) — ambulance management/dispatch, WIP.
- Uses for the builder: GoldenHourEngine's corridor-manager design = free reference material when writing the fake signal controller; VISTA proves the ESP32 ambulance-node pattern piece a college prototype will respect.

**Layer 3 — does the conventional approach fail here? EUREKA.**
Everyone builds system-based EVP agency-first: CAD + ATMS integration at each signal agency, then vehicles. For a college-funded builder, that is the unreachable part of the stack. The EUREKA: Trafficore's broadcast design **is** the system-based pattern with its parts relabeled — the phone is the AVL, the Mosquitto broker is the CAD→ATMS bridge, geofence-ETA is the preemption trigger, and the fake signal controller stands in for the ATMS. Conventional wisdom is not wrong; it is unreachable at this budget, and the broadcast model reproduces its shape at near-zero infrastructure cost. **The differentiator is worth naming**: no published project packages system-based EVP as a driver-first, dispatch-free broadcast app — that is Trafficore's thesis.

Contract upgrade from the research (applied in §5.1):
- ack payload now mirrors SSM status codes (`requested|processing|granted|rejected`) so a future real RSU/controller adapter can slot behind unchanged topics;
- corridor requests are marked **preemption semantics** (seizes the controller) — distinct from transit-style priority (adjusts within rules). The distinction comes straight from the CV2X guide; the sim and future hardware should respect it.
