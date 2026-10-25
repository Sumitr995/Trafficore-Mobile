
## Corridor comm phase board (2026-10-25 eng review)
- [ ] T1: Harden MQTT broker before any shared/public WiFi demo (anonymous publish allowed today, app hardcodes LAN IP). Wait for broker ACL work or a venue change.
- [ ] T2: Camera upgrade trigger: if full motion video is ever required, revisit WebRTC or broker message-size changes (accepted ceiling: MQTT frame stream, decision D1).
