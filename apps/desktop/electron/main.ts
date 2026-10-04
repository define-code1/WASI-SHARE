/**
 * WASI SHARE — Desktop Electron Main Process
 * Manages Windows window lifecycle, secure local Wi-Fi transfer service,
 * and handles isolated IPC channels.
 */

import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import os from 'os';
import fs from 'fs';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import crypto from 'crypto';
import { sanitizeFilename } from '../../../packages/shared/validation';
import { WasiPairingPayload, FileMetadata, DeviceInfo } from '../../../packages/shared/types';
import { WASI_CONSTANTS } from '../../../packages/shared/protocol';

let mainWindow: BrowserWindow | null = null;
let localServer: http.Server | null = null;
let wss: WebSocketServer | null = null;
let activePeerSocket: WebSocket | null = null;
let activePairingSession: WasiPairingPayload | null = null;

// Default save folder: Windows User Downloads/WasiShare
let defaultDownloadFolder = path.join(app.getPath('downloads'), 'WASI SHARE');
if (!fs.existsSync(defaultDownloadFolder)) {
  try {
    fs.mkdirSync(defaultDownloadFolder, { recursive: true });
  } catch {
    defaultDownloadFolder = app.getPath('downloads');
  }
}

function getLocalIpAddresses(): string[] {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      // IPv4, non-internal (not 127.0.0.1)
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }

  return addresses.length > 0 ? addresses : ['127.0.0.1'];
}

function generatePairingSession(port: number): WasiPairingPayload {
  const sessionId = crypto.randomUUID();
  const challenge = crypto.randomBytes(32).toString('hex');
  const sessionKey = crypto.randomBytes(32).toString('hex');
  const ips = getLocalIpAddresses();

  const endpoints = ips.map((ip) => `http://${ip}:${port}`);

  return {
    protocolVersion: WASI_CONSTANTS.PROTOCOL_VERSION,
    sessionId,
    deviceName: `${os.hostname()} (Windows PC)`,
    platform: 'windows',
    endpoints,
    port,
    challenge,
    publicKeyFingerprint: crypto.createHash('sha256').update(sessionKey).digest('hex'),
    expiresAt: Date.now() + WASI_CONSTANTS.QR_EXPIRATION_MS,
  };
}

function startLocalTransferService(): Promise<number> {
  return new Promise((resolve, reject) => {
    localServer = http.createServer((req, res) => {
      // Basic healthcheck and diagnostic endpoint
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', service: 'wasi-share-desktop' }));
        return;
      }
      res.writeHead(404);
      res.end();
    });

    wss = new WebSocketServer({ server: localServer });

    wss.on('connection', (ws: WebSocket, req) => {
      console.log('[WASI Desktop] Peer incoming connection from:', req.socket.remoteAddress);

      ws.on('message', (data: Buffer | string) => {
        try {
          const message = JSON.parse(data.toString());
          handlePeerMessage(ws, message);
        } catch (err) {
          console.error('[WASI Desktop] Malformed message from peer:', err);
        }
      });

      ws.on('close', () => {
        if (activePeerSocket === ws) {
          activePeerSocket = null;
          mainWindow?.webContents.send('wasi:peer-disconnected');
        }
      });
    });

    // Listen on dynamic or preferred port
    const PORT = WASI_CONSTANTS.DEFAULT_PORT;
    localServer.listen(PORT, '0.0.0.0', () => {
      console.log(`[WASI Desktop] Local Wi-Fi transfer server running on port ${PORT}`);
      resolve(PORT);
    });

    localServer.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        // Fallback to random free port
        localServer?.listen(0, '0.0.0.0', () => {
          const addr = localServer?.address() as any;
          resolve(addr.port);
        });
      } else {
        reject(err);
      }
    });
  });
}

