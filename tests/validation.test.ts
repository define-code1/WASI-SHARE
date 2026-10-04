import { describe, it, expect } from 'vitest';
import {
  sanitizeFilename,
  validatePairingPayload,
  validateFileMetadata,
} from '../packages/shared/validation';

describe('Filename Sanitization & Path Traversal Prevention', () => {
  it('strips directory traversal paths', () => {
    expect(sanitizeFilename('../../../secret.txt')).toBe('secret.txt');
    expect(sanitizeFilename('..\\..\\windows\\system32\\cmd.exe')).toBe('windows_system32_cmd.exe');
  });

  it('neutralizes Windows reserved device names', () => {
    expect(sanitizeFilename('CON.txt')).toBe('wasi_CON.txt');
    expect(sanitizeFilename('prn.pdf')).toBe('wasi_prn.pdf');
    expect(sanitizeFilename('aux')).toBe('wasi_aux');
    expect(sanitizeFilename('NUL.doc')).toBe('wasi_NUL.doc');
    expect(sanitizeFilename('com1.zip')).toBe('wasi_com1.zip');
  });

  it('removes illegal characters and control codes', () => {
    expect(sanitizeFilename('report<2026>:final*?.pdf')).toBe('report_2026__final__.pdf');
    expect(sanitizeFilename('evil\x00file.png')).toBe('evil_file.png');
  });

  it('handles empty or malformed names gracefully', () => {
    expect(sanitizeFilename('')).toBe('unnamed_file');
    expect(sanitizeFilename('   ')).toBe('unnamed_file');
  });
});

describe('QR Pairing Payload Validation', () => {
  const validPayload = {
    protocolVersion: '1.0.0',
    sessionId: 'session_abcdef123456',
    deviceName: 'Desktop-Workstation (Windows PC)',
    platform: 'windows',
    endpoints: ['http://192.168.1.100:49152'],
    port: 49152,
    challenge: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
    publicKeyFingerprint: 'sha256fingerprint1234567890abcdef',
    expiresAt: Date.now() + 300000,
  };

  it('accepts valid fresh pairing payload', () => {
    const res = validatePairingPayload(validPayload);
    expect(res.valid).toBe(true);
  });

  it('rejects expired pairing payload', () => {
    const expiredPayload = {
      ...validPayload,
      expiresAt: Date.now() - 60000, // 60s ago
    };
    const res = validatePairingPayload(expiredPayload);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('expired');
  });

  it('rejects payload with incompatible protocol version', () => {
    const invalidVersion = { ...validPayload, protocolVersion: '2.0.0' };
    const res = validatePairingPayload(invalidVersion);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Incompatible');
  });

  it('rejects payload with missing endpoints', () => {
    const noEndpoints = { ...validPayload, endpoints: [] };
    const res = validatePairingPayload(noEndpoints);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('endpoints');
  });
});

describe('File Transfer Metadata Validation', () => {
  it('validates correct file metadata', () => {
    const res = validateFileMetadata({
      transferId: 'wasi_test_123',
      name: 'annual_report.pdf',
      size: 512000,
      chunkSize: 256 * 1024,
      totalChunks: 2,
      sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    });
    expect(res.valid).toBe(true);
  });

  it('rejects files with chunk count mismatch', () => {
    const res = validateFileMetadata({
      transferId: 'wasi_test_123',
      name: 'corrupted.pdf',
      size: 1024 * 1024, // 1MB
      chunkSize: 256 * 1024,
      totalChunks: 99, // Should be 4
    });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('mismatch');
  });
});
