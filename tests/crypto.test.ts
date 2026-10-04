import { describe, it, expect } from 'vitest';
import {
  generateSessionKey,
  encryptChunk,
  decryptChunk,
  computeSha256,
  exportKeyToString,
  importKeyFromString,
} from '../packages/shared/crypto';

describe('Cryptographic Engine & Integrity Verification', () => {
  it('encrypts and decrypts buffer using AES-256-GCM', async () => {
    const key = await generateSessionKey();
    const testString = 'WASI SHARE high-speed encrypted wireless payload';
    const encoder = new TextEncoder();
    const originalBuffer = encoder.encode(testString).buffer;

    const { iv, ciphertext } = await encryptChunk(key, originalBuffer);
    expect(iv).toBeDefined();
    expect(ciphertext).toBeDefined();

    const decryptedBuffer = await decryptChunk(key, iv, ciphertext);
    const decoder = new TextDecoder();
    const decryptedString = decoder.decode(decryptedBuffer);

    expect(decryptedString).toBe(testString);
  });

  it('exports and imports key losslessly', async () => {
    const originalKey = await generateSessionKey();
    const keyStr = await exportKeyToString(originalKey);
    const importedKey = await importKeyFromString(keyStr);

    const testData = new Uint8Array([1, 2, 3, 4, 5]).buffer;
    const { iv, ciphertext } = await encryptChunk(originalKey, testData);
    const decrypted = await decryptChunk(importedKey, iv, ciphertext);

    expect(new Uint8Array(decrypted)).toEqual(new Uint8Array(testData));
  });

  it('computes deterministic SHA-256 digests', async () => {
    const data = new TextEncoder().encode('WASI SHARE').buffer;
    const hash = await computeSha256(data);
    expect(hash).toHaveLength(64);
    expect(/^[a-f0-9]{64}$/.test(hash)).toBe(true);

    // Consistency check
    const hash2 = await computeSha256(data);
    expect(hash).toBe(hash2);
  });
});
