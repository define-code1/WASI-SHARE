# WASI SHARE — Automated & Manual Testing Guide

## 1. Automated Unit & Integration Tests

Run the test suite using Vitest:
```bash
npm test
```

### Covered Test Suites
- **`tests/validation.test.ts`**:
  - Filename sanitization against path traversal (`../`, `..\`)
  - Windows reserved names prevention (`CON`, `PRN`, `AUX`, `NUL`, `COM1`)
  - QR pairing payload validation & expiration check
  - File metadata integrity validation
- **`tests/state-machine.test.ts`**:
  - Valid and invalid state transitions in the transfer lifecycle
  - Rejection of illegal transitions (e.g. `idle` -> `verifying`)
- **`tests/crypto.test.ts`**:
  - AES-256-GCM chunk encryption and authenticated decryption
  - SHA-256 checksum calculation and mismatch detection

---

## 2. Manual End-to-End Test Checklist

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| **1. Launch PC App** | Open WASI SHARE on Windows PC. | Clean interface displays fresh QR code and local endpoints with 5-minute timer. |
| **2. Scan from Android** | Open Android app and tap "Scan QR Code". | Camera viewfinder opens; scanning connects both devices and displays mutual green badges. |
| **3. Send PC to Mobile** | Select PDF on PC and click "Send". | Android displays incoming modal with file name and size; tapping "Accept" streams chunks and saves safely. |
| **4. Send Mobile to PC** | Select image on Android and send. | Windows displays approval notification; accepting downloads file and verifies SHA-256 integrity. |
| **5. Transfer Rejection** | Send file but click "Reject" on recipient. | Transfer is immediately cancelled on both devices without saving any partial bytes. |
| **6. Expired QR** | Wait 5 minutes before scanning QR. | Android scanner alerts that pairing code is expired and requests generating a new one. |
