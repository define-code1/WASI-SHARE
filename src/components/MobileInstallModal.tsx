import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Share2,
  PlusSquare,
  MoreVertical,
  Download,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MobileInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl?: string;
}

export const MobileInstallModal: React.FC<MobileInstallModalProps> = ({
  isOpen,
  onClose,
  appUrl = window.location.origin,
}) => {
  const { isInstallable, isIOS, isAndroid, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>(isIOS ? 'ios' : 'android');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-950 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-100">Install BeamDrop on Mobile</h3>
              <p className="text-xs text-stone-400">Use like a native app with full-screen experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex border-b border-stone-800 bg-stone-950/60 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('android')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'android'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>🤖 Android (Chrome / Samsung)</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'ios'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>🍎 iPhone & iPad (iOS Safari)</span>
          </button>
        </div>

        {/* Body Guide */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Quick Native Install Button if browser supports beforeinstallprompt */}
          {isInstallable && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-emerald-300">Fast 1-Click Install Ready</p>
                <p className="text-[11px] text-emerald-400/80">Your browser supports direct installation</p>
              </div>
              <button
                onClick={handleNativeInstall}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-emerald-950 flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Install Now</span>
              </button>
            </div>
          )}

          {activeTab === 'android' ? (
            /* Android Instructions */
            <div className="space-y-4 text-xs text-stone-300">
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
                <h4 className="font-bold text-stone-200 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono">
                    1
                  </span>
                  Open in Chrome or Samsung Internet
                </h4>
                <p className="text-stone-400 pl-7">
                  Scan the QR code from your PC or open this web app URL in your mobile browser.
                </p>
              </div>

              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
                <h4 className="font-bold text-stone-200 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono">
                    2
                  </span>
                  Tap the Menu button (3 dots)
                </h4>
                <p className="text-stone-400 pl-7 flex items-center gap-1.5">
                  Tap the <MoreVertical className="w-4 h-4 text-stone-300 inline" /> icon at the top right of Chrome.
                </p>
              </div>

              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
                <h4 className="font-bold text-stone-200 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono">
                    3
                  </span>
                  Tap "Install App" or "Add to Home screen"
                </h4>
                <p className="text-stone-400 pl-7">
                  Confirm when prompted. BeamDrop will appear on your phone home screen with its custom icon and run like a standalone app with no browser address bar!
                </p>
              </div>
            </div>
          ) : (
            /* iOS / iPhone Instructions */
            <div className="space-y-4 text-xs text-stone-300">
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
                <h4 className="font-bold text-stone-200 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono">
                    1
                  </span>
                  Open in Safari on iPhone / iPad
                </h4>
                <p className="text-stone-400 pl-7">
                  Apple requires Safari for Home Screen PWA installation. (If you scanned with the camera app, it opens in Safari automatically).
                </p>
              </div>

              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
                <h4 className="font-bold text-stone-200 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono">
                    2
                  </span>
                  Tap the Share button
                </h4>
                <p className="text-stone-400 pl-7 flex items-center gap-1.5">
                  Tap the <Share2 className="w-4 h-4 text-sky-400 inline" /> <strong>Share</strong> icon in the bottom Safari toolbar (the square box with an arrow pointing up).
                </p>
              </div>

              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
                <h4 className="font-bold text-stone-200 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono">
                    3
                  </span>
                  Tap "Add to Home Screen"
                </h4>
                <p className="text-stone-400 pl-7 flex items-center gap-1.5">
                  Scroll down the share sheet and tap <PlusSquare className="w-4 h-4 text-stone-300 inline" /> <strong>"Add to Home Screen"</strong>, then tap <strong>"Add"</strong> in the top right.
                </p>
              </div>
            </div>
          )}

          {/* Share / Copy URL section */}
          <div className="pt-2 border-t border-stone-800">
            <p className="text-[11px] text-stone-400 mb-2 font-medium">BeamDrop URL to open on your phone:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs font-mono text-stone-300 select-all focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Instant Launch • Standalone Mode</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
