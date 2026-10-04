import React from 'react';
import {
  X,
  AlertTriangle,
  Wifi,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  Terminal,
} from 'lucide-react';

interface TroubleshootingModalProps {
  isOpen: boolean;
  onClose: () => void;
  localEndpoints: string[];
  port: number;
}

export const TroubleshootingModal: React.FC<TroubleshootingModalProps> = ({
  isOpen,
  onClose,
  localEndpoints,
  port,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Connection & Firewall Troubleshooting</h3>
              <p className="text-xs text-slate-500">Solve Wi-Fi pairing and network issues</p>
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Diagnostic status */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <h4 className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-slate-500" />
              <span>Active Local Endpoints</span>
            </h4>
            <div className="space-y-1 font-mono text-[11px] text-slate-600">
              <p>Transfer Port: <span className="font-bold text-blue-600">{port}</span></p>
              {localEndpoints.map((ep, idx) => (
                <div key={idx} className="p-1.5 bg-white rounded border border-slate-200 truncate">
                  {ep}
                </div>
              ))}
            </div>
          </div>

          {/* Issue 1: Windows Firewall */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>1. Windows Defender Firewall Prompt</span>
            </h4>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <p className="text-slate-600">
                When you first start WASI SHARE on Windows, Windows Defender Firewall asks if you want to allow it on private networks.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-500 pl-1">
                <li>Ensure <strong>"Private networks (home or work)"</strong> is checked.</li>
                <li>If blocked: Open <strong>Windows Settings</strong> &gt; <strong>Firewall & Network Protection</strong> &gt; <strong>Allow an app through firewall</strong> &gt; Check <strong>WASI SHARE</strong> for Private networks.</li>
              </ul>
            </div>
          </div>

          {/* Issue 2: Different Subnets or Guest Wi-Fi */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Wifi className="w-4 h-4 text-blue-600" />
              <span>2. Same Wi-Fi Network & "Client Isolation"</span>
            </h4>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <p className="text-slate-600">
                Both your Windows PC and Android phone must be connected to the exact same Wi-Fi router.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-500 pl-1">
                <li>Avoid connecting either device to a <strong>Guest Wi-Fi network</strong>, as routers enable "AP / Client Isolation" on guest networks which prevents devices from communicating.</li>
                <li>Disable active VPNs on both devices while transferring, as VPN tunnels redirect local network packets.</li>
              </ul>
            </div>
          </div>

          {/* Issue 3: Mobile Hotspot Alternative */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>3. Fast Alternative: Android Mobile Hotspot</span>
            </h4>
            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/80">
              <p className="text-slate-700">
                If your workplace or school Wi-Fi has strict isolation policies, turn on <strong>Mobile Hotspot</strong> on your Android phone and connect your Windows PC to the phone's hotspot. WASI SHARE works seamlessly and transfers at high speed with <strong>zero cellular mobile data usage</strong>!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
