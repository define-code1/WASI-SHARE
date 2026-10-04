# WASI SHARE — Security Specification

## Security Principles

WASI SHARE is designed under a **Zero-Trust Local Transport** model:

### 1. Authenticated Encryption
- **Cipher**: AES-256-GCM (Galois/Counter Mode).
- **IV / Nonce**: 96-bit cryptographically unique IV per chunk generated via OS CSPRNG (`crypto.getRandomValues`).
- **Integrity**: Full file SHA-256 digest computed before transmission and verified after receipt.

### 2. Path Traversal & Windows Reserved Name Hardening
All incoming file names pass through `sanitizeFilename()` in `packages/shared/validation.ts`:
- Strips directory traversal sequences (`../`, `..\`, `/`, `\`).
- Windows-reserved device names (`CON`, `PRN`, `AUX`, `NUL`, `COM1-9`, `LPT1-9`) are prefixed with `wasi_`.
- Strips ASCII control codes (0x00–0x1F) and illegal characters `< > : " / \ | ? *`.

### 3. Replay-Resistant Short-Lived QR Codes
- QR codes expire in **5 minutes**.
- Each pairing contains a fresh 256-bit cryptographic challenge nonce.
- Expired sessions are rejected automatically with clear user guidance.

### 4. Electron Isolation
- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- Preload script strictly limits IPC communication to sanitized domain models.

### 5. Manual Consent
- Every incoming transfer requires explicit user confirmation (Accept or Reject).
- Unattended silent file drops are strictly prohibited.
