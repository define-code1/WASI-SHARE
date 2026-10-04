import React, { useRef, useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Paperclip,
  Send,
  Camera,
  FolderOpen,
  UploadCloud,
} from 'lucide-react';

interface DropZoneBarProps {
  onSendFile: (file: File) => void;
  onSendText: (text: string) => void;
  isMobile: boolean;
  disabled?: boolean;
}

export const DropZoneBar: React.FC<DropZoneBarProps> = ({
  onSendFile,
  onSendText,
  isMobile,
  disabled = false,
}) => {
  const [textMessage, setTextMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      onSendFile(files[i]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer && e.dataTransfer.files) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textMessage.trim() || disabled) return;
    onSendText(textMessage);
    setTextMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 pb-6 pt-2">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={(e) => {
          handleFilesSelected(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        type="file"
        ref={pdfInputRef}
        className="hidden"
        accept=".pdf,application/pdf"
        multiple
        onChange={(e) => {
          handleFilesSelected(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        type="file"
        ref={imageInputRef}
        className="hidden"
        accept="image/*"
        multiple
        onChange={(e) => {
          handleFilesSelected(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        type="file"
        ref={cameraInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          handleFilesSelected(e.target.files);
          e.target.value = '';
        }}
      />

      {/* Main Drag-and-Drop Area & Quick Buttons */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-5 transition-all text-center ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-950/40 scale-[1.01]'
            : 'border-stone-800 bg-stone-900/60 hover:border-stone-700'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <UploadCloud className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-stone-200">
                Drop files here or pick below to transfer
              </p>
              <p className="text-[11px] text-stone-400">
                Instant wireless transfer directly to your paired device
              </p>
            </div>
          </div>

          {/* Quick Target Buttons: PDF & Image prioritized! */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* PDF Picker Button */}
            <button
              type="button"
              onClick={() => pdfInputRef.current?.click()}
              disabled={disabled}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 hover:text-rose-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-rose-400" />
              <span>Send PDF</span>
            </button>

            {/* Photos & Images Picker Button */}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={disabled}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>Send Photos</span>
            </button>

            {/* Camera Capture Button (especially handy on mobile) */}
            {isMobile && (
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={disabled}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-amber-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Camera</span>
              </button>
            )}

            {/* Generic File Browser */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="flex-1 sm:flex-none px-3 py-2 bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <FolderOpen className="w-4 h-4 text-stone-400" />
              <span>Browse</span>
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Web-style Input Bar for Text/Links/Notes */}
      <form onSubmit={handleTextSubmit} className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach any file"
          disabled={disabled}
          className="p-3 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-400 hover:text-emerald-400 transition-colors shrink-0 disabled:opacity-50"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={textMessage}
          onChange={(e) => setTextMessage(e.target.value)}
          placeholder="Type or paste a note, link, or text to beam to phone..."
          disabled={disabled}
          className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!textMessage.trim() || disabled}
          className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600 text-white rounded-xl transition-colors shrink-0 shadow-lg shadow-emerald-950"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
