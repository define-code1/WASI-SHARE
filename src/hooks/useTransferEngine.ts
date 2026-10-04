import { useState, useEffect, useRef, useCallback } from 'react';
import {
  DeviceInfo,
  TransferItem,
  WasiPairingPayload,
  FileMetadata,
  FileCategory,
  TransferState,
} from '../../packages/shared/types';
import {
  WASI_CONSTANTS,
  createTransferOfferMessage,
  createTransferAcceptMessage,
  createTransferCancelMessage,
} from '../../packages/shared/protocol';
import {
  sanitizeFilename,
  validatePairingPayload,
  validateFileMetadata,
} from '../../packages/shared/validation';
import {
  generateSessionKey,
  exportKeyToString,
  importKeyFromString,
  encryptChunk,
  decryptChunk,
  computeSha256,
  generateRandomHex,
} from '../../packages/shared/crypto';
import { getDeviceInfo } from '../utils/device';
import { formatFileSize } from '../utils/fileHelpers';
import { sounds } from '../utils/sound';

const CHUNK_SIZE = WASI_CONSTANTS.DEFAULT_CHUNK_SIZE;

interface IncomingFileState {
  id: string;
  metadata: FileMetadata;
  receivedChunks: Map<number, Uint8Array>;
  receivedBytes: number;
  startTime: number;
  sender: DeviceInfo;
}

