import React, { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Download,
  Eye,
  Check,
  CheckCheck,
  Copy,
  Share2,
  ExternalLink,
  Lock,
  FileArchive,
  Film,
  Music,
  File,
  Sparkles,
} from 'lucide-react';
import { TransferItem } from '../types';
import { formatFileSize, shareFile } from '../utils/fileHelpers';
import { PDFPreviewModal } from './PDFPreviewModal';
import { ImageLightboxModal } from './ImageLightboxModal';

interface TransferFeedProps {
  transfers: TransferItem[];
  onDownload: (item: TransferItem) => void;
}

export const TransferFeed: React.FC<TransferFeedProps> = ({ transfers, onDownload }) => {
  // Modal states
  const [activePdf, setActivePdf] = useState<{ url: string; name: string; size: number } | null>(null);
  const [activeImage, setActiveImage] = useState<{ url: string; name: string; size: number } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-4xl mx-auto w-full">
        {/* End-to-End Encryption Banner (WhatsApp Style) */}
        <div className="flex justify-center my-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-950/30 border border-amber-500/20 text-amber-200/90 text-xs text-center max-w-md shadow-sm">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              Files and notes are end-to-end encrypted with AES-256. Only your paired devices hold the key.
            </span>
          </div>
        </div>

        {transfers.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-stone-800/80 border border-stone-700/80 mx-auto flex items-center justify-center text-stone-500 mb-4 shadow-inner">
              <Sparkles className="w-8 h-8 text-emerald-400/60" />
            </div>
            <h3 className="text-stone-300 font-semibold text-base mb-1">
              Ready for Instant Transfers
            </h3>
            <p className="text-stone-500 text-xs max-w-sm mx-auto">
              Select or drop PDF documents, photos, or files above to beam them wirelessly between your PC and Mobile.
            </p>
          </div>
        ) : (
          transfers.map((item) => {
            const isSent = item.direction === 'sent';

            return (
              <div
                key={item.id}
                className={`flex flex-col ${isSent ? 'items-end' : 'items-start'}`}
              >
                {/* Sender tag */}
                <span className="text-[11px] text-stone-500 px-1 mb-1 font-medium">
                  {isSent ? 'You' : item.senderName}
                </span>

                {/* Main Card Bubble */}
                <div
                  className={`relative rounded-2xl p-3.5 sm:p-4 max-w-md w-full sm:w-auto shadow-md border ${
                    isSent
                      ? 'bg-emerald-950/60 border-emerald-600/30 text-stone-100'
                      : 'bg-stone-900 border-stone-800 text-stone-100'
                  }`}
                >
                  {/* File Transfer Details */}
                  {item.type === 'file' ? (
                    <div>
                      {/* PDF Specialized Card */}
                      {item.category === 'pdf' && (
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 shadow-sm">
                              <FileText className="w-6 h-6 text-rose-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-sm text-stone-100 truncate">
                                {item.name}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                                <span className="font-mono">{formatFileSize(item.size)}</span>
                                <span>•</span>
                                <span className="text-rose-400 font-medium">PDF Document</span>
                              </div>
                            </div>
                          </div>

                          {/* Active Transfer Progress */}
                          {item.status === 'transferring' ? (
                            <div className="space-y-1.5 pt-1">
                              <div className="flex justify-between text-xs text-stone-400">
                                <span>Beaming file...</span>
                                <span className="font-mono text-emerald-400">{item.progress}% ({item.speed || ''})</span>
                              </div>
                              <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-200"
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            /* Actions for completed PDF */
                            <div className="flex items-center gap-2 pt-1">
                              {item.blobUrl && (
                                <button
                                  onClick={() =>
                                    setActivePdf({
                                      url: item.blobUrl!,
                                      name: item.name,
                                      size: item.size,
                                    })
                                  }
                                  className="flex-1 py-1.5 px-3 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-xl text-xs font-semibold text-stone-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5 text-rose-400" />
                                  <span>Preview PDF</span>
                                </button>
                              )}
                              <button
                                onClick={() => onDownload(item)}
                                className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Image Specialized Card */}
                      {item.category === 'image' && (
                        <div className="space-y-2.5">
                          {/* Image preview thumbnail */}
                          {(item.blobUrl || item.thumbnailUrl) ? (
                            <div
                              onClick={() => {
                                const targetUrl = item.blobUrl || item.thumbnailUrl;
                                if (targetUrl) {
                                  setActiveImage({
                                    url: targetUrl,
                                    name: item.name,
                                    size: item.size,
                                  });
                                }
                              }}
                              className="relative cursor-pointer rounded-xl overflow-hidden border border-stone-800/80 bg-stone-950 group"
                            >
                              <img
                                src={item.blobUrl || item.thumbnailUrl}
                                alt={item.name}
                                className="w-full max-h-64 object-cover rounded-xl group-hover:scale-[1.01] transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white gap-2">
                                <Eye className="w-5 h-5 drop-shadow" />
                                <span className="text-xs font-semibold drop-shadow">View Full Size</span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-32 rounded-xl bg-stone-950 flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-stone-600 animate-pulse" />
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-stone-200 truncate">{item.name}</p>
                              <span className="text-[11px] text-stone-400 font-mono">
                                {formatFileSize(item.size)}
                              </span>
                            </div>

                            {item.status === 'completed' && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                {item.blob && typeof navigator.share === 'function' && (
                                  <button
                                    onClick={() => shareFile(item.blob!, item.name)}
                                    title="Share Image"
                                    className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs"
                                  >
                                    <Share2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => onDownload(item)}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Save</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Transfer progress bar */}
                          {item.status === 'transferring' && (
                            <div className="space-y-1 pt-1">
                              <div className="flex justify-between text-xs text-stone-400">
                                <span>Transferring photo...</span>
                                <span className="font-mono text-emerald-400">{item.progress}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-200"
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Generic File Card (Videos, Archives, Docs) */}
                      {item.category !== 'pdf' && item.category !== 'image' && (
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0">
                              {item.category === 'video' ? (
                                <Film className="w-5 h-5 text-indigo-400" />
                              ) : item.category === 'audio' ? (
                                <Music className="w-5 h-5 text-amber-400" />
                              ) : item.category === 'archive' ? (
                                <FileArchive className="w-5 h-5 text-orange-400" />
                              ) : (
                                <File className="w-5 h-5 text-cyan-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-sm text-stone-100 truncate">
                                {item.name}
                              </h4>
                              <p className="text-xs text-stone-400 font-mono mt-0.5">
                                {formatFileSize(item.size)}
                              </p>
                            </div>
                          </div>

                          {item.status === 'transferring' ? (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-stone-400">
                                <span>Sending...</span>
                                <span className="font-mono text-emerald-400">{item.progress}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => onDownload(item)}
                              className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download File</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Text Note / Clipboard Card */
                    <div className="space-y-2">
                      <p className="text-sm text-stone-100 whitespace-pre-wrap break-words leading-relaxed select-text">
                        {item.textPayload}
                      </p>
                      <div className="flex items-center justify-between gap-3 pt-1 border-t border-stone-800/80">
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                          Encrypted Note
                        </span>
                        <button
                          onClick={() => handleCopyText(item.id, item.textPayload || '')}
                          className="flex items-center gap-1 text-xs text-stone-300 hover:text-emerald-400 transition-colors"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bubble Footer: Time + WhatsApp Style Double Blue Check */}
                  <div className="flex items-center justify-end gap-1.5 mt-2 pt-1 text-[11px] text-stone-400">
                    <span>{formatTime(item.timestamp)}</span>
                    {isSent ? (
                      item.status === 'completed' ? (
                        <span title="Delivered & Decrypted">
                          <CheckCheck className="w-3.5 h-3.5 text-sky-400 inline" />
                        </span>
                      ) : (
                        <Check className="w-3.5 h-3.5 text-stone-400 inline" />
                      )
                    ) : (
                      <span title="Decrypted locally">
                        <Lock className="w-2.5 h-2.5 text-emerald-400 inline" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
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
