import React from 'react';
import { X, Smartphone, ExternalLink, RefreshCw } from 'lucide-react';

interface SplitScreenTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  pairUrl: string;
}

export const SplitScreenTestModal: React.FC<SplitScreenTestModalProps> = ({
  isOpen,
  onClose,
  pairUrl,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] text-stone-100">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-stone-950 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-100">Simulated Mobile Client</h3>
              <p className="text-[11px] text-stone-400">
                Paired via room & AES-256 key
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={pairUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open mobile client in new browser window"
              className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Tab</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info hint */}
        <div className="bg-emerald-950/40 border-b border-emerald-800/30 px-4 py-2 text-[11px] text-emerald-300 flex items-center justify-between">
          <span>💡 Send files or photos between this simulated phone and your PC!</span>
          <span className="font-mono text-[10px] text-emerald-400/80">LIVE</span>
        </div>

        {/* Embedded Iframe Simulator */}
        <div className="flex-1 w-full bg-stone-950 p-2 sm:p-4 flex items-center justify-center">
          <div className="w-full h-full max-w-[380px] bg-stone-900 border-4 border-stone-800 rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col">
            {/* Phone Notch */}
            <div className="h-5 bg-stone-950 w-full flex items-center justify-center shrink-0">
              <div className="w-20 h-3 bg-stone-800 rounded-full" />
            </div>

            <iframe
              src={pairUrl}
              title="BeamDrop Mobile Simulator"
              className="w-full flex-1 border-none bg-stone-950"
            />

            {/* Phone Home Bar */}
            <div className="h-4 bg-stone-950 w-full flex items-center justify-center shrink-0">
              <div className="w-28 h-1 bg-stone-700 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
