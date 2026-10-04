/**
 * WASI SHARE — Shared Protocol and Model Types
 * Used across Windows Desktop (Electron), Android (React Native), and Shared Transfer Engine.
 */

export type PlatformType = 'windows' | 'android' | 'web';

export interface DeviceInfo {
  id: string;
  name: string;
  platform: PlatformType;
  os: string;
  appVersion: string;
  ipAddress?: string;
  port?: number;
}

export type TransferState =
  | 'idle'
  | 'pairing'
  | 'connected'
  | 'awaiting_approval'
  | 'preparing'
  | 'transferring'
  | 'verifying'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'interrupted';

export type FileCategory =
  | 'pdf'
  | 'image'
  | 'video'
  | 'audio'
  | 'archive'
  | 'document'
  | 'code'
  | 'other';

/**
 * QR Code Pairing Payload (Short-lived, replay-resistant)
 */
export interface WasiPairingPayload {
  protocolVersion: string; // e.g. '1.0'
  sessionId: string;       // Unique session UUID
  deviceName: string;      // "Windows PC - Desktop-4A9B"
  platform: PlatformType;  // 'windows'
  endpoints: string[];     // Array of local LAN IPs, e.g. ['http://192.168.1.105:49152']
  port: number;
  challenge: string;       // Cryptographically secure 256-bit random challenge (hex)
  publicKeyFingerprint: string; // SHA-256 fingerprint of ephemeral session key
  expiresAt: number;       // Unix epoch ms (strictly valid for 5 minutes)
}

/**
 * Metadata for a file in transfer
 */
export interface FileMetadata {
  transferId: string;
  name: string;
  sanitizedName: string;
  size: number;
  mimeType: string;
  category: FileCategory;
  sha256Checksum: string;
  totalChunks: number;
  chunkSize: number;
}

/**
 * An item in the user's active or recent transfer history
 */
export interface TransferItem {
  id: string;
  metadata: FileMetadata;
  direction: 'sent' | 'received';
  peer: DeviceInfo;
  state: TransferState;
  bytesTransferred: number;
  progressPercentage: number;
  transferSpeedBps: number;
  estimatedRemainingSecs?: number;
  startedAt: number;
  completedAt?: number;
  errorMessage?: string;
  blob?: Blob;
  blobUrl?: string;
  savePath?: string;
}

/**
 * Low-level Wire Protocol Messages
 */
export type ProtocolMessageType =
  | 'PAIR_INIT'
  | 'PAIR_CONFIRM'
  | 'PAIR_REJECT'
  | 'HEARTBEAT'
  | 'HEARTBEAT_ACK'
  | 'TRANSFER_OFFER'
  | 'TRANSFER_ACCEPT'
  | 'TRANSFER_REJECT'
  | 'TRANSFER_CHUNK'
  | 'CHUNK_ACK'
  | 'TRANSFER_VERIFY'
  | 'TRANSFER_COMPLETE'
  | 'TRANSFER_CANCEL'
  | 'DISCONNECT';

export interface BaseProtocolMessage {
  type: ProtocolMessageType;
  sessionId: string;
  timestamp: number;
}

export interface PairInitMessage extends BaseProtocolMessage {
  type: 'PAIR_INIT';
  clientDevice: DeviceInfo;
  solvedChallenge: string;
  clientEphemeralKey: string;
}

export interface PairConfirmMessage extends BaseProtocolMessage {
  type: 'PAIR_CONFIRM';
  serverDevice: DeviceInfo;
  accepted: boolean;
  reason?: string;
  serverEphemeralKey: string;
}

export interface TransferOfferMessage extends BaseProtocolMessage {
  type: 'TRANSFER_OFFER';
  file: FileMetadata;
  thumbnailBase64?: string;
}

export interface TransferAcceptMessage extends BaseProtocolMessage {
  type: 'TRANSFER_ACCEPT';
  transferId: string;
  accepted: boolean;
  reason?: string;
  startingChunkIndex?: number;
}

export interface TransferChunkMessage extends BaseProtocolMessage {
  type: 'TRANSFER_CHUNK';
  transferId: string;
  chunkIndex: number;
  totalChunks: number;
  payloadBase64: string;
  iv: string; // AES-GCM IV
}

export interface ChunkAckMessage extends BaseProtocolMessage {
  type: 'CHUNK_ACK';
  transferId: string;
  chunkIndex: number;
}

export interface TransferVerifyMessage extends BaseProtocolMessage {
  type: 'TRANSFER_VERIFY';
  transferId: string;
  sha256Checksum: string;
}

export interface TransferCompleteMessage extends BaseProtocolMessage {
  type: 'TRANSFER_COMPLETE';
  transferId: string;
  verified: boolean;
  message?: string;
}

export interface TransferCancelMessage extends BaseProtocolMessage {
  type: 'TRANSFER_CANCEL';
  transferId: string;
  reason: string;
}

export interface HeartbeatMessage extends BaseProtocolMessage {
  type: 'HEARTBEAT';
}

export interface HeartbeatAckMessage extends BaseProtocolMessage {
  type: 'HEARTBEAT_ACK';
}

export type ProtocolMessage =
  | PairInitMessage
  | PairConfirmMessage
  | TransferOfferMessage
  | TransferAcceptMessage
  | TransferChunkMessage
  | ChunkAckMessage
  | TransferVerifyMessage
  | TransferCompleteMessage
  | TransferCancelMessage
  | HeartbeatMessage
  | HeartbeatAckMessage;
