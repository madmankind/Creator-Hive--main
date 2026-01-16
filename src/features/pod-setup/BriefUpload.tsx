"use client";

import { useState, useRef } from "react";
import { Upload, X, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface BriefUploadProps {
  onFileSelect?: (file: File) => void;
  onFileRemove?: () => void;
  selectedFile?: File | null;
}

export function BriefUpload({ onFileSelect, onFileRemove, selectedFile }: BriefUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "application/pdf" || file.type.includes("word") || file.type.includes("document"))) {
      onFileSelect?.(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect?.(file);
    }
  };

  if (selectedFile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2"
      >
        <File className="h-4 w-4 text-emerald-400" />
        <span className="flex-1 text-xs text-white/90 truncate">{selectedFile.name}</span>
        <button
          type="button"
          onClick={onFileRemove}
          className="h-5 w-5 rounded flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </motion.div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        "relative rounded-lg border-2 border-dashed transition-all cursor-pointer",
        isDragging
          ? "border-emerald-500/50 bg-emerald-500/10"
          : "border-white/10 bg-white/5 hover:border-emerald-500/30 hover:bg-white/8"
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileInput}
        className="hidden"
      />
      <div className="flex flex-col items-center justify-center p-4 text-center">
        <Upload className="h-5 w-5 text-white/40 mb-2" />
        <div className="text-xs text-white/70 font-medium mb-1">
          Drag & drop or click to upload
        </div>
        <div className="text-[10px] text-white/50">
          PDF, DOC, DOCX (max 10MB)
        </div>
      </div>
    </div>
  );
}












<<<<<<< Current (Your changes)

=======
>>>>>>> Incoming (Background Agent changes)