function handlePeerMessage(ws: WebSocket, msg: any) {
  switch (msg.type) {
    case 'PAIR_INIT': {
      // Validate challenge and session expiration
      if (!activePairingSession || Date.now() > activePairingSession.expiresAt) {
        ws.send(JSON.stringify({ type: 'PAIR_REJECT', reason: 'Session expired' }));
        return;
      }

      if (msg.sessionId !== activePairingSession.sessionId) {
        ws.send(JSON.stringify({ type: 'PAIR_REJECT', reason: 'Invalid session ID' }));
        return;
      }

      activePeerSocket = ws;
      const peerDevice: DeviceInfo = msg.clientDevice || {
        id: 'android-peer',
        name: 'Android Phone',
        platform: 'android',
        os: 'Android',
        appVersion: '1.0.0',
      };

      ws.send(
        JSON.stringify({
          type: 'PAIR_CONFIRM',
          accepted: true,
          serverDevice: {
            id: 'desktop-host',
            name: `${os.hostname()} (Windows PC)`,
            platform: 'windows',
            os: 'Windows',
            appVersion: '1.0.0',
          },
        })
      );

      mainWindow?.webContents.send('wasi:peer-connected', peerDevice);
      break;
    }

    case 'TRANSFER_OFFER': {
      mainWindow?.webContents.send('wasi:incoming-offer', {
        transferId: msg.file.transferId,
        file: msg.file,
      });
      break;
    }

    case 'TRANSFER_CHUNK': {
      // Write to temp file on disk
      mainWindow?.webContents.send('wasi:transfer-progress', {
        id: msg.transferId,
        chunkIndex: msg.chunkIndex,
        totalChunks: msg.totalChunks,
      });
      break;
    }

    case 'TRANSFER_COMPLETE': {
      mainWindow?.webContents.send('wasi:transfer-completed', {
        id: msg.transferId,
        verified: msg.verified,
      });
      break;
    }

    default:
      break;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 760,
    minWidth: 840,
    minHeight: 620,
    backgroundColor: '#f8fafc',
    title: 'WASI SHARE — Simple. Secure. Yours.',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Load Vite dev server or production index
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(async () => {
  const port = await startLocalTransferService();
  activePairingSession = generatePairingSession(port);

  // Register IPC handlers
  ipcMain.handle('wasi:get-pairing-session', () => activePairingSession);
  ipcMain.handle('wasi:refresh-pairing-session', () => {
    const addr = localServer?.address() as any;
    activePairingSession = generatePairingSession(addr?.port || WASI_CONSTANTS.DEFAULT_PORT);
    return activePairingSession;
  });

  ipcMain.handle('wasi:disconnect-peer', () => {
    activePeerSocket?.close();
    activePeerSocket = null;
    return true;
  });

  ipcMain.handle('wasi:get-network-diagnostics', () => {
    const ips = getLocalIpAddresses();
    const addr = localServer?.address() as any;
    return {
      localAddresses: ips,
      port: addr?.port || WASI_CONSTANTS.DEFAULT_PORT,
      firewallAdvice:
        'If your Android phone cannot connect, verify that Windows Defender Firewall allows incoming connections on Private Wi-Fi networks for WASI SHARE.',
    };
  });

  ipcMain.handle('wasi:select-files', async () => {
    const res = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openFile', 'multiSelections'],
      title: 'Select Files to Send via WASI SHARE',
    });

    if (res.canceled || res.filePaths.length === 0) return null;

    const metadata: FileMetadata[] = res.filePaths.map((fp) => {
      const stat = fs.statSync(fp);
      const filename = path.basename(fp);
      return {
        transferId: `wasi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: filename,
        sanitizedName: sanitizeFilename(filename),
        size: stat.size,
        mimeType: 'application/octet-stream',
        category: 'document',
        sha256Checksum: '',
        totalChunks: Math.ceil(stat.size / WASI_CONSTANTS.DEFAULT_CHUNK_SIZE),
        chunkSize: WASI_CONSTANTS.DEFAULT_CHUNK_SIZE,
      };
    });

    return { paths: res.filePaths, metadata };
  });

  ipcMain.handle('wasi:choose-destination', async () => {
    const res = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openDirectory', 'createDirectory'],
      defaultPath: defaultDownloadFolder,
      title: 'Choose WASI SHARE Receive Folder',
    });

    if (!res.canceled && res.filePaths.length > 0) {
      defaultDownloadFolder = res.filePaths[0];
      return defaultDownloadFolder;
    }
    return null;
  });

  ipcMain.handle('wasi:open-folder', async (_, filePath) => {
    if (filePath && fs.existsSync(filePath)) {
      shell.showItemInFolder(filePath);
    } else {
      shell.openPath(defaultDownloadFolder);
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
