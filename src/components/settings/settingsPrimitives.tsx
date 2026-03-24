"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { feyTokens } from "@/lib/fey-design-tokens";
import { cn } from "@/lib/utils";

/** Creator Hive settings — dark, sharp surfaces (Fey-inspired restraint, not generic SaaS). */
export const st = {
  bg: "#050508",
  hairline: "rgba(255,255,255,0.055)",
  hairlineStrong: "rgba(255,255,255,0.09)",
  surface: "rgba(255,255,255,0.028)",
  surfaceElevated: "rgba(255,255,255,0.04)",
  paneBg: "linear-gradient(180deg, rgba(255,255,255,0.028) 0%, rgba(0,0,0,0.12) 52%, rgba(0,0,0,0) 100%)",
  frameFill: "rgba(6,6,10,0.65)",
  railActive: "rgba(255,255,255,0.055)",
  railActiveBorder: "rgba(255,255,255,0.1)",
  railAccent: "rgba(94,234,212,0.55)",
  muted: feyTokens.colors.text.muted,
  label: feyTokens.colors.text.label,
} as const;

export function SettingsShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn("min-h-screen w-full", className)}
      style={{
        background: st.bg,
        color: feyTokens.colors.text.primary,
        paddingBottom: "max(5rem, env(safe-area-inset-bottom))",
      }}
    >
      {children}
    </div>
  );
}

