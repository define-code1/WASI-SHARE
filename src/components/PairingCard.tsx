import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Smartphone,
  ShieldCheck,
  Copy,
  Check,
  Camera,
  RefreshCw,
  ExternalLink,
  Wifi,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { QRCodeDisplay } from './QRCodeDisplay';
import { WasiPairingPayload } from '../../packages/shared/types';

interface PairingCardProps {
  pairingPayload: WasiPairingPayload;
  pairUrl: string;
  isMobile: boolean;
  onRefreshSession: () => void;
  onOpenScanner: () => void;
  onOpenSplitTest: () => void;
  onOpenTroubleshooting: () => void;
}

export const PairingCard: React.FC<PairingCardProps> = ({
  pairingPayload,
  pairUrl,
  isMobile,
  onRefreshSession,
  onOpenScanner,
  onOpenSplitTest,
  onOpenTroubleshooting,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(300);

  useEffect(() => {
    const updateCountdown = () => {
      const diff = Math.max(0, Math.floor((pairingPayload.expiresAt - Date.now()) / 1000));
      setSecondsRemaining(diff);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [pairingPayload.expiresAt]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pairUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isExpired = secondsRemaining === 0;

  return (
    <div className="max-w-4xl mx-auto my-6 px-4">
      {/* Main White & Light Blue Container */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        {/* Subtle Light Cyan / Blue Corner Gradient Accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-100/40 via-blue-50/30 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Instructions and Flow */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 text-xs font-semibold mb-3">
                <Wifi className="w-3.5 h-3.5 text-blue-600" />
                <span>Local Wi-Fi Pairing • Zero Cloud Storage</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Connect your Android phone to this Windows PC
              </h1>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Transfer PDFs, photos, videos, and large archives wirelessly at local Wi-Fi speeds with authenticated AES-256-GCM encryption.
              </p>
            </div>

            {/* 3 Step Instructions */}
            <ol className="space-y-4 text-sm text-slate-700">
              <li className="flex items-start gap-3.5">
                <span className="shrink-0 w-7 h-7 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center shadow-xs">
                  1
                </span>
                <div>
                  <p className="font-semibold text-slate-900">
                    Open WASI SHARE on your Android phone
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Make sure both your PC and Android phone are on the same Wi-Fi network.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <span className="shrink-0 w-7 h-7 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center shadow-xs">
                  2
                </span>
                <div>
                  <p className="font-semibold text-slate-900">
                    Scan the QR code with the phone camera
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tap "Scan QR Code" in the Android app and point your camera at the screen.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <span className="shrink-0 w-7 h-7 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center shadow-xs">
                  3
                </span>
                <div>
                  <p className="font-semibold text-slate-900">
                    Start transferring files immediately
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Send files from PC to phone or phone to PC with manual recipient approval and SHA-256 integrity verification.
                  </p>
                </div>
              </li>
            </ol>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{copiedLink ? 'Pairing Link Copied!' : 'Copy Mobile Link'}</span>
              </button>

              <button
                onClick={onOpenSplitTest}
                className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-blue-600" />
                <span>Simulate Android Phone (Split View)</span>
              </button>

              {isMobile && (
                <button
                  onClick={onOpenScanner}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-md shadow-blue-500/25"
                >
                  <Camera className="w-4 h-4" />
                  <span>Scan PC Screen</span>
                </button>
              )}
            </div>

            {/* Windows Firewall Hint */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Having trouble connecting?</span>
              </div>
              <button
                onClick={onOpenTroubleshooting}
                className="text-blue-600 font-semibold hover:underline"
              >
                View Windows Firewall Guide
              </button>
            </div>
          </div>

          {/* Right Column: QR Code Display Card */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50/80 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="relative group">
              {isExpired ? (
                <div className="w-[268px] h-[268px] bg-slate-100 rounded-2xl border border-slate-200 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Pairing Session Expired</h4>
                  <p className="text-xs text-slate-500 mb-4">
                    For your security, pairing sessions expire after 5 minutes.
                  </p>
                  <button
                    onClick={onRefreshSession}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Generate New Code</span>
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <QRCodeDisplay value={pairUrl} size={240} />
                </div>
              )}
            </div>

            {/* Session Info & Expiration countdown */}
            <div className="mt-4 text-center w-full">
              <div className="inline-flex items-center justify-between w-full max-w-[268px] px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">Session Expires:</span>
                <span className={`font-mono font-bold ${secondsRemaining < 60 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
                <button
                  onClick={onRefreshSession}
                  title="Generate fresh session code"
                  className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-2 text-[11px] text-slate-400 font-mono truncate max-w-[260px] mx-auto">
                ID: {pairingPayload.sessionId.substring(0, 16)}...
              </div>

              <div className="mt-2 flex items-center justify-center gap-1 text-[11px] text-slate-500 font-medium">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>Replay-resistant 256-bit Challenge</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
