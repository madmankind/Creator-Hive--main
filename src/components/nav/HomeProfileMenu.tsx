"use client";

import { useRef, useEffect, useState, useCallback, type ComponentType } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Settings,
  LogOut,
  ArrowLeftRight,
  HelpCircle,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

type HomeProfileMenuProps = {
  className?: string;
};

export function HomeProfileMenu({ className }: HomeProfileMenuProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [close]);

  if (status === "loading" || !session?.user) return null;

  const role = (session.user as { role?: string | null }).role ?? null;
  const name = session.user.name?.trim() || session.user.email?.split("@")[0] || "Account";
  const email = session.user.email ?? "";
  const image = session.user.image;

  const isCreator = role === "CREATOR";
  const isAgency = role === "AGENCY";
  const workspaceLabel = isCreator
    ? "Creator workspace"
    : isAgency
      ? "Client workspace"
      : role === "ADMIN"
        ? "Admin"
        : "Workspace";

  const settingsHref = "/dashboard/settings";

  const switchWorkspaceHref = isCreator ? "/" : "/dashboard/creator";
  const switchWorkspaceLabel = isCreator
    ? "Brand / client experience"
    : "Creator home & tools";

  return (
    <div
      ref={rootRef}
      className={cn("fixed top-5 right-5 z-[100]", className)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full ring-1 transition",
          open
            ? "bg-white/12 ring-white/25 shadow-[0_0_0_3px_rgba(124,92,255,0.2)]"
            : "bg-white/[0.06] ring-white/10 hover:bg-white/10 hover:ring-white/18",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span className="text-[13px] font-semibold text-white/85">
            {name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-[min(92vw,280px)] overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c12]/95 shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        >
          <div className="border-b border-white/[0.06] px-4 py-3">
            <p className="truncate text-[14px] font-medium text-white/90">{name}</p>
            <p className="truncate text-[12px] text-white/40">{email}</p>
            <p className="mt-1.5 inline-flex rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/45">
              {workspaceLabel}
            </p>
          </div>

          <div className="py-1">
            <MenuRow
              icon={Settings}
              label="Settings"
              onClick={() => {
                close();
                router.push(settingsHref);
              }}
            />
            <MenuRow
              icon={ArrowLeftRight}
              label="Switch workspace"
              sub={switchWorkspaceLabel}
              onClick={() => {
                close();
                router.push(switchWorkspaceHref);
              }}
            />
            <MenuRow
              icon={HelpCircle}
              label="Help"
              onClick={() => {
                close();
                window.open("mailto:support@creatorhive.ae?subject=Creator%20Hive%20help", "_blank");
              }}
            />
          </div>

          <div className="border-t border-white/[0.06] py-1">
            <MenuRow
              icon={LogOut}
              label="Log out"
              danger
              onClick={() => {
                close();
                void signOut({ callbackUrl: "/" });
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-1 border-t border-white/[0.06] py-2 text-[11px] text-white/35 hover:bg-white/[0.03] hover:text-white/50"
            aria-label="Close menu"
          >
            <ChevronUp className="h-3.5 w-3.5" />
            Close
          </button>
        </div>
      )}
    </div>
  );
}

function MenuRow({
  icon: Icon,
  label,
  sub,
  danger,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  sub?: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-2.5 text-left transition hover:bg-white/[0.05]",
        danger && "hover:bg-red-500/[0.07]",
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0 opacity-70",
          danger ? "text-red-400/90" : "text-white/55",
        )}
      />
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-[13px] font-medium",
            danger ? "text-red-400/90" : "text-white/85",
          )}
        >
          {label}
        </span>
        {sub && (
          <span className="mt-0.5 block text-[11px] leading-snug text-white/35">
            {sub}
          </span>
        )}
      </span>
    </button>
  );
}
