import React from 'react';
import { X, Download, Share2, Copy, Check } from 'lucide-react';
import { formatFileSize, shareFile } from '../utils/fileHelpers';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  filename: string;
  filesize: number;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  filename,
  filesize,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyImage = async () => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard image write failed, falling back:', err);
    }
  };

  const handleShare = async () => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      await shareFile(blob, filename);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4">
      <div className="relative w-full max-w-5xl max-h-[95vh] flex flex-col items-center">
        {/* Top Floating Control Bar */}
        <div className="w-full flex items-center justify-between px-4 py-3 bg-stone-900/90 border border-stone-800 rounded-2xl mb-3 text-stone-100 backdrop-blur-md shadow-2xl">
          <div className="min-w-0 pr-3">
            <h4 className="text-sm font-semibold truncate">{filename}</h4>
            <span className="text-xs text-stone-400">{formatFileSize(filesize)}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {typeof navigator.clipboard?.write === 'function' && (
              <button
                onClick={handleCopyImage}
                title="Copy Image to Clipboard"
                className="p-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}

            {typeof navigator.share === 'function' && (
              <button
                onClick={handleShare}
                title="Share to Mobile Apps"
                className="p-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            )}

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Save</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Preview */}
        <div className="relative flex items-center justify-center w-full max-h-[80vh] overflow-hidden rounded-2xl border border-stone-800/60 bg-stone-950/80 p-2">
          <img
            src={imageUrl}
            alt={filename}
            className="max-h-[76vh] max-w-full object-contain rounded-lg shadow-2xl select-none"
          />
        </div>
      </div>
    </div>
  );
};
