/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTransferEngine } from './hooks/useTransferEngine';
import { Header } from './components/Header';
import { PairingCard } from './components/PairingCard';
import { SendFilesSection } from './components/SendFilesSection';
import { TransferHistorySection } from './components/TransferHistorySection';
import { TransferApprovalModal } from './components/TransferApprovalModal';
import { SettingsModal } from './components/SettingsModal';
import { TroubleshootingModal } from './components/TroubleshootingModal';
import { SplitScreenTestModal } from './components/SplitScreenTestModal';
import { QRScannerModal } from './components/QRScannerModal';
import { downloadBlob } from './utils/fileHelpers';
import {
  Sparkles,
  X,
  Smartphone,
  ShieldCheck,
  Wifi,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function App() {
  const {
    deviceInfo,
    roomId,
    pairUrl,
    pairingPayload,
    refreshPairingSession,
    wsConnected,
    connectedPeer,
    transfers,
    soundEnabled,
    toggleSound,
    toastMessage,
    clearToast,
    defaultFolder,
    setDefaultFolder,
    pendingApproval,
    acceptTransfer,
    rejectTransfer,
    sendBatchFiles,
    isSending,
    activeTransferProgress,
    activeTransferSpeed,
    activeTransferEta,
    disconnectPeer,
    clearHistory,
    updateDeviceName,
  } = useTransferEngine();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTroubleshootingOpen, setIsTroubleshootingOpen] = useState(false);
  const [isSplitTestOpen, setIsSplitTestOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  const handleDownloadItem = (item: any) => {
    if (item.blob) {
      downloadBlob(item.blob, item.metadata.name);
    } else if (item.blobUrl) {
      const a = document.createElement('a');
      a.href = item.blobUrl;
      a.download = item.metadata.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleScanSuccess = (scannedText: string) => {
    setIsQRScannerOpen(false);
    try {
      if (scannedText.startsWith('http://') || scannedText.startsWith('https://')) {
        const url = new URL(scannedText);
        window.location.href = scannedText;
        return;
      }
    } catch {
      // ignore
    }
  };

  // Demo file helper for instant 1-click test
  const handleSendSamplePdf = () => {
    const samplePdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 110 >> stream
BT
/F1 22 Tf
80 700 Td
(WASI SHARE Wireless Transfer Sample) Tj
/F1 12 Tf
0 -36 Td
(Direct local Wi-Fi transfer with AES-256 authenticated encryption.) Tj
ET
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000234 00000 n 
0000000395 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
464
%%EOF`;
    const blob = new Blob([samplePdfContent], { type: 'application/pdf' });
    const file = new File([blob], 'WASI_SHARE_Document.pdf', { type: 'application/pdf' });
    sendBatchFiles([file]);
  };

  const handleSendSamplePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 800, 600);
      gradient.addColorStop(0, '#1d4ed8');
      gradient.addColorStop(0.5, '#2563eb');
      gradient.addColorStop(1, '#0284c7');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('WASI SHARE', 400, 270);

      ctx.font = '20px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText('Simple. Secure. Yours.', 400, 315);
      ctx.fillText(new Date().toLocaleTimeString(), 400, 360);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'WASI_SHARE_Photo.jpg', { type: 'image/jpeg' });
          sendBatchFiles([file]);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const isPaired = !!connectedPeer;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-900">
      {/* Top Header */}
      <Header
        deviceInfo={deviceInfo}
        connectedPeer={connectedPeer}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTroubleshooting={() => setIsTroubleshootingOpen(true)}
        onOpenSplitTest={() => setIsSplitTestOpen(true)}
        onDisconnect={disconnectPeer}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        {!isPaired ? (
          /* When waiting for mobile connection: Show large QR pairing card */
          <div className="space-y-6">
            <PairingCard
              pairingPayload={pairingPayload}
              pairUrl={pairUrl}
              isMobile={deviceInfo.platform === 'android'}
              onRefreshSession={refreshPairingSession}
              onOpenScanner={() => setIsQRScannerOpen(true)}
              onOpenSplitTest={() => setIsSplitTestOpen(true)}
              onOpenTroubleshooting={() => setIsTroubleshootingOpen(true)}
            />

            {/* Quick Demo Simulator Callout */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
                <div className="flex items-center gap-2.5 text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Want to test the app right now? </span>
                    <span className="text-slate-500">
                      Open a simulated Android phone in split view to test bidirectional wireless transfers instantly.
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsSplitTestOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-xs shrink-0 cursor-pointer"
                >
                  Open Simulated Phone
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* When Paired: Connected Device Workspace */
          <div className="space-y-6">
            {/* Connected Peer Banner */}
            <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{connectedPeer.name}</h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Paired</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    AES-256-GCM Direct Local Wi-Fi Channel
                  </p>
                </div>
              </div>

              {/* Sample test buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSendSamplePdf}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-600" />
                  <span>Send Sample PDF</span>
                </button>
                <button
                  onClick={handleSendSamplePhoto}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Send Sample Photo</span>
                </button>
              </div>
            </div>

            {/* Send Files Section */}
            <SendFilesSection
              onSendBatch={sendBatchFiles}
              isTransferring={isSending}
              activeTransferProgress={activeTransferProgress}
              activeTransferSpeed={activeTransferSpeed}
              activeTransferEta={activeTransferEta}
            />
          </div>
        )}

        {/* Transfer History Section */}
        <TransferHistorySection
          transfers={transfers}
          onDownloadItem={handleDownloadItem}
          onClearHistory={clearHistory}
        />
      </main>

      {/* Manual Recipient Approval Modal */}
      <TransferApprovalModal
        isOpen={!!pendingApproval}
        file={pendingApproval?.file || null}
        sender={pendingApproval?.sender || null}
        destinationFolder={defaultFolder}
        onAccept={acceptTransfer}
        onReject={rejectTransfer}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        deviceInfo={deviceInfo}
        onUpdateDeviceName={updateDeviceName}
        defaultFolder={defaultFolder}
        onChangeFolder={() => {
          const folder = prompt('Enter default receive folder path:', defaultFolder);
          if (folder) setDefaultFolder(folder);
        }}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        connectedPeer={connectedPeer}
        onRevokeDevice={disconnectPeer}
        onClearHistory={clearHistory}
        onOpenTroubleshooting={() => setIsTroubleshootingOpen(true)}
      />

      {/* Troubleshooting Modal */}
      <TroubleshootingModal
        isOpen={isTroubleshootingOpen}
        onClose={() => setIsTroubleshootingOpen(false)}
        localEndpoints={pairingPayload.endpoints}
        port={pairingPayload.port}
      />

      {/* Split Screen Simulator Modal */}
      <SplitScreenTestModal
        isOpen={isSplitTestOpen}
        onClose={() => setIsSplitTestOpen(false)}
        pairUrl={pairUrl}
      />

      {/* Mobile QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          <span>{toastMessage}</span>
          <button
            onClick={clearToast}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
