/**
 * WASI SHARE — Cryptography & Integrity Verification
 * Implements AES-256-GCM authenticated chunk encryption and SHA-256 file integrity.
 */

// Buffer to Base64 utility
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Base64 to ArrayBuffer utility
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate random hex string for challenge
export function generateRandomHex(byteCount = 32): string {
  const arr = new Uint8Array(byteCount);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Generate Ephemeral AES-GCM 256 Key
export async function generateSessionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Export CryptoKey to Base64 Raw String
export async function exportKeyToString(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

// Import CryptoKey from Base64 Raw String
export async function importKeyFromString(keyBase64: string): Promise<CryptoKey> {
  const raw = base64ToArrayBuffer(keyBase64);
  return await crypto.subtle.importKey(
    'raw',
    raw,
    {
      name: 'AES-GCM',
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt a chunk buffer with AES-256-GCM
export async function encryptChunk(
  key: CryptoKey,
  data: BufferSource
): Promise<{ iv: string; ciphertext: string }> {
  // 96-bit IV standard for AES-GCM
  const ivArr = new Uint8Array(12);
  crypto.getRandomValues(ivArr);

  const encryptedBuffer = (await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: ivArr as BufferSource,
    },
    key,
    data
  )) as ArrayBuffer;

  return {
    iv: arrayBufferToBase64(ivArr.buffer),
    ciphertext: arrayBufferToBase64(encryptedBuffer),
  };
}

// Decrypt a chunk buffer with AES-256-GCM
export async function decryptChunk(
  key: CryptoKey,
  ivBase64: string,
  ciphertextBase64: string
): Promise<ArrayBuffer> {
  const ivBuffer = base64ToArrayBuffer(ivBase64);
  const ciphertextBuffer = base64ToArrayBuffer(ciphertextBase64);

  return (await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(ivBuffer) as BufferSource,
    },
    key,
    ciphertextBuffer as BufferSource
  )) as ArrayBuffer;
}

// Compute SHA-256 hash of an ArrayBuffer or Blob
export async function computeSha256(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
