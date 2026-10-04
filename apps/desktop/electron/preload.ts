/**
 * WASI SHARE — Desktop Electron Preload Script
 * 
 * Strict Security Architecture:
 * - contextIsolation: true
 * - nodeIntegration: false
 * - Exposes only narrowly scoped, validated IPC methods to the renderer window.
 * - Does NOT expose raw fs, child_process, or network sockets to the UI.
 */

import { contextBridge, ipcRenderer } from 'electron';
import { WasiPairingPayload, FileMetadata, TransferItem, DeviceInfo } from '../../../packages/shared/types';

export interface WasiDesktopAPI {
  // Pairing & Network
  getPairingSession: () => Promise<WasiPairingPayload>;
  refreshPairingSession: () => Promise<WasiPairingPayload>;
  disconnectPeer: () => Promise<void>;
  getNetworkDiagnostics: () => Promise<{
    localAddresses: string[];
    port: number;
    firewallAdvice: string;
  }>;

  // File Transfer Actions
  selectFilesToSend: () => Promise<{ paths: string[]; metadata: FileMetadata[] } | null>;
  startSendTransfer: (filePaths: string[]) => Promise<void>;
  acceptIncomingTransfer: (transferId: string, destinationPath?: string) => Promise<boolean>;
  rejectIncomingTransfer: (transferId: string, reason?: string) => Promise<void>;
  cancelTransfer: (transferId: string) => Promise<void>;

  // Storage
  chooseDestinationFolder: () => Promise<string | null>;
  openFolderInExplorer: (filePath?: string) => Promise<void>;

  // Event Subscriptions
  onPeerConnected: (callback: (peer: DeviceInfo) => void) => () => void;
  onPeerDisconnected: (callback: () => void) => () => void;
  onIncomingOffer: (callback: (offer: { transferId: string; file: FileMetadata; peer: DeviceInfo }) => void) => () => void;
  onTransferProgress: (callback: (item: Partial<TransferItem>) => void) => () => void;
  onTransferCompleted: (callback: (item: TransferItem) => void) => () => void;
  onTransferError: (callback: (error: { transferId: string; message: string }) => void) => () => void;
}

const wasiDesktopAPI: WasiDesktopAPI = {
  getPairingSession: () => ipcRenderer.invoke('wasi:get-pairing-session'),
  refreshPairingSession: () => ipcRenderer.invoke('wasi:refresh-pairing-session'),
  disconnectPeer: () => ipcRenderer.invoke('wasi:disconnect-peer'),
  getNetworkDiagnostics: () => ipcRenderer.invoke('wasi:get-network-diagnostics'),

  selectFilesToSend: () => ipcRenderer.invoke('wasi:select-files'),
  startSendTransfer: (filePaths) => ipcRenderer.invoke('wasi:start-send', filePaths),
  acceptIncomingTransfer: (transferId, destinationPath) =>
    ipcRenderer.invoke('wasi:accept-transfer', transferId, destinationPath),
  rejectIncomingTransfer: (transferId, reason) =>
    ipcRenderer.invoke('wasi:reject-transfer', transferId, reason),
  cancelTransfer: (transferId) => ipcRenderer.invoke('wasi:cancel-transfer', transferId),

  chooseDestinationFolder: () => ipcRenderer.invoke('wasi:choose-destination'),
  openFolderInExplorer: (filePath) => ipcRenderer.invoke('wasi:open-folder', filePath),

  onPeerConnected: (callback) => {
    const handler = (_: any, peer: DeviceInfo) => callback(peer);
    ipcRenderer.on('wasi:peer-connected', handler);
    return () => ipcRenderer.removeListener('wasi:peer-connected', handler);
  },
  onPeerDisconnected: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('wasi:peer-disconnected', handler);
    return () => ipcRenderer.removeListener('wasi:peer-disconnected', handler);
  },
  onIncomingOffer: (callback) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on('wasi:incoming-offer', handler);
    return () => ipcRenderer.removeListener('wasi:incoming-offer', handler);
  },
  onTransferProgress: (callback) => {
    const handler = (_: any, progress: any) => callback(progress);
    ipcRenderer.on('wasi:transfer-progress', handler);
    return () => ipcRenderer.removeListener('wasi:transfer-progress', handler);
  },
  onTransferCompleted: (callback) => {
    const handler = (_: any, item: any) => callback(item);
    ipcRenderer.on('wasi:transfer-completed', handler);
    return () => ipcRenderer.removeListener('wasi:transfer-completed', handler);
  },
  onTransferError: (callback) => {
    const handler = (_: any, err: any) => callback(err);
    ipcRenderer.on('wasi:transfer-error', handler);
    return () => ipcRenderer.removeListener('wasi:transfer-error', handler);
  },
};

contextBridge.exposeInMainWorld('wasiDesktopAPI', wasiDesktopAPI);
