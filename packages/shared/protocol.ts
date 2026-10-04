/**
 * WASI SHARE — Protocol Definitions & Message Creators
 */

import {
  ProtocolMessage,
  DeviceInfo,
  FileMetadata,
  PairInitMessage,
  PairConfirmMessage,
  TransferOfferMessage,
  TransferAcceptMessage,
  TransferChunkMessage,
  ChunkAckMessage,
  TransferVerifyMessage,
  TransferCompleteMessage,
  TransferCancelMessage,
  HeartbeatMessage,
  HeartbeatAckMessage,
} from './types';

export const WASI_CONSTANTS = {
  PROTOCOL_VERSION: '1.0.0',
  DEFAULT_CHUNK_SIZE: 256 * 1024, // 256 KiB chunk size
  MAX_CHUNK_SIZE: 1024 * 1024,     // 1 MiB chunk size
  QR_EXPIRATION_MS: 5 * 60 * 1000, // 5 minutes
  HEARTBEAT_INTERVAL_MS: 10 * 1000,
  HEARTBEAT_TIMEOUT_MS: 25 * 1000,
  DEFAULT_PORT: 49152,
};

export function createPairInitMessage(
  sessionId: string,
  clientDevice: DeviceInfo,
  solvedChallenge: string,
  clientEphemeralKey: string
): PairInitMessage {
  return {
    type: 'PAIR_INIT',
    sessionId,
    timestamp: Date.now(),
    clientDevice,
    solvedChallenge,
    clientEphemeralKey,
  };
}

export function createPairConfirmMessage(
  sessionId: string,
  serverDevice: DeviceInfo,
  accepted: boolean,
  serverEphemeralKey: string,
  reason?: string
): PairConfirmMessage {
  return {
    type: 'PAIR_CONFIRM',
    sessionId,
    timestamp: Date.now(),
    serverDevice,
    accepted,
    serverEphemeralKey,
    reason,
  };
}

export function createTransferOfferMessage(
  sessionId: string,
  file: FileMetadata,
  thumbnailBase64?: string
): TransferOfferMessage {
  return {
    type: 'TRANSFER_OFFER',
    sessionId,
    timestamp: Date.now(),
    file,
    thumbnailBase64,
  };
}

export function createTransferAcceptMessage(
  sessionId: string,
  transferId: string,
  accepted: boolean,
  reason?: string
): TransferAcceptMessage {
  return {
    type: 'TRANSFER_ACCEPT',
    sessionId,
    timestamp: Date.now(),
    transferId,
    accepted,
    reason,
  };
}

export function createTransferChunkMessage(
  sessionId: string,
  transferId: string,
  chunkIndex: number,
  totalChunks: number,
  payloadBase64: string,
  iv: string
): TransferChunkMessage {
  return {
    type: 'TRANSFER_CHUNK',
    sessionId,
    timestamp: Date.now(),
    transferId,
    chunkIndex,
    totalChunks,
    payloadBase64,
    iv,
  };
}

export function createChunkAckMessage(
  sessionId: string,
  transferId: string,
  chunkIndex: number
): ChunkAckMessage {
  return {
    type: 'CHUNK_ACK',
    sessionId,
    timestamp: Date.now(),
    transferId,
    chunkIndex,
  };
}

export function createTransferVerifyMessage(
  sessionId: string,
  transferId: string,
  sha256Checksum: string
): TransferVerifyMessage {
  return {
    type: 'TRANSFER_VERIFY',
    sessionId,
    timestamp: Date.now(),
    transferId,
    sha256Checksum,
  };
}

export function createTransferCompleteMessage(
  sessionId: string,
  transferId: string,
  verified: boolean,
  message?: string
): TransferCompleteMessage {
  return {
    type: 'TRANSFER_COMPLETE',
    sessionId,
    timestamp: Date.now(),
    transferId,
    verified,
    message,
  };
}

export function createTransferCancelMessage(
  sessionId: string,
  transferId: string,
  reason: string
): TransferCancelMessage {
  return {
    type: 'TRANSFER_CANCEL',
    sessionId,
    timestamp: Date.now(),
    transferId,
    reason,
  };
}

export function createHeartbeatMessage(sessionId: string): HeartbeatMessage {
  return {
    type: 'HEARTBEAT',
    sessionId,
    timestamp: Date.now(),
  };
}

export function createHeartbeatAckMessage(sessionId: string): HeartbeatAckMessage {
  return {
    type: 'HEARTBEAT_ACK',
    sessionId,
    timestamp: Date.now(),
  };
}
