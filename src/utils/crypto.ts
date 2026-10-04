// Web Crypto API AES-256-GCM End-to-End Encryption

export interface EncryptedPayload {
  iv: string; // base64
  data: string; // base64
}

// Generate random 256-bit AES-GCM key
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Export CryptoKey to raw base64 url-safe string
export async function exportKeyToString(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  const bytes = new Uint8Array(exported);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Import CryptoKey from base64 url-safe string
export async function importKeyFromString(keyStr: string): Promise<CryptoKey> {
  let base64 = keyStr.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return window.crypto.subtle.importKey(
    'raw',
    bytes,
    {
      name: 'AES-GCM',
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt an ArrayBuffer with AES-GCM
export async function encryptBuffer(
  key: CryptoKey,
  data: BufferSource
): Promise<{ iv: Uint8Array; cipherText: ArrayBuffer }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV standard for GCM
  const cipherText = (await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    data
  )) as ArrayBuffer;
  return { iv, cipherText };
}

// Decrypt an ArrayBuffer with AES-GCM
export async function decryptBuffer(
  key: CryptoKey,
  iv: Uint8Array,
  cipherText: ArrayBuffer
): Promise<ArrayBuffer> {
  return (await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    cipherText as BufferSource
  )) as ArrayBuffer;
}

// Encrypt a string (e.g. text/notes)
export async function encryptString(key: CryptoKey, text: string): Promise<EncryptedPayload> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const { iv, cipherText } = await encryptBuffer(key, data as BufferSource);

  const ivBase64 = uint8ArrayToBase64(iv);
  const dataBase64 = arrayBufferToBase64(cipherText);

  return {
    iv: ivBase64,
    data: dataBase64,
  };
}

// Decrypt a string
export async function decryptString(key: CryptoKey, payload: EncryptedPayload): Promise<string> {
  const iv = base64ToUint8Array(payload.iv);
  const cipherText = base64ToArrayBuffer(payload.data);
  const decrypted = await decryptBuffer(key, iv, cipherText);
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// Utilities for ArrayBuffer <-> Base64
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
