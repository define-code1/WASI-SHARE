import { DeviceInfo } from './utils/device';
import { FileCategory } from './utils/fileHelpers';

export interface Peer {
  id: string;
  device: DeviceInfo;
  joinedAt: number;
}

export type TransferStatus = 'transferring' | 'completed' | 'failed' | 'cancelled';
export type TransferDirection = 'sent' | 'received';

export interface TransferItem {
  id: string;
  type: 'file' | 'text';
  name: string;
  size: number;
  mimeType: string;
  category: FileCategory;
  direction: TransferDirection;
  senderName: string;
  timestamp: number;
  status: TransferStatus;
  progress: number; // 0 - 100
  speed?: string; // e.g. "4.2 MB/s"
  blob?: Blob;
  blobUrl?: string;
  thumbnailUrl?: string;
  textPayload?: string;
  checksum?: string;
  isEncrypted: boolean;
  error?: string;
}

export interface ActiveTransferProgress {
  id: string;
  name: string;
  totalBytes: number;
  transferredBytes: number;
  direction: TransferDirection;
  speed: string;
  progressPercent: number;
  category: FileCategory;
}
