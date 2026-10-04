import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type (truecolor RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image scanlines
  // Each scanline: 1 byte filter type (0) + width * 3 bytes (RGB)
  const rowLength = 1 + width * 3;
  const rawData = Buffer.alloc(rowLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // filter none
    const progress = y / height;
    // Gradient from emerald (5, 150, 105) to dark teal (13, 148, 136) to slate (15, 23, 42)
    const curR = Math.round(r * (1 - progress * 0.7));
    const curG = Math.round(g * (1 - progress * 0.4));
    const curB = Math.round(b + (42 - b) * progress);

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;

      // Draw a circular inner emblem
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < width * 0.35 && dist > width * 0.32) {
        // white ring
        rawData[pixelOffset] = 255;
        rawData[pixelOffset + 1] = 255;
        rawData[pixelOffset + 2] = 255;
      } else if (dist < width * 0.12) {
        // white center core
        rawData[pixelOffset] = 255;
        rawData[pixelOffset + 1] = 255;
        rawData[pixelOffset + 2] = 255;
      } else {
        rawData[pixelOffset] = curR;
        rawData[pixelOffset + 1] = curG;
        rawData[pixelOffset + 2] = curB;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crcBuf = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = crc32(crcBuf);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

// Precomputed CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, 5, 150, 105));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, 5, 150, 105));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, 5, 150, 105));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, 5, 150, 105));

console.log('✅ Generated PWA icons successfully');
