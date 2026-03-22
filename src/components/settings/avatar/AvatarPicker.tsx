"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type RefObject } from "react";
import { Camera, ChevronDown, ImageIcon, Trash2, Upload, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { st } from "../settingsPrimitives";

export type AvatarSourcesPayload = {
  google: { available: boolean; imageUrl: string | null };
  instagram: { available: boolean; imageUrl: string | null; handle: string | null };
  tiktok: { available: boolean; imageUrl: string | null; handle: string | null };
};

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const on = () => setIsMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [breakpoint]);
  return isMobile;
}

function initialsFrom(name: string, email: string) {
  const n = name.trim();
  if (n.length >= 2) return n.slice(0, 2).toUpperCase();
  const e = email.trim();
  if (e.length >= 2) return e.slice(0, 2).toUpperCase();
  return "?";
}

export function AvatarPreview({
  src,
  initials,
  size = 72,
  className,
}: {
  src: string | null;
  initials: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("relative shrink-0 overflow-hidden rounded-full ring-1 ring-white/[0.08]", className)}
      style={{ width: size, height: size, background: st.surfaceElevated }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[13px] font-semibold tracking-wide text-white/55">{initials}</div>
      )}
    </div>
  );
}

function ImageSourceOption({
  icon: Icon,
  label,
  disabled,
  onClick,
}: {
  icon: typeof Upload;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] text-white/88 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-35"
    >
      <Icon className="h-4 w-4 shrink-0 text-white/45" aria-hidden />
      <span className="flex-1">{label}</span>
    </button>
  );
}

type AvatarPhotoMenuProps = {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
  sources: AvatarSourcesPayload | null;
  /** Ref anchor for desktop popover positioning */
  anchorRef: RefObject<HTMLElement | null>;
  onPickFile: (file: File) => void;
  onImportUrl: (url: string, source: "google" | "instagram" | "tiktok") => void;
  onRemove: () => void;
};

/**
 * Desktop: anchored menu. Mobile: bottom sheet with backdrop.
 */
export function AvatarPhotoMenu({
  open,
  onClose,
  isMobile,
  sources,
  anchorRef,
  onPickFile,
  onImportUrl,
  onRemove,
}: AvatarPhotoMenuProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) onPickFile(f);
    onClose();
  };

  const googleUrl = sources?.google.imageUrl;
  const instaUrl = sources?.instagram.imageUrl;
  const tikUrl = sources?.tiktok.imageUrl;

  const menuBody = (
    <div className="p-1.5">
      {isMobile ? (
        <>
          <ImageSourceOption
            icon={Camera}
            label="Take photo"
            onClick={() => {
              cameraRef.current?.click();
            }}
          />
          <ImageSourceOption
            icon={ImageIcon}
            label="Choose from photo library"
            onClick={() => {
              libraryRef.current?.click();
            }}
          />
          <ImageSourceOption
            icon={Upload}
            label="Choose file"
            onClick={() => {
              fileRef.current?.click();
            }}
          />
        </>
      ) : (
        <>
          <ImageSourceOption
            icon={Upload}
            label="Upload from computer"
            onClick={() => {
              fileRef.current?.click();
            }}
          />
          <ImageSourceOption
            icon={ImageIcon}
            label="Choose file"
            onClick={() => {
              fileRef.current?.click();
            }}
          />
        </>
      )}

      {googleUrl ? (
        <ImageSourceOption
          icon={User}
          label="Use Google profile photo"
          onClick={() => {
            onImportUrl(googleUrl, "google");
            onClose();
          }}
        />
      ) : sources?.google.available ? (
        <ImageSourceOption icon={User} label="Use Google profile photo" disabled onClick={() => {}} />
      ) : null}

      {instaUrl ? (
        <ImageSourceOption
          icon={User}
          label="Use Instagram photo"
          onClick={() => {
            onImportUrl(instaUrl, "instagram");
            onClose();
          }}
        />
      ) : sources?.instagram.available ? (
        <ImageSourceOption icon={User} label="Use Instagram photo" disabled onClick={() => {}} />
      ) : null}

      {tikUrl ? (
        <ImageSourceOption
          icon={User}
          label="Use TikTok photo"
          onClick={() => {
            onImportUrl(tikUrl, "tiktok");
            onClose();
          }}
        />
      ) : null}

      <div className="my-1 h-px w-full bg-white/[0.06]" />

      <ImageSourceOption
        icon={Trash2}
        label="Remove photo"
        onClick={() => {
          onRemove();
          onClose();
        }}
      />
    </div>
  );

  const hiddenInputs = (
    <>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFiles} />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFiles}
      />
      <input ref={libraryRef} type="file" accept="image/*" className="hidden" onChange={handleFiles} />
    </>
  );

  if (!open) return hiddenInputs;

  if (isMobile) {
    return (
      <>
        {hiddenInputs}
        <button type="button" className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-[2px]" aria-label="Close" onClick={onClose} />
        <div
          className="fixed inset-x-0 bottom-0 z-[61] rounded-t-[20px] border border-white/[0.08] p-2 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-24px_80px_rgba(0,0,0,0.65)]"
          style={{ background: st.frameFill }}
          role="dialog"
          aria-modal="true"
        >
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-white/15" />
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">Profile photo</p>
          {menuBody}
        </div>
      </>
    );
  }

  const anchor = anchorRef.current;
  const rect = anchor?.getBoundingClientRect();

  return (
    <>
      {hiddenInputs}
      <button type="button" className="fixed inset-0 z-[60]" aria-label="Close menu" onClick={onClose} />
      <div
        className="fixed z-[61] min-w-[260px] overflow-hidden rounded-xl border border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
        style={{
          background: st.frameFill,
          top: rect ? rect.bottom + 8 : 120,
          left: rect ? Math.min(rect.left, window.innerWidth - 280) : 24,
        }}
        role="menu"
      >
        {menuBody}
      </div>
    </>
  );
}

