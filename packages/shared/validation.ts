/**
 * WASI SHARE — Validation and Security Sanitization
 */

import { WasiPairingPayload, FileMetadata } from './types';

// Windows-specific reserved file names
const WINDOWS_RESERVED_NAMES = new Set([
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
]);

/**
 * Strips path traversal sequences, illegal Windows characters, and control codes.
 * Ensures the resulting filename is safe to save on Windows and Android filesystems.
 */
export function sanitizeFilename(rawName: string): string {
  if (!rawName || typeof rawName !== 'string') {
    return 'unnamed_file';
  }

  // 1. Remove leading/trailing whitespace
  let clean = rawName.trim();

  // 2. Strip directory path separators and path traversal patterns
  clean = clean.replace(/^[a-zA-Z]:[\\/]/, ''); // Remove drive letters like C:\
  clean = clean.replace(/(\.\.[\\/])+/g, '');   // Remove ../ or ..\
  clean = clean.replace(/[/\\]/g, '_');          // Replace slashes with underscores

  // 3. Remove characters illegal in Windows filenames: < > : " / \ | ? *
  // and ASCII control characters (0x00 - 0x1F)
  clean = clean.replace(/[<>:"|?*\x00-\x1F]/g, '_');

  // 4. Strip trailing dots or spaces which Windows forbids
  clean = clean.replace(/[. ]+$/, '');

  // 5. Check against Windows reserved device names (CON, NUL, AUX, etc.)
  const baseName = clean.split('.')[0].toUpperCase();
  if (WINDOWS_RESERVED_NAMES.has(baseName)) {
    clean = `wasi_${clean}`;
  }

  // 6. Enforce sensible maximum length (255 characters standard)
  if (clean.length > 255) {
    const extIndex = clean.lastIndexOf('.');
    if (extIndex !== -1 && extIndex > clean.length - 15) {
      const ext = clean.substring(extIndex);
      const prefix = clean.substring(0, 255 - ext.length);
      clean = prefix + ext;
    } else {
      clean = clean.substring(0, 255);
    }
  }

  return clean || 'unnamed_file';
}

/**
 * Validates a QR Pairing Payload for correct schema, cryptographic attributes, and expiration
 */
export function validatePairingPayload(payload: any): { valid: boolean; error?: string } {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Malformed pairing payload: expected object' };
  }

  if (typeof payload.protocolVersion !== 'string' || !payload.protocolVersion.startsWith('1.')) {
    return { valid: false, error: 'Incompatible WASI protocol version' };
  }

  if (!payload.sessionId || typeof payload.sessionId !== 'string' || payload.sessionId.length < 8) {
    return { valid: false, error: 'Invalid or missing session identifier' };
  }

  if (!payload.challenge || typeof payload.challenge !== 'string' || payload.challenge.length < 16) {
    return { valid: false, error: 'Missing or weak pairing security challenge' };
  }

  if (typeof payload.expiresAt !== 'number') {
    return { valid: false, error: 'Missing pairing session expiration timestamp' };
  }

  const now = Date.now();
  // Allow up to 30 seconds clock drift
  if (now > payload.expiresAt + 30000) {
    const secondsAgo = Math.round((now - payload.expiresAt) / 1000);
    return { valid: false, error: `This QR pairing code has expired (${secondsAgo}s ago). Please generate a new one on PC.` };
  }

  if (!Array.isArray(payload.endpoints) || payload.endpoints.length === 0) {
    return { valid: false, error: 'No reachable local Wi-Fi endpoints found in QR code' };
  }

  return { valid: true };
}

/**
 * Validates file transfer metadata before accepting an incoming transfer
 */
export function validateFileMetadata(meta: any): { valid: boolean; error?: string } {
  if (!meta || typeof meta !== 'object') {
    return { valid: false, error: 'Invalid file metadata' };
  }

  if (!meta.transferId || typeof meta.transferId !== 'string') {
    return { valid: false, error: 'Missing transfer ID' };
  }

  if (!meta.name || typeof meta.name !== 'string') {
    return { valid: false, error: 'Missing file name' };
  }

  if (typeof meta.size !== 'number' || meta.size < 0) {
    return { valid: false, error: 'Invalid file size' };
  }

  // Maximum single file size: 50 GB
  const MAX_FILE_SIZE = 50 * 1024 * 1024 * 1024;
  if (meta.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File exceeds maximum transfer size limit (50 GB)' };
  }

  if (typeof meta.chunkSize !== 'number' || meta.chunkSize < 1024 || meta.chunkSize > 4 * 1024 * 1024) {
    return { valid: false, error: 'Invalid chunk size (must be between 1KB and 4MB)' };
  }

  const expectedChunks = Math.ceil(meta.size / meta.chunkSize) || 1;
  if (meta.totalChunks !== expectedChunks) {
    return { valid: false, error: `Chunk count mismatch: expected ${expectedChunks}, got ${meta.totalChunks}` };
  }

  // SHA-256 check
  if (meta.sha256Checksum && !/^[a-fA-F0-9]{64}$/.test(meta.sha256Checksum)) {
    return { valid: false, error: 'Invalid SHA-256 checksum format' };
  }

  return { valid: true };
}