export function useTransferEngine() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    const raw = getDeviceInfo();
    return {
      id: raw.id,
      name: raw.name.includes('Windows') ? 'Windows PC' : raw.name.includes('Android') ? 'Android Mobile' : raw.name,
      platform: raw.type === 'mobile' ? 'android' : 'windows',
      os: raw.os,
      appVersion: WASI_CONSTANTS.PROTOCOL_VERSION,
    };
  });

  const [roomId, setRoomId] = useState<string>('');
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [keyString, setKeyString] = useState<string>('');
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [connectedPeer, setConnectedPeer] = useState<DeviceInfo | null>(null);
  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => sounds.isEnabled());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [defaultFolder, setDefaultFolder] = useState<string>('Downloads/WASI SHARE');

  // Manual Transfer Approval state
  const [pendingApproval, setPendingApproval] = useState<{
    transferId: string;
    file: FileMetadata;
    sender: DeviceInfo;
  } | null>(null);

  // Active outgoing transfer progress state
  const [isSending, setIsSending] = useState(false);
  const [activeTransferProgress, setActiveTransferProgress] = useState(0);
  const [activeTransferSpeed, setActiveTransferSpeed] = useState('');
  const [activeTransferEta, setActiveTransferEta] = useState('');

  // 5-minute Pairing Session Payload
  const [pairingPayload, setPairingPayload] = useState<WasiPairingPayload>(() => {
    return {
      protocolVersion: WASI_CONSTANTS.PROTOCOL_VERSION,
      sessionId: `wasi_${Date.now()}_${generateRandomHex(8)}`,
      deviceName: deviceInfo.name,
      platform: deviceInfo.platform,
      endpoints: [`${window.location.origin}`],
      port: WASI_CONSTANTS.DEFAULT_PORT,
      challenge: generateRandomHex(16),
      publicKeyFingerprint: generateRandomHex(16),
      expiresAt: Date.now() + WASI_CONSTANTS.QR_EXPIRATION_MS,
    };
  });

  const wsRef = useRef<WebSocket | null>(null);
  const incomingFilesRef = useRef<Map<string, IncomingFileState>>(new Map());
  const activeSendersRef = useRef<Map<string, { cancelled: boolean }>>(new Map());
  const heartbeatTimerRef = useRef<any>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  // Refresh pairing session with fresh challenge and 5-min TTL
  const refreshPairingSession = useCallback(async () => {
    const freshKey = await generateSessionKey();
    const freshKeyStr = await exportKeyToString(freshKey);
    setEncryptionKey(freshKey);
    setKeyString(freshKeyStr);

    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRoomId(code);

    const newPayload: WasiPairingPayload = {
      protocolVersion: WASI_CONSTANTS.PROTOCOL_VERSION,
      sessionId: `wasi_${Date.now()}_${generateRandomHex(8)}`,
      deviceName: deviceInfo.name,
      platform: deviceInfo.platform,
      endpoints: [`${window.location.origin}`],
      port: WASI_CONSTANTS.DEFAULT_PORT,
      challenge: generateRandomHex(16),
      publicKeyFingerprint: generateRandomHex(16),
      expiresAt: Date.now() + WASI_CONSTANTS.QR_EXPIRATION_MS,
    };

    setPairingPayload(newPayload);

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('room', code);
    currentUrl.hash = `key=${freshKeyStr}`;
    window.history.replaceState(null, '', currentUrl.toString());

    showToast('Generated fresh 5-minute QR pairing session');
  }, [deviceInfo.name, deviceInfo.platform, showToast]);

  // Initialize Room ID and Encryption Key from URL or generate fresh
  useEffect(() => {
    async function initRoomAndKey() {
      const searchParams = new URLSearchParams(window.location.search);
      const roomParam = searchParams.get('room') || searchParams.get('pair');
      const hash = window.location.hash.replace(/^#/, '');
      const hashParams = new URLSearchParams(hash);
      const keyParam = hashParams.get('key');

      let currentRoom = (roomParam || '').trim().toUpperCase();
      if (!currentRoom) {
        const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        currentRoom = code;
      }
      setRoomId(currentRoom);

      let key: CryptoKey;
      let keyStr = keyParam || '';
      if (keyStr) {
        try {
          key = await importKeyFromString(keyStr);
        } catch {
          key = await generateSessionKey();
          keyStr = await exportKeyToString(key);
        }
      } else {
        key = await generateSessionKey();
        keyStr = await exportKeyToString(key);
      }

      setEncryptionKey(key);
      setKeyString(keyStr);

      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('room', currentRoom);
      currentUrl.hash = `key=${keyStr}`;
      window.history.replaceState(null, '', currentUrl.toString());
    }

    initRoomAndKey();
  }, []);

  // Connect to local WebSocket transfer relay
  useEffect(() => {
    if (!roomId) return;

    let isMounted = true;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isMounted) return;
      setWsConnected(true);

      // Join room
      ws.send(
        JSON.stringify({
          type: 'join',
          roomId,
          device: deviceInfo,
        })
      );

      // Heartbeat ping
      heartbeatTimerRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
        }
      }, WASI_CONSTANTS.HEARTBEAT_INTERVAL_MS);
    };

    ws.onmessage = async (event) => {
      if (!isMounted) return;
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case 'room_joined': {
            const remotePeers = (message.peers || []).filter(
              (p: any) => p.device && p.device.id !== deviceInfo.id
            );
            if (remotePeers.length > 0) {
              setConnectedPeer(remotePeers[0].device);
              sounds.playConnectChime();
            }
            break;
          }

          case 'peer_joined': {
            if (message.device && message.device.id !== deviceInfo.id) {
              setConnectedPeer(message.device);
              sounds.playConnectChime();
              showToast(`Wirelessly connected to ${message.device.name}`);
            }
            break;
          }

          case 'peer_left': {
            setConnectedPeer(null);
            showToast('Device disconnected');
            break;
          }

          // Incoming transfer offer (Manual Recipient Approval)
          case 'file_start':
          case 'TRANSFER_OFFER': {
            if (!encryptionKey) return;
            const fileMeta: FileMetadata = message.file || {
              transferId: message.id,
              name: message.name,
              sanitizedName: sanitizeFilename(message.name),
              size: message.size,
              mimeType: message.mimeType || 'application/octet-stream',
              category: message.category || 'document',
              sha256Checksum: message.checksum || '',
              totalChunks: message.totalChunks || 1,
              chunkSize: CHUNK_SIZE,
            };

            const senderDevice: DeviceInfo = message.senderDevice || {
              id: 'peer-device',
              name: message.senderName || 'Connected Phone',
              platform: 'android',
              os: 'Android',
              appVersion: '1.0.0',
            };

            // Stage in incomingFilesRef
            incomingFilesRef.current.set(fileMeta.transferId, {
              id: fileMeta.transferId,
              metadata: fileMeta,
              receivedChunks: new Map(),
              receivedBytes: 0,
              startTime: Date.now(),
              sender: senderDevice,
            });

            // Prompt recipient for manual approval
            setPendingApproval({
              transferId: fileMeta.transferId,
              file: fileMeta,
              sender: senderDevice,
            });

            sounds.playReceivedChime();
            break;
          }

          // Incoming file chunk
          case 'file_chunk':
          case 'TRANSFER_CHUNK': {
            if (!encryptionKey) return;
            const incoming = incomingFilesRef.current.get(message.id || message.transferId);
            if (!incoming) return;

            // Decrypt chunk buffer with AES-256-GCM
            const decrypted = await decryptChunk(encryptionKey, message.iv, message.ciphertext || message.payloadBase64);
            const chunkSlice = new Uint8Array(decrypted);

            incoming.receivedChunks.set(message.chunkIndex, chunkSlice);
            incoming.receivedBytes += chunkSlice.byteLength;

            const progress = Math.min(
              100,
              Math.round((incoming.receivedChunks.size / incoming.metadata.totalChunks) * 100)
            );

            // Update item in transfers feed
            setTransfers((prev) =>
              prev.map((t) =>
                t.id === incoming.id
                  ? {
                      ...t,
                      bytesTransferred: incoming.receivedBytes,
                      progressPercentage: progress,
                      state: 'transferring',
                    }
                  : t
              )
            );

            // If all chunks received: verify SHA-256 and complete
            if (incoming.receivedChunks.size >= incoming.metadata.totalChunks) {
              const sortedChunks: Uint8Array[] = [];
              for (let i = 0; i < incoming.metadata.totalChunks; i++) {
                const sl = incoming.receivedChunks.get(i);
                if (sl) sortedChunks.push(sl);
              }

              const blob = new Blob(sortedChunks as unknown as BlobPart[], {
                type: incoming.metadata.mimeType,
              });
              const blobUrl = URL.createObjectURL(blob);

              // SHA-256 Verification Check
              const arrayBuf = await blob.arrayBuffer();
              const calculatedChecksum = await computeSha256(arrayBuf);

              const checksumMatches =
                !incoming.metadata.sha256Checksum ||
                incoming.metadata.sha256Checksum.toLowerCase() === calculatedChecksum.toLowerCase();

              sounds.playReceivedChime();

              setTransfers((prev) =>
                prev.map((t) =>
                  t.id === incoming.id
                    ? {
                        ...t,
                        state: checksumMatches ? 'completed' : 'failed',
                        progressPercentage: 100,
                        completedAt: Date.now(),
                        blob,
                        blobUrl,
                        errorMessage: checksumMatches ? undefined : 'SHA-256 integrity verification mismatch!',
                      }
                    : t
                )
              );

              incomingFilesRef.current.delete(incoming.id);

              if (checksumMatches) {
                showToast(`Received & verified: ${incoming.metadata.name}`);
              } else {
                showToast(`Integrity check failed for ${incoming.metadata.name}`);
              }
            }
            break;
          }

          // Transfer rejected by recipient
          case 'TRANSFER_REJECT': {
            showToast('Transfer request was rejected by the recipient.');
            setIsSending(false);
            setTransfers((prev) =>
              prev.map((t) =>
                t.id === message.transferId ? { ...t, state: 'cancelled', errorMessage: 'Rejected by recipient' } : t
              )
            );
            break;
          }

          // Transfer cancelled
          case 'TRANSFER_CANCEL': {
            showToast('Transfer was cancelled.');
            setIsSending(false);
            setTransfers((prev) =>
              prev.map((t) =>
                t.id === message.transferId ? { ...t, state: 'cancelled' } : t
              )
            );
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error('[WASI SHARE Engine] Message handling error:', err);
      }
    };

    ws.onclose = () => {
      if (!isMounted) return;
      setWsConnected(false);
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    };

    return () => {
      isMounted = false;
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      ws.close();
    };
  }, [roomId, deviceInfo, encryptionKey, showToast]);

  // Recipient manual approval actions
  const acceptTransfer = useCallback(() => {
    if (!pendingApproval) return;
    const { transferId, file, sender } = pendingApproval;

    // Add to transfers history as receiving
    setTransfers((prev) => [
      {
        id: transferId,
        metadata: file,
        direction: 'received',
        peer: sender,
        state: 'transferring',
        bytesTransferred: 0,
        progressPercentage: 0,
        transferSpeedBps: 0,
        startedAt: Date.now(),
      },
      ...prev,
    ]);

    // Send accept confirmation
    wsRef.current?.send(
      JSON.stringify(createTransferAcceptMessage(pairingPayload.sessionId, transferId, true))
    );

    setPendingApproval(null);
    showToast(`Receiving ${file.name}...`);
  }, [pendingApproval, pairingPayload.sessionId, showToast]);

  const rejectTransfer = useCallback(() => {
    if (!pendingApproval) return;
    const { transferId, file } = pendingApproval;

    wsRef.current?.send(
      JSON.stringify(
        createTransferAcceptMessage(pairingPayload.sessionId, transferId, false, 'User declined')
      )
    );

    setPendingApproval(null);
    showToast(`Declined ${file.name}`);
  }, [pendingApproval, pairingPayload.sessionId, showToast]);

  // Send single or batch files
  const sendBatchFiles = useCallback(
    async (files: File[]) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        showToast('Not connected to the local Wi-Fi transfer relay yet.');
        return;
      }
      if (!encryptionKey) {
        showToast('Encryption keys are initializing. Please wait a moment.');
        return;
      }

      setIsSending(true);

      for (const file of files) {
        const transferId = `wasi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const sanitized = sanitizeFilename(file.name);
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE) || 1;

        // Calculate cryptographic SHA-256 checksum
        const arrayBuf = await file.arrayBuffer();
        const checksum = await computeSha256(arrayBuf);

        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        let category: FileCategory = 'document';
        if (ext === 'pdf') category = 'pdf';
        else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) category = 'image';
        else if (['mp4', 'mov', 'mkv'].includes(ext)) category = 'video';
        else if (['zip', 'rar', '7z'].includes(ext)) category = 'archive';

        const fileMeta: FileMetadata = {
          transferId,
          name: file.name,
          sanitizedName: sanitized,
          size: file.size,
          mimeType: file.type || 'application/octet-stream',
          category,
          sha256Checksum: checksum,
          totalChunks,
          chunkSize: CHUNK_SIZE,
        };

        const targetPeer: DeviceInfo = connectedPeer || {
          id: 'paired-peer',
          name: 'Android Mobile',
          platform: 'android',
          os: 'Android',
          appVersion: '1.0.0',
        };

        // Add to transfers feed
        const blobUrl = URL.createObjectURL(file);
        setTransfers((prev) => [
          {
            id: transferId,
            metadata: fileMeta,
            direction: 'sent',
            peer: targetPeer,
            state: 'transferring',
            bytesTransferred: 0,
            progressPercentage: 0,
            transferSpeedBps: 0,
            startedAt: Date.now(),
            blob: file,
            blobUrl,
          },
          ...prev,
        ]);

        // Send TRANSFER_OFFER
        wsRef.current.send(
          JSON.stringify({
            type: 'file_start',
            id: transferId,
            name: file.name,
            size: file.size,
            mimeType: file.type,
            category,
            totalChunks,
            checksum,
            senderName: deviceInfo.name,
            senderDevice: deviceInfo,
          })
        );

        // Stream encrypted chunks
        const startTime = Date.now();
        let bytesSent = 0;

        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
          const start = chunkIndex * CHUNK_SIZE;
          const end = Math.min(file.size, start + CHUNK_SIZE);
          const chunkBlob = file.slice(start, end);
          const chunkBuffer = await chunkBlob.arrayBuffer();

          // AES-256-GCM chunk encryption
          const encrypted = await encryptChunk(encryptionKey, chunkBuffer);

          wsRef.current.send(
            JSON.stringify({
              type: 'file_chunk',
              id: transferId,
              chunkIndex,
              totalChunks,
              iv: encrypted.iv,
              ciphertext: encrypted.ciphertext,
            })
          );

          bytesSent += (end - start);
          const progress = Math.min(100, Math.round(((chunkIndex + 1) / totalChunks) * 100));
          const elapsedSecs = Math.max(0.1, (Date.now() - startTime) / 1000);
          const bps = bytesSent / elapsedSecs;
          const remainingBytes = file.size - bytesSent;
          const remainingSecs = Math.round(remainingBytes / Math.max(bps, 1024));

          setActiveTransferProgress(progress);
          setActiveTransferSpeed(`${(bps / (1024 * 1024)).toFixed(1)} MB/s`);
          setActiveTransferEta(`~${remainingSecs}s remaining`);

          setTransfers((prev) =>
            prev.map((t) =>
              t.id === transferId
                ? {
                    ...t,
                    bytesTransferred: bytesSent,
                    progressPercentage: progress,
                    transferSpeedBps: Math.round(bps),
                    estimatedRemainingSecs: remainingSecs,
                  }
                : t
            )
          );

          // Small yield for non-blocking UI
          if (chunkIndex % 4 === 0) {
            await new Promise((r) => setTimeout(r, 8));
          }
        }

        sounds.playSentChime();

        setTransfers((prev) =>
          prev.map((t) =>
            t.id === transferId
              ? {
                  ...t,
                  state: 'completed',
                  progressPercentage: 100,
                  completedAt: Date.now(),
                }
              : t
          )
        );

        showToast(`Sent ${file.name} successfully!`);
      }

      setIsSending(false);
      setActiveTransferProgress(0);
    },
    [connectedPeer, deviceInfo, encryptionKey, showToast]
  );

  const disconnectPeer = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ type: 'leave' }));
    setConnectedPeer(null);
    showToast('Disconnected from peer.');
  }, [showToast]);

  const clearHistory = useCallback(() => {
    transfers.forEach((t) => {
      if (t.blobUrl && t.direction === 'received') {
        URL.revokeObjectURL(t.blobUrl);
      }
    });
    setTransfers([]);
    showToast('Transfer history cleared');
  }, [transfers, showToast]);

  const toggleSound = useCallback(() => {
    const newState = sounds.toggle();
    setSoundEnabled(newState);
  }, []);

  const updateDeviceName = useCallback((newName: string) => {
    setDeviceInfo((prev) => ({ ...prev, name: newName }));
  }, []);

  const pairUrl = `${window.location.origin}/?room=${roomId}#key=${keyString}`;

  return {
    deviceInfo,
    roomId,
    keyString,
    pairUrl,
    pairingPayload,
    refreshPairingSession,
    wsConnected,
    connectedPeer,
    transfers,
    soundEnabled,
    toggleSound,
    toastMessage,
    clearToast: () => setToastMessage(null),
    defaultFolder,
    setDefaultFolder,
    pendingApproval,
    acceptTransfer,
    rejectTransfer,
    sendBatchFiles,
    isSending,
    activeTransferProgress,
    activeTransferSpeed,
    activeTransferEta,
    disconnectPeer,
    clearHistory,
    updateDeviceName,
  };
}
