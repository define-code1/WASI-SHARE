import React, { useState } from 'react';
import {
  X,
  Settings,
  FolderOpen,
  Volume2,
  VolumeX,
  ShieldCheck,
  Smartphone,
  Trash2,
  LogOut,
  Info,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { DeviceInfo } from '../../packages/shared/types';
import { WASI_CONSTANTS } from '../../packages/shared/protocol';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceInfo: DeviceInfo;
  onUpdateDeviceName: (name: string) => void;
  defaultFolder: string;
  onChangeFolder: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  connectedPeer: DeviceInfo | null;
  onRevokeDevice: () => void;
  onClearHistory: () => void;
  onOpenTroubleshooting: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  deviceInfo,
  onUpdateDeviceName,
  defaultFolder,
  onChangeFolder,
  soundEnabled,
  onToggleSound,
  connectedPeer,
  onRevokeDevice,
  onClearHistory,
  onOpenTroubleshooting,
}) => {
  const [deviceName, setDeviceName] = useState(deviceInfo.name);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (deviceName.trim()) {
      onUpdateDeviceName(deviceName.trim());
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">WASI SHARE Settings</h3>
              <p className="text-xs text-slate-500">v{WASI_CONSTANTS.PROTOCOL_VERSION} • Windows & Android</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Device Display Name */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-800 text-xs">Device Display Name</label>
            <form onSubmit={handleSaveName} className="flex gap-2">
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                maxLength={40}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-1 transition-colors"
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </form>
            <p className="text-[11px] text-slate-400">
              This name will be shown on the paired device when sending or requesting files.
            </p>
          </div>

          {/* Default Receive Folder */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800 text-xs">Default Receive Folder</label>
              <button
                onClick={onChangeFolder}
                className="text-blue-600 font-semibold hover:underline"
              >
                Change Folder
              </button>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 font-mono text-[11px] text-slate-600">
              <FolderOpen className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{defaultFolder}</span>
            </div>
          </div>

          {/* Sound Preferences */}
          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <div>
              <p className="font-semibold text-slate-800">Transfer Audio Chimes</p>
              <p className="text-[11px] text-slate-400">
                Play subtle chimes on connection, sent files, and incoming transfers
              </p>
            </div>
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-xl border transition-colors ${
                soundEnabled
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Paired Device Management */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="font-semibold text-slate-800 text-xs">Paired Devices</label>
            {connectedPeer ? (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-semibold text-slate-900">{connectedPeer.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{connectedPeer.platform} Device</p>
                  </div>
                </div>
                <button
                  onClick={onRevokeDevice}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Revoke Session</span>
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">No device currently paired.</p>
            )}
          </div>

          {/* Troubleshooting Link */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <p className="font-semibold text-blue-900">Wi-Fi & Firewall Troubleshooting</p>
                <p className="text-[11px] text-blue-700">Tips for local network isolation and Windows Defender Firewall</p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenTroubleshooting();
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
            >
              View Guide
            </button>
          </div>

          {/* Clear Transfer History */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Clear Transfer Log</p>
              <p className="text-[11px] text-slate-400">Removes non-sensitive metadata history</p>
            </div>
            <button
              onClick={onClearHistory}
              className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>

          {/* Privacy & Security Statement */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Privacy & Security Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              WASI SHARE operates entirely peer-to-peer over your local Wi-Fi. File bytes and metadata are never uploaded to any cloud server, database, or external relay. All chunks are authenticated and encrypted with AES-256-GCM.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
