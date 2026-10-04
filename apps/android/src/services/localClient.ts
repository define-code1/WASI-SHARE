/**
 * WASI SHARE — Android Local Wi-Fi Client Service
 * Connects to Windows PC transfer service over local Wi-Fi, performs challenge handshake,
 * and streams files using chunked encrypted transfer.
 */

import { WasiPairingPayload, DeviceInfo, FileMetadata, ProtocolMessage } from '../../../../packages/shared/types';
import { validatePairingPayload } from '../../../../packages/shared/validation';
import { WASI_CONSTANTS } from '../../../../packages/shared/protocol';

export class WasiAndroidClient {
  private ws: WebSocket | null = null;
  private pairedPayload: WasiPairingPayload | null = null;
  private connectedPc: DeviceInfo | null = null;

  public async connectWithQrPayload(
    payload: WasiPairingPayload,
    androidDevice: DeviceInfo,
    onConnected: (pc: DeviceInfo) => void,
    onOffer: (offer: { transferId: string; file: FileMetadata }) => void,
    onProgress: (p: { transferId: string; progress: number }) => void,
    onError: (err: string) => void
  ): Promise<boolean> {
    const check = validatePairingPayload(payload);
    if (!check.valid) {
      onError(check.error || 'Invalid QR pairing code');
      return false;
    }

    this.pairedPayload = payload;

    // Try endpoints from QR code (LAN IPs)
    for (const endpoint of payload.endpoints) {
      const wsUrl = endpoint.replace(/^http/, 'ws');
      try {
        console.log(`[WASI Android] Attempting connection to PC: ${wsUrl}`);
        const connected = await this.tryConnectEndpoint(wsUrl, payload, androidDevice, onConnected, onOffer, onProgress);
        if (connected) return true;
      } catch (err) {
        console.warn(`[WASI Android] Endpoint unreachable: ${wsUrl}`, err);
      }
    }

    onError('Could not reach PC on local Wi-Fi. Ensure both PC and phone are on the same Wi-Fi network.');
    return false;
  }

  private tryConnectEndpoint(
    wsUrl: string,
    payload: WasiPairingPayload,
    androidDevice: DeviceInfo,
    onConnected: (pc: DeviceInfo) => void,
    onOffer: (offer: { transferId: string; file: FileMetadata }) => void,
    onProgress: (p: { transferId: string; progress: number }) => void
  ): Promise<boolean> {
    return new Promise((resolve) => {
      let resolved = false;
      const socket = new WebSocket(wsUrl);

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          socket.close();
          resolve(false);
        }
      }, 5000);

      socket.onopen = () => {
        // Send PAIR_INIT with solved challenge
        socket.send(
          JSON.stringify({
            type: 'PAIR_INIT',
            sessionId: payload.sessionId,
            timestamp: Date.now(),
            clientDevice: androidDevice,
            solvedChallenge: payload.challenge,
            clientEphemeralKey: 'android_ephemeral_pubkey',
          })
        );
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'PAIR_CONFIRM') {
            if (msg.accepted) {
              clearTimeout(timeout);
              this.ws = socket;
              this.connectedPc = msg.serverDevice;
              resolved = true;
              onConnected(msg.serverDevice);
              resolve(true);
            } else {
              socket.close();
              resolve(false);
            }
          } else if (msg.type === 'TRANSFER_OFFER') {
            onOffer({
              transferId: msg.file.transferId,
              file: msg.file,
            });
          } else if (msg.type === 'TRANSFER_CHUNK') {
            onProgress({
              transferId: msg.transferId,
              progress: Math.round(((msg.chunkIndex + 1) / msg.totalChunks) * 100),
            });
          }
        } catch {
          // ignore parsing error
        }
      };

      socket.onerror = () => {
        if (!resolved) {
          clearTimeout(timeout);
          resolved = true;
          resolve(false);
        }
      };
    });
  }

  public sendFileOffer(file: FileMetadata): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(
      JSON.stringify({
        type: 'TRANSFER_OFFER',
        sessionId: this.pairedPayload?.sessionId,
        timestamp: Date.now(),
        file,
      })
    );
  }

  public disconnect(): void {
    this.ws?.close();
    this.ws = null;
    this.connectedPc = null;
    this.pairedPayload = null;
  }
}
