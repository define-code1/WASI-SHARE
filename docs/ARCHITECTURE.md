# WASI SHARE — Architecture Specification

## 1. Executive Summary

**WASI SHARE** ("Simple. Secure. Yours.") provides high-speed, local Wi-Fi file transfers between Windows PCs and Android mobile devices without relying on third-party cloud storage, external accounts, or Internet servers.

---

## 2. Networking Architecture

### Selected Transport: Direct Local-Network TCP/WebSocket Stream

We selected **Direct Local-Network TCP/WebSocket streaming with Authenticated AES-256-GCM encryption** for the following architectural reasons:

1. **Deterministic Local Wi-Fi Performance**:
   - Eliminates STUN/TURN traversal complexity and peer-connection renegotiation delays on local subnets.
   - Operates entirely offline on private LAN subnets with maximum throughput (saturating 802.11ac/ax speeds, typically 40MB/s–80MB/s).
2. **Android & Windows Native Compatibility**:
   - Supported natively across Node.js/Electron and React Native/Expo without brittle native WebRTC binary bindings.
3. **Strict Zero-Cloud Architecture**:
   - No external signaling server or intermediary touches file payloads or encryption keys.

---

## 3. QR Pairing Protocol & Handshake

```
+--------------------+                       +----------------------+
|  Windows PC Host   |                       |    Android Client    |
| (Electron Main)    |                       | (React Native / Expo)|
+--------------------+                       +----------------------+
         |                                               |
         | 1. Bind local interface & port 49152          |
         | 2. Generate 5-min Ephemeral Session & Nonce   |
         | 3. Display QR Code [Payload + Challenge]      |
         |                                               |
         |             4. Scan QR via Camera             |
         |---------------------------------------------->|
         |                                               | 5. Validate schema & expiry
         |                                               | 6. Derive ephemeral key
         |       7. Connect ws://192.168.x.x:49152       |
         |<----------------------------------------------|
         |                                               |
         | 8. Send PAIR_INIT (Solved challenge + Device) |
         |<----------------------------------------------|
         |                                               |
         | 9. Verify challenge; Accept & send PAIR_CONFIRM
         |---------------------------------------------->|
         |                                               |
         | ===== MUTUALLY AUTHENTICATED AES-256 CHANNEL =====
```

---

## 4. Chunked File Streaming & Verification

1. **Chunk Size**: Standardized to **256 KiB** chunks for optimal memory usage and bounded buffering.
2. **Backpressure**: Receivers acknowledge chunks via `CHUNK_ACK` to prevent memory flooding.
3. **Atomic Safe Writing**: Incoming files are written to a temporary staging file (`.wasi.part`). Only upon cryptographic **SHA-256 checksum verification** is the file atomically moved into the user's destination folder.
4. **Manual Approval Gate**: No file is ever downloaded or accepted without the explicit consent of the receiver device.
