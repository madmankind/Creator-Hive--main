"use client";
import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useTilt } from "@/hooks/useTilt";

type Elevation = "base" | "hover" | "active";
type Accent = "purple" | "cyan" | undefined;

export interface TiltCardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: Elevation;
  accent?: Accent;
}

const elevationClass: Record<Elevation, string> = {
  base: "shadow-[var(--shadow-base)]",
  hover: "shadow-[var(--shadow-hover)]",
  active: "shadow-[var(--shadow-hover)] ring-1 ring-[color:var(--color-accent)]",
};

export function TiltCard({ className, elevation = "base", accent, children, ...props }: TiltCardProps) {
  const { ref } = useTilt<HTMLDivElement>({ maxTiltDeg: 7, perspective: 900, scale: 1.02 });
  return (
    <div
      ref={ref}
      data-accent={accent}
      className={cn(
        "relative will-change-transform transform-gpu transition-transform duration-200 [transform-style:preserve-3d]",
        "glass rounded-[var(--radius-lg)]",
        elevationClass[elevation],
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-inherit before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        "before:bg-[radial-gradient(120%_60%_at_0%_0%,color-mix(in_oklab,var(--accent, var(--color-accent))_40%,transparent)_0%,transparent_60%)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

