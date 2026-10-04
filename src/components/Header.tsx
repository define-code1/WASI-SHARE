import React from 'react';
import {
  ShieldCheck,
  Smartphone,
  Monitor,
  Volume2,
  VolumeX,
  Settings,
  HelpCircle,
  ExternalLink,
  QrCode,
  LogOut,
  Wifi,
} from 'lucide-react';
import { DeviceInfo } from '../../packages/shared/types';

interface HeaderProps {
  deviceInfo: DeviceInfo;
  connectedPeer: DeviceInfo | null;
  onOpenSettings: () => void;
  onOpenTroubleshooting: () => void;
  onOpenSplitTest: () => void;
  onShowPairModal?: () => void;
  onDisconnect: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  deviceInfo,
  connectedPeer,
  onOpenSettings,
  onOpenTroubleshooting,
  onOpenSplitTest,
  onShowPairModal,
  onDisconnect,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v8m0 4v8" />
              <path d="m4.93 10.93 5.66-5.66" />
              <path d="m13.41 18.73 5.66-5.66" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                WASI SHARE
              </span>
              <span className="hidden sm:inline-block text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                Simple. Secure. Yours.
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              {deviceInfo.platform === 'android' ? (
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <Monitor className="w-3.5 h-3.5 text-blue-600" />
              )}
              <span className="font-medium text-slate-700 truncate max-w-[140px] sm:max-w-[180px]">
                {deviceInfo.name}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Local Connection Status */}
        <div className="hidden md:flex items-center gap-2.5">
          {connectedPeer ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
              <span className="font-semibold text-slate-900">
                Connected to {connectedPeer.name}
              </span>
              <span className="text-[11px] font-mono text-cyan-700 bg-cyan-100/70 px-1.5 py-0.5 rounded">
                Wi-Fi Direct
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs">
              <Wifi className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">Waiting for Android phone to pair...</span>
            </div>
          )}

          {/* AES-256 E2EE Badge */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-[11px] text-slate-600 font-medium"
            title="Encrypted with AES-256-GCM over local Wi-Fi. Zero cloud intermediaries."
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>AES-256</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Split Screen Demo Mode */}
          <button
            onClick={onOpenSplitTest}
            title="Simulate Android mobile screen side-by-side"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            <span>Simulate Android</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute transfer chimes' : 'Enable transfer chimes'}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-blue-600" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Troubleshooting Guide */}
          <button
            onClick={onOpenTroubleshooting}
            title="Wi-Fi and Windows Firewall Troubleshooting"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="Application Settings"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Disconnect button if connected */}
          {connectedPeer && (
            <button
              onClick={onDisconnect}
              title="Disconnect current device"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors ml-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Disconnect</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
