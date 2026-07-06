---
name: Casherk License System
description: Offline RSA-2048 device-bound license verification — architecture and key locations
---

## Design
- **Algorithm**: RSA-2048 / SHA-256 PKCS#1 v1.5 — fully offline, permanent (no expiry)
- **Verification**: App verifies using embedded public key only (`constants/license.ts`)
- **Generation**: Developer runs `node tools/keygen-license.js <deviceId>` using private key in that script
- **Storage**: `@casherk:license` = `{ deviceId, key }` in AsyncStorage

## Key locations
- Public key: hardcoded PEM in `artifacts/casherk/constants/license.ts` (safe to commit)
- Private key: embedded in `tools/keygen-license.js` (developer tool, not in APK bundle)
- Verification: `verifyLicenseKey(deviceId, keyBase64)` in `constants/license.ts`
- Context: `activateLicense(key)` in `context/SettingsContext.tsx`

## Key format
- Output of keygen: Base64 string (~344 chars) — user copies from message, pastes into app
- activate.tsx has multiline input + "لصق من الحافظة" paste button

## Why RSA over HMAC
HMAC embeds the secret in the app bundle (extractable via APK decompile). RSA asymmetric: private key never ships in app; public key alone cannot forge signatures.

## How to apply
When adding new device: `node tools/keygen-license.js <deviceId>` → sends Base64 result to user → user pastes in activation screen.
