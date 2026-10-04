import React from 'react';
import { X, Download, ExternalLink, FileText, Printer } from 'lucide-react';
import { formatFileSize } from '../utils/fileHelpers';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  filename: string;
  filesize: number;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  pdfUrl,
  filename,
  filesize,
}) => {
  if (!isOpen || !pdfUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4">
      <div className="relative w-full max-w-5xl h-[92vh] bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-9 h-9 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-rose-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-stone-100 text-sm sm:text-base truncate">{filename}</h3>
              <p className="text-xs text-stone-400">{formatFileSize(filesize)} • PDF Document</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in new window"
              className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Full Tab</span>
            </a>
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded PDF container */}
        <div className="flex-1 w-full bg-stone-950 relative">
          <object
            data={pdfUrl}
            type="application/pdf"
            className="w-full h-full border-none"
          >
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <FileText className="w-16 h-16 text-rose-400 mb-4 opacity-70" />
              <p className="text-stone-200 font-medium mb-1">Embedded preview unavailable in this browser</p>
              <p className="text-stone-400 text-xs max-w-sm mb-4">
                Your device or browser does not support inline PDF viewing. You can download or open it in a separate viewer.
              </p>
              <button
                onClick={handleDownload}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition-colors shadow-lg"
              >
                Download PDF ({formatFileSize(filesize)})
              </button>
            </div>
          </object>
        </div>
      </div>
    </div>
  );
};
