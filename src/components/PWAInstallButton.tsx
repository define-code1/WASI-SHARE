import React from 'react';
import { Smartphone, Download, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onOpenGuide: () => void;
  variant?: 'header' | 'hero' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenGuide,
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  if (isInstalled) {
    if (variant === 'header') {
      return (
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Check className="w-3.5 h-3.5" />
          <span>App Installed</span>
        </span>
      );
    }
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        onOpenGuide();
      }
    } else {
      onOpenGuide();
    }
  };

  if (variant === 'hero') {
    return (
      <button
        onClick={handleClick}
        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/40 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/60 group"
      >
        <Smartphone className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
        <span>Install on Mobile (App)</span>
      </button>
    );
  }

  if (variant === 'banner') {
    return (
      <button
        onClick={handleClick}
        className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
      >
        <Download className="w-4 h-4" />
        <span>Install App on Phone</span>
      </button>
    );
  }

  // Header default button
  return (
    <button
      onClick={handleClick}
      title="Install BeamDrop on your phone or computer"
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-xs font-semibold text-emerald-300 hover:text-emerald-200 transition-colors"
    >
      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
      <span className="hidden sm:inline">Install on Mobile</span>
      <span className="sm:hidden">Install</span>
    </button>
  );
};