/** Desktop-only: single title area for the active section (no duplicate H1 in body). */
export function SettingsDesktopSectionHeader({
  eyebrow = "Creator Hive",
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-5 shrink-0 lg:mb-7">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: st.label }}>
        {eyebrow}
      </p>
      <h1 className="mt-1.5 text-[24px] font-semibold tracking-[-0.03em] text-white/[0.94] lg:text-[26px]">{title}</h1>
      {subtitle ? (
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed" style={{ color: st.muted }}>
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}

/** Desktop content frame — anchors the pane so controls read as a single surface. */
export function SettingsDesktopContentFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "w-full rounded-[22px] border border-white/[0.06] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:p-6 lg:rounded-[24px] lg:p-8 lg:shadow-[0_32px_100px_rgba(0,0,0,0.6)]",
        className,
      )}
      style={{
        background: st.frameFill,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {children}
    </div>
  );
}

export function SettingsCardIntro({ children }: { children: ReactNode }) {
  return (
    <p className="border-b border-white/[0.055] px-5 py-4 text-[12px] leading-relaxed lg:px-6" style={{ color: st.muted }}>
      {children}
    </p>
  );
}

export function SettingsCardFootnote({ children }: { children: ReactNode }) {
  return (
    <p
      className="border-t border-white/[0.055] px-5 py-3.5 text-[11px] leading-relaxed lg:px-6"
      style={{ color: st.muted, background: "rgba(0,0,0,0.18)" }}
    >
      {children}
    </p>
  );
}

export function SettingsRail({
  items,
  activeId,
  onSelect,
  className,
}: {
  items: { id: string; label: string }[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  return (
    <nav className={cn("flex flex-col gap-0.5 px-4", className)}>
      {items.map((item) => {
        const on = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className="relative rounded-xl py-2.5 pl-3 pr-3 text-left text-[13px] font-medium transition-colors"
            style={{
              background: on ? st.railActive : "transparent",
              color: on ? "rgba(250,250,250,0.96)" : feyTokens.colors.text.secondary,
              boxShadow: on ? `inset 0 0 0 1px ${st.railActiveBorder}` : undefined,
            }}
          >
            {on ? (
              <span
                className="pointer-events-none absolute bottom-2 left-0 top-2 w-[2px] rounded-full"
                style={{
                  background: st.railAccent,
                  boxShadow: "0 0 12px rgba(45,212,191,0.35)",
                }}
                aria-hidden
              />
            ) : null}
            <span className="relative block pl-1">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/** Primary monolithic panel — subtle depth, clean edge. */
export function SettingsSectionCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn("rounded-[20px] p-px lg:rounded-[22px]", className)}
      style={{
        background: `linear-gradient(145deg, ${st.hairlineStrong}, ${st.hairline})`,
        boxShadow: "0 22px 56px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <div
        className="overflow-hidden rounded-[19px] lg:rounded-[21px]"
        style={{
          background: st.surface,
          boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.035)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Secondary / companion panel — quieter, less elevation. */
export function SettingsSectionCardSecondary({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn("rounded-[18px] p-px", className)}
      style={{
        background: st.hairline,
        boxShadow: "0 8px 28px rgba(0,0,0,0.35)",
      }}
    >
      <div
        className="overflow-hidden rounded-[17px]"
        style={{
          background: "rgba(255,255,255,0.018)",
          boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.025)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function SettingsInsetLabel({ children }: { children: ReactNode }) {
  return (
    <div
      className="px-5 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] first:pt-4"
      style={{ color: st.label }}
    >
      {children}
    </div>
  );
}

/** Rows: single divide-y stack — avoid manual dividers between every row. */
export function SettingsList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col divide-y divide-white/[0.055]", className)}>{children}</div>;
}

export function SettingsValueRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex min-h-[52px] flex-col justify-center gap-0.5 px-5 py-3 sm:min-h-[48px] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-3 lg:px-6">
      <span className="text-[12px] font-semibold tracking-wide text-white/[0.84]">{label}</span>
      <div className="min-w-0 flex-1 text-left sm:max-w-[62%] sm:text-right">
        <span className="text-[13px] font-medium text-white/[0.74]">{value}</span>
        {hint ? (
          <p className="mt-0.5 text-[11px] leading-snug sm:text-right" style={{ color: st.muted }}>
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function SettingsActionRow({
  href,
  label,
  hint,
  external,
  onClick,
  trailing,
  disabled,
}: {
  href?: string;
  label: string;
  hint?: string;
  external?: boolean;
  onClick?: () => void;
  trailing?: ReactNode;
  disabled?: boolean;
}) {
  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold tracking-wide text-white/[0.88]">{label}</p>
        {hint ? (
          <p className="mt-0.5 text-[11px] leading-snug" style={{ color: st.muted }}>
            {hint}
          </p>
        ) : null}
      </div>
      {trailing ?? <ChevronRight className="h-4 w-4 shrink-0 opacity-30" aria-hidden />}
    </>
  );

  const cls = cn(
    "flex min-h-[52px] w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-white/[0.035] active:bg-white/[0.05] sm:min-h-[48px] lg:px-6",
    disabled && "cursor-not-allowed opacity-45",
  );

  if (href) {
    const Comp = external ? "a" : Link;
    const props = external ? ({ href, target: "_blank", rel: "noreferrer" } as const) : { href };
    return (
      <Comp {...props} className={cls}>
        {inner}
      </Comp>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  );
}

export function SettingsIdentityStrip({
  name,
  email,
  imageUrl,
  badge,
}: {
  name: string;
  email: string;
  imageUrl?: string | null;
  badge: ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-4 px-5 py-5 lg:px-6 lg:py-6"
      style={{
        borderBottom: `1px solid ${st.hairline}`,
        background: "linear-gradient(100deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0) 58%)",
      }}
    >
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-[17px] font-semibold text-white/90 lg:h-[60px] lg:w-[60px]"
        style={{
          background: "rgba(255,255,255,0.08)",
          boxShadow: `inset 0 0 0 1px ${st.hairlineStrong}`,
        }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span>{name.slice(0, 1).toUpperCase()}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 gap-y-1">
          <p className="truncate text-[16px] font-semibold tracking-[-0.02em] lg:text-[17px] text-white/[0.94]">{name}</p>
          <span className="shrink-0">{badge}</span>
        </div>
        <p className="truncate text-[12px] lg:text-[13px]" style={{ color: st.muted }}>
          {email}
        </p>
      </div>
    </div>
  );
}

export function SettingsWorkspaceBadge({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
      style={{
        background: "rgba(255,255,255,0.06)",
        color: "rgba(255,255,255,0.5)",
        boxShadow: `inset 0 0 0 1px ${st.hairline}`,
      }}
    >
      {children}
    </span>
  );
}

/** Quiet sign-out in a composed footer strip (not isolated red text). */
export function SettingsAccountFooter({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-5 py-3.5 lg:px-6"
      style={{
        borderTop: `1px solid ${st.hairline}`,
        background: "rgba(0,0,0,0.28)",
      }}
    >
      <p className="text-[11px] lg:max-w-[55%]" style={{ color: st.muted }}>
        Signing out ends this session on this device.
      </p>
      <button
        type="button"
        onClick={onSignOut}
        className="shrink-0 rounded-lg px-3 py-2 text-[12px] font-medium text-white/50 transition hover:bg-white/[0.06] hover:text-white/80"
      >
        Sign out
      </button>
    </div>
  );
}

export function SettingsSubpage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-4 pb-12 pt-1 sm:px-0", className)}>{children}</div>;
}


export const settingsInputClass =
  "w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2.5 text-[13px] text-white/[0.92] outline-none placeholder:text-white/35 focus:border-teal-400/35 focus:ring-1 focus:ring-teal-400/20";

export const settingsSelectClass = settingsInputClass + " appearance-none";

/** Read-only system / auth / legal metadata — visually quieter than editable values. */
export function SettingsMetaRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex min-h-[48px] flex-col justify-center gap-0.5 px-5 py-3 sm:min-h-[44px] sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:py-3 lg:px-6">
      <span className="pt-0.5 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: st.label }}>
        {label}
      </span>
      <div className="min-w-0 flex-1 text-left sm:max-w-[65%] sm:text-right">
        <div className="text-[13px] text-white/55">{value}</div>
        {hint ? (
          <p className="mt-1 text-[11px] leading-snug sm:text-right" style={{ color: st.muted }}>
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** Editable field row — label + control (caller supplies real inputs). */
export function SettingsFieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 px-5 py-3.5 lg:px-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <span className="text-[12px] font-semibold tracking-wide text-white/[0.88]">{label}</span>
        <div className="w-full min-w-0 sm:max-w-[min(100%,28rem)]">{children}</div>
      </div>
      {hint ? (
        <p className="text-[11px] leading-snug" style={{ color: st.muted }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function SettingsMobileRootRow({
  label,
  hint,
  onClick,
}: {
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[52px] w-full items-center justify-between gap-3 rounded-[20px] px-4 py-3 text-left transition hover:bg-white/[0.03]"
      style={{
        boxShadow: `inset 0 0 0 1px ${st.hairline}`,
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div>
        <p className="text-[14px] font-medium text-white/[0.9]">{label}</p>
        {hint ? (
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug" style={{ color: st.muted }}>
            {hint}
          </p>
        ) : null}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 opacity-25" />
    </button>
  );
}
