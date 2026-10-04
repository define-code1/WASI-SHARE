import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 240,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    if (!value) return;

    QRCode.toDataURL(value, {
      width: size * 2, // 2x for retina sharpness
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        setDataUrl(url);
      })
      .catch((err) => {
        console.error('Error rendering QR code:', err);
      });
  }, [value, size]);

  return (
    <div
      className={`relative inline-flex items-center justify-center bg-white p-3.5 rounded-2xl shadow-xl border border-stone-200 ${className}`}
      style={{ width: size + 28, height: size + 28 }}
    >
      {dataUrl ? (
        <img
          src={dataUrl}
          alt="Connection QR Code"
          width={size}
          height={size}
          className="rounded-lg select-none block"
        />
      ) : (
        <canvas ref={canvasRef} width={size} height={size} className="rounded-lg" />
      )}

      {/* WhatsApp Web-like center emblem */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-11 h-11 rounded-full bg-emerald-600 border-2 border-white shadow-md flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
