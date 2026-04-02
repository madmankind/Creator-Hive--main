/**
 * TRADE LICENSE UPLOAD COMPONENT
 * Uploads to Supabase via /api/agency/trade-license and persists on AgencyAccount.
 */

"use client";

import { useState } from "react";
import { Upload, File, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type TradeLicenseUploadProps = {
  requestId: string;
  existingLicense?: {
    url: string;
    filename: string;
    uploadedAt: Date;
  } | null;
  onUploadComplete?: () => void;
};

export function TradeLicenseUpload({ existingLicense, onUploadComplete }: TradeLicenseUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState(existingLicense);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 10 * 1024 * 1024) { setError("File size must be under 10 MB"); return; }
    const valid = ["application/pdf", "image/jpeg", "image/png"];
    if (!valid.includes(selected.type)) { setError("File must be PDF, JPG, or PNG"); return; }
    setFile(selected);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/agency/trade-license", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Upload failed"); return; }
      setUploadedFile({ url: data.url, filename: data.filename, uploadedAt: new Date() });
      setFile(null);
      onUploadComplete?.();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      await fetch("/api/agency/trade-license", { method: "DELETE" });
    } catch { /* non-blocking */ }
    setUploadedFile(null);
    setFile(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-white/90 mb-2">Trade License</h3>
        <p className="text-xs text-white/60 mb-4">
          Upload your company&apos;s trade license. Required before contract signing and payment.
        </p>
      </div>

      {uploadedFile ? (
        <div className="rounded-lg bg-emerald-500/10 ring-1 ring-emerald-400/40 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-emerald-300 mb-1">Trade license uploaded</p>
              <p className="text-xs text-emerald-200/70 truncate">{uploadedFile.filename}</p>
              <p className="text-[10px] text-emerald-200/50 mt-1">
                Uploaded {new Date(uploadedFile.uploadedAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={handleRemove}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white/90 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : file ? (
        <div className="rounded-lg bg-white/5 ring-1 ring-white/10 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <File className="w-5 h-5 text-white/60" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/90 truncate">{file.name}</p>
              <p className="text-xs text-white/60 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white/90 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={cn(
              "w-full mt-3 rounded-lg px-4 py-2 text-sm font-medium transition",
              uploading
                ? "bg-white/5 text-white/30 cursor-not-allowed"
                : "bg-white/10 text-white/90 hover:bg-white/15 ring-1 ring-white/20"
            )}
          >
            {uploading ? "Uploading…" : "Upload License"}
          </button>
        </div>
      ) : (
        <label className="block rounded-lg border-2 border-dashed border-white/10 hover:border-white/20 p-8 text-center cursor-pointer transition">
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <Upload className="w-6 h-6 text-white/60" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/90 mb-1">Upload trade license</p>
              <p className="text-xs text-white/60">PDF, JPG, or PNG (max 10 MB)</p>
            </div>
          </div>
        </label>
      )}

      {error && (
        <div className="rounded-lg bg-red-500/10 ring-1 ring-red-400/40 p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
