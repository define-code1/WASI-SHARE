import React, { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Film,
  Archive,
  FileCheck,
  Download,
  Eye,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  FolderOpen,
} from 'lucide-react';
import { TransferItem } from '../../packages/shared/types';
import { formatFileSize } from '../utils/fileHelpers';
import { PDFPreviewModal } from './PDFPreviewModal';
import { ImageLightboxModal } from './ImageLightboxModal';

interface TransferHistorySectionProps {
  transfers: TransferItem[];
  onDownloadItem: (item: TransferItem) => void;
  onClearHistory: () => void;
  onRetryTransfer?: (item: TransferItem) => void;
}

export const TransferHistorySection: React.FC<TransferHistorySectionProps> = ({
  transfers,
  onDownloadItem,
  onClearHistory,
  onRetryTransfer,
}) => {
  const [activePdf, setActivePdf] = useState<{ url: string; name: string; size: number } | null>(null);
  const [activeImage, setActiveImage] = useState<{ url: string; name: string; size: number } | null>(null);

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Transfer Activity</h3>
            <p className="text-xs text-slate-500">
              Recent bidirectional wireless transfers in this session
            </p>
          </div>

          {transfers.length > 0 && (
            <button
              onClick={onClearHistory}
              title="Clear transfer list"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {transfers.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 mx-auto flex items-center justify-center text-slate-400 mb-2">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-600">No transfers yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Files you send or receive will appear here with verification status.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {transfers.map((item) => {
              const isSent = item.direction === 'sent';
              const isCompleted = item.state === 'completed';
              const isFailed = item.state === 'failed';
              const isCancelled = item.state === 'cancelled';
              const isInterrupted = item.state === 'interrupted';

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 gap-3 hover:bg-slate-50 transition-colors"
                >
                  {/* File & Device info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                      {item.metadata.category === 'pdf' ? (
                        <FileText className="w-5 h-5 text-rose-500" />
                      ) : item.metadata.category === 'image' ? (
                        <ImageIcon className="w-5 h-5 text-emerald-500" />
                      ) : item.metadata.category === 'video' ? (
                        <Film className="w-5 h-5 text-purple-500" />
                      ) : item.metadata.category === 'archive' ? (
                        <Archive className="w-5 h-5 text-amber-500" />
                      ) : (
                        <FileCheck className="w-5 h-5 text-blue-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 truncate" title={item.metadata.name}>
                          {item.metadata.name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                            isSent
                              ? 'bg-blue-100/70 text-blue-700'
                              : 'bg-cyan-100/70 text-cyan-800'
                          }`}
                        >
                          {isSent ? 'Sent' : 'Received'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                        <span>{formatFileSize(item.metadata.size)}</span>
                        <span>•</span>
                        <span>{formatTimestamp(item.startedAt)}</span>
                        <span>•</span>
                        <span className="text-slate-600 font-sans">{item.peer.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-2 justify-end shrink-0">
                    {/* Status Badge */}
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    )}

                    {isFailed && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        <span>Failed</span>
                      </span>
                    )}

                    {isCancelled && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                        <span>Cancelled</span>
                      </span>
                    )}

                    {isInterrupted && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Interrupted</span>
                      </span>
                    )}

                    {/* Action buttons */}
                    {isCompleted && item.metadata.category === 'pdf' && item.blobUrl && (
                      <button
                        onClick={() =>
                          setActivePdf({
                            url: item.blobUrl!,
                            name: item.metadata.name,
                            size: item.metadata.size,
                          })
                        }
                        className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-center gap-1"
                        title="Preview PDF"
                      >
                        <Eye className="w-3.5 h-3.5 text-rose-500" />
                        <span className="hidden sm:inline">Preview</span>
                      </button>
                    )}

                    {isCompleted && item.metadata.category === 'image' && item.blobUrl && (
                      <button
                        onClick={() =>
                          setActiveImage({
                            url: item.blobUrl!,
                            name: item.metadata.name,
                            size: item.metadata.size,
                          })
                        }
                        className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-center gap-1"
                        title="View Photo"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="hidden sm:inline">View</span>
                      </button>
                    )}

                    {isCompleted && (item.blob || item.blobUrl) && (
                      <button
                        onClick={() => onDownloadItem(item)}
                        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    )}

                    {(isFailed || isInterrupted) && onRetryTransfer && (
                      <button
                        onClick={() => onRetryTransfer(item)}
                        className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PDFPreviewModal
        isOpen={!!activePdf}
        onClose={() => setActivePdf(null)}
        pdfUrl={activePdf?.url || null}
        filename={activePdf?.name || 'document.pdf'}
        filesize={activePdf?.size || 0}
      />

      <ImageLightboxModal
        isOpen={!!activeImage}
        onClose={() => setActiveImage(null)}
        imageUrl={activeImage?.url || null}
        filename={activeImage?.name || 'image.jpg'}
        filesize={activeImage?.size || 0}
      />
    </>
  );
};
