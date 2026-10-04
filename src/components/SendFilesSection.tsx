import React, { useRef, useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Film,
  Archive,
  FolderOpen,
  UploadCloud,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { formatFileSize } from '../utils/fileHelpers';
import { FileCategory } from '../../packages/shared/types';
import { sanitizeFilename } from '../../packages/shared/validation';

interface SelectedFileItem {
  id: string;
  file: File;
  name: string;
  sanitizedName: string;
  size: number;
  category: FileCategory;
}

interface SendFilesSectionProps {
  onSendBatch: (files: File[]) => void;
  isTransferring: boolean;
  activeTransferProgress?: number;
  activeTransferSpeed?: string;
  activeTransferEta?: string;
  onCancelTransfer?: () => void;
}

export const SendFilesSection: React.FC<SendFilesSectionProps> = ({
  onSendBatch,
  isTransferring,
  activeTransferProgress = 0,
  activeTransferSpeed,
  activeTransferEta,
  onCancelTransfer,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const archiveInputRef = useRef<HTMLInputElement | null>(null);

  const determineCategory = (filename: string, mime: string): FileCategory => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'video';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive';
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(ext)) return 'document';
    return 'other';
  };

  const addFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newItems: SelectedFileItem[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const category = determineCategory(file.name, file.type);
      newItems.push({
        id: `sel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${i}`,
        file,
        name: file.name,
        sanitizedName: sanitizeFilename(file.name),
        size: file.size,
        category,
      });
    }

    setSelectedFiles((prev) => [...prev, ...newItems]);
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSendAll = () => {
    if (selectedFiles.length === 0 || isTransferring) return;
    const rawFiles = selectedFiles.map((item) => item.file);
    onSendBatch(rawFiles);
    setSelectedFiles([]);
  };

  const totalBytes = selectedFiles.reduce((acc, item) => acc + item.size, 0);

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={(e) => {
          addFiles(e.target.files);
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
          addFiles(e.target.files);
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
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        type="file"
        ref={videoInputRef}
        className="hidden"
        accept="video/*"
        multiple
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        type="file"
        ref={archiveInputRef}
        className="hidden"
        accept=".zip,.rar,.7z,.tar,.gz"
        multiple
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Send Files & Media</h2>
          <p className="text-xs text-slate-500">
            Select or drag files here to stream directly to your connected device
          </p>
        </div>

        {/* Quick Category Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => pdfInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>PDFs</span>
          </button>

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Photos</span>
          </button>

          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Film className="w-3.5 h-3.5 text-purple-600" />
            <span>Videos</span>
          </button>

          <button
            type="button"
            onClick={() => archiveInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Archive className="w-3.5 h-3.5 text-amber-600" />
            <span>ZIP</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Browse</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Target Surface */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer?.files) {
            addFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/80 scale-[1.005]'
            : 'border-slate-200 bg-slate-50/50 hover:bg-blue-50/30 hover:border-blue-300'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 mx-auto flex items-center justify-center text-blue-600 mb-3 shadow-xs">
          <UploadCloud className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-800">
          Drop any files or folders here to send
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Supports PDFs, Photos (JPG, PNG, WebP), Videos (MP4), Archives (ZIP), and Documents up to 50 GB
        </p>
      </div>

      {/* Selected Files Queue */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-600 px-1">
            <span className="font-semibold text-slate-800">
              Selected Files ({selectedFiles.length}) • Total: {formatFileSize(totalBytes)}
            </span>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-rose-600 hover:underline font-medium"
            >
              Clear All
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {selectedFiles.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    {item.category === 'pdf' ? (
                      <FileText className="w-4 h-4 text-rose-500" />
                    ) : item.category === 'image' ? (
                      <ImageIcon className="w-4 h-4 text-emerald-500" />
                    ) : item.category === 'video' ? (
                      <Film className="w-4 h-4 text-purple-500" />
                    ) : item.category === 'archive' ? (
                      <Archive className="w-4 h-4 text-amber-500" />
                    ) : (
                      <FileCheck className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{formatFileSize(item.size)}</p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(item.id);
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Send Action Bar */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              onClick={handleSendAll}
              disabled={isTransferring}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-500/25 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Transfer Progress Banner */}
      {isTransferring && (
        <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-blue-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              Streaming encrypted chunks...
            </span>
            <span className="font-mono font-bold text-blue-700">{activeTransferProgress}%</span>
          </div>

          <div className="w-full h-2 bg-blue-200/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-200"
              style={{ width: `${activeTransferProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Speed: {activeTransferSpeed || 'Calculating...'}</span>
            <span>ETA: {activeTransferEta || 'Estimating...'}</span>
            {onCancelTransfer && (
              <button
                onClick={onCancelTransfer}
                className="text-rose-600 hover:underline font-sans font-semibold"
              >
                Cancel Transfer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
