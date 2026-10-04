import React, { useState } from 'react';
import {
  QrCode,
  Smartphone,
  Shield,
  Copy,
  Check,
  Camera,
  ArrowRight,
  ExternalLink,
  Laptop,
  Sparkles,
} from 'lucide-react';
import { QRCodeDisplay } from './QRCodeDisplay';
import { PWAInstallButton } from './PWAInstallButton';

interface PairingViewProps {
  roomId: string;
  pairUrl: string;
  isMobile: boolean;
  onOpenScanner: () => void;
  onOpenSplitTest: () => void;
  onOpenInstallGuide: () => void;
  onJoinCode: (code: string) => void;
}

export const PairingView: React.FC<PairingViewProps> = ({
  roomId,
  pairUrl,
  isMobile,
  onOpenScanner,
  onOpenSplitTest,
  onOpenInstallGuide,
  onJoinCode,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pairUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim().length >= 4) {
      onJoinCode(manualCode.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-6 px-4">
      {/* WhatsApp Web inspired Card Container */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left: Step-by-step instructions */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Wireless Pairing</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                Use BeamDrop to transfer PDFs & Photos between PC and Mobile
              </h1>
              <p className="text-stone-400 text-sm mt-2">
                Works just like WhatsApp Web: scan the QR code to pair your phone and PC with military-grade AES-256 end-to-end encryption.
              </p>
            </div>

            {/* Steps list */}
            <ol className="space-y-4 text-sm text-stone-300">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-800 border border-stone-700 text-emerald-400 font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <div>
                  <p className="font-medium text-stone-200">
                    Open your iPhone or Android camera app
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Or open BeamDrop directly in your mobile browser.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-800 border border-stone-700 text-emerald-400 font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <div>
                  <p className="font-medium text-stone-200">
                    Point your camera at the QR code on this screen
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Tap the notification banner to connect instantly without typing any password.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-800 border border-stone-700 text-emerald-400 font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <div>
                  <p className="font-medium text-stone-200">
                    Send PDF files, Photos & Documents instantly
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    High-speed peer transfer with zero cloud retention.
                  </p>
                </div>
              </li>
            </ol>

            {/* Quick Actions Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <PWAInstallButton onOpenGuide={onOpenInstallGuide} variant="hero" />

              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-750 border border-stone-700 rounded-xl text-xs font-semibold text-stone-200 hover:text-white flex items-center gap-2 transition-colors"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Pairing Link Copied!' : 'Copy Mobile Link'}</span>
              </button>

              <button
                onClick={onOpenSplitTest}
                className="px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 rounded-xl text-xs font-semibold text-emerald-300 hover:text-emerald-200 flex items-center gap-2 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Test Split-Screen (Demo Phone)</span>
              </button>

              {isMobile && (
                <button
                  onClick={onOpenScanner}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-white flex items-center gap-2 transition-colors shadow-lg shadow-emerald-900/30"
                >
                  <Camera className="w-4 h-4" />
                  <span>Scan PC Screen</span>
                </button>
              )}
            </div>

            {/* Manual Code Entry Accordion */}
            <div className="pt-2 border-t border-stone-800">
              <form onSubmit={handleManualSubmit} className="flex items-center gap-2 max-w-sm">
                <input
                  type="text"
                  maxLength={8}
                  placeholder="Or enter Room Code (e.g. C7K92P)"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs font-mono uppercase tracking-wider text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!manualCode.trim()}
                  className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  Connect
                </button>
              </form>
            </div>
          </div>

          {/* Right: Crisp QR Code Display */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-stone-950/60 rounded-2xl border border-stone-800/80">
            <div className="relative group">
              <QRCodeDisplay value={pairUrl} size={240} />
            </div>

            {/* Room code display below QR */}
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-stone-800 border border-stone-700 font-mono text-sm text-stone-200">
                <span className="text-stone-400 text-xs font-sans">Pair Code:</span>
                <span className="font-bold text-emerald-400 tracking-widest">{roomId}</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-2 flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>End-to-End Encrypted (Zero Knowledge)</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