export type AvatarPickerProps = {
  name: string;
  email: string;
  /** Resolved preview URL (blob, https, or data URL) */
  previewSrc: string | null;
  /** When user has unsaved removal */
  isRemoved: boolean;
  onFileSelected: (file: File) => void;
  onImportUrl: (url: string, source: "google" | "instagram" | "tiktok") => void;
  onRemove: () => void;
};

/**
 * Premium account avatar control — menu / sheet, no URL field.
 */
export function AvatarPicker({ name, email, previewSrc, isRemoved, onFileSelected, onImportUrl, onRemove }: AvatarPickerProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [sources, setSources] = useState<AvatarSourcesPayload | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const uid = useId();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/settings/avatar-sources", { credentials: "include" });
        if (!r.ok) return;
        const j = (await r.json()) as AvatarSourcesPayload;
        if (!cancelled) setSources(j);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const initials = useMemo(() => initialsFrom(name, email), [name, email]);

  const displaySrc = isRemoved ? null : previewSrc;

  const openMenu = useCallback(() => setOpen(true), []);
  const closeMenu = useCallback(() => setOpen(false), []);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div ref={anchorRef} className="flex items-center gap-4">
        <button
          type="button"
          id={`${uid}-avatar`}
          onClick={openMenu}
          className="group relative rounded-full outline-none ring-offset-2 ring-offset-[#050508] focus-visible:ring-2 focus-visible:ring-teal-400/50"
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <AvatarPreview src={displaySrc} initials={initials} size={72} />
          <span className="pointer-events-none absolute inset-0 rounded-full bg-black/0 transition group-hover:bg-black/20" />
        </button>
        <div className="min-w-0">
          <p className="text-[11px] leading-relaxed" style={{ color: st.muted }}>
            Shown on your account and where your name appears. Changes apply when you save.
          </p>
          <button
            type="button"
            onClick={openMenu}
            className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-white/55 transition hover:text-white/80"
          >
            Change photo
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>
        </div>
      </div>

      <AvatarPhotoMenu
        open={open}
        onClose={closeMenu}
        isMobile={isMobile}
        sources={sources}
        anchorRef={anchorRef}
        onPickFile={onFileSelected}
        onImportUrl={onImportUrl}
        onRemove={onRemove}
      />
    </div>
  );
}
