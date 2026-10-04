import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, X, RefreshCw, AlertCircle } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedText: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, selectedCameraId]);

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    stopCamera();
    setError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser');
      }

      // Enumerate cameras
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setCameras(videoDevices);
      } catch {
        // ignore device listing error
      }

      const constraints: MediaStreamConstraints = {
        video: selectedCameraId
          ? { deviceId: { exact: selectedCameraId } }
          : { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        scanFrame();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser settings or enter the code manually.'
          : 'Unable to access camera: ' + (err.message || 'Unknown error')
      );
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        stopCamera();
        onScanSuccess(code.data);
        return;
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-stone-100">Scan QR Code to Connect</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video / Camera area */}
        <div className="relative aspect-square w-full bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center max-w-xs">
              <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
              <p className="text-sm text-stone-300 mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-white transition-colors"
              >
                Retry Camera
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning Target Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-64 h-64 border-2 border-emerald-400/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                  {/* Glowing corners */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                  {/* Animated scanning line */}
                  <div className="absolute left-2 right-2 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-xs font-medium text-emerald-300 border border-emerald-500/30">
                  Align PC screen QR code within square
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-stone-950 flex items-center justify-between text-xs text-stone-400">
          {cameras.length > 1 && (
            <select
              value={selectedCameraId}
              onChange={(e) => setSelectedCameraId(e.target.value)}
              className="bg-stone-800 text-stone-200 border border-stone-700 rounded-lg px-2.5 py-1 text-xs"
            >
              {cameras.map((c, i) => (
                <option key={c.deviceId || i} value={c.deviceId}>
                  {c.label || `Camera ${i + 1}`}
                </option>
              ))}
            </select>
          )}
          <span className="ml-auto">Works with all standard QR codes</span>
        </div>
      </div>
    </div>
  );
};
