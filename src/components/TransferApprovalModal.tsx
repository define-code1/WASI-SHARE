import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  Film,
  Archive,
  FileCheck,
  Check,
  X,
  ShieldCheck,
  Smartphone,
  FolderOpen,
} from 'lucide-react';
import { formatFileSize } from '../utils/fileHelpers';
import { FileMetadata, DeviceInfo } from '../../packages/shared/types';

interface TransferApprovalModalProps {
  isOpen: boolean;
  file: FileMetadata | null;
  sender: DeviceInfo | null;
  destinationFolder: string;
  onAccept: () => void;
  onReject: () => void;
  onChangeFolder?: () => void;
}

export const TransferApprovalModal: React.FC<TransferApprovalModalProps> = ({
  isOpen,
  file,
  sender,
  destinationFolder,
  onAccept,
  onReject,
  onChangeFolder,
}) => {
  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-7 text-slate-900 space-y-5">
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            <span>Incoming File Transfer Request</span>
          </div>

          <button
            onClick={onReject}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {sender ? sender.name : 'Connected Device'} wants to send a file
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            WASI SHARE requires your explicit approval before receiving any incoming data.
          </p>
        </div>

        {/* File Card Info */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-100/60 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            {file.category === 'pdf' ? (
              <FileText className="w-6 h-6 text-rose-500" />
            ) : file.category === 'image' ? (
              <ImageIcon className="w-6 h-6 text-emerald-500" />
            ) : file.category === 'video' ? (
              <Film className="w-6 h-6 text-purple-500" />
            ) : file.category === 'archive' ? (
              <Archive className="w-6 h-6 text-amber-500" />
            ) : (
              <FileCheck className="w-6 h-6 text-blue-500" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm text-slate-900 truncate" title={file.name}>
              {file.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-mono">
              <span>{formatFileSize(file.size)}</span>
              <span>•</span>
              <span className="capitalize">{file.category}</span>
            </div>

            {file.sha256Checksum && (
              <p className="text-[10px] text-slate-400 font-mono truncate mt-1">
                SHA-256: {file.sha256Checksum.substring(0, 16)}...
              </p>
            )}
          </div>
        </div>

        {/* Destination folder */}
        <div className="text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span>Destination folder:</span>
            {onChangeFolder && (
              <button
                onClick={onChangeFolder}
                className="text-blue-600 font-semibold hover:underline"
              >
                Change
              </button>
            )}
          </div>
          <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 font-mono text-[11px] truncate flex items-center gap-2">
            <FolderOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{destinationFolder}</span>
          </div>
        </div>

        {/* Security notice */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-emerald-50/60 border border-emerald-200/60 p-2.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Integrity will be cryptographically verified with SHA-256 before saving.</span>
        </div>

        {/* Accept & Reject Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={onReject}
            className="py-2.5 px-4 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Reject</span>
          </button>

          <button
            onClick={onAccept}
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/25 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Accept File</span>
          </button>
        </div>
      </div>
    </div>
  );
};
