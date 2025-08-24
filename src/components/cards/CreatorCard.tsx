"use client";
import Image from "next/image";
import { TiltCard } from "@/components/primitives/TiltCard";
import { GradientBorder } from "@/components/primitives/GradientBorder";
import { cn, formatCurrency } from "@/lib/utils";
import { Heart, Share2, FilePlus } from "lucide-react";

interface CreatorCardProps {
  name: string;
  avatar: string;
  role: string;
  rate: number;
  availability?: string;
  accent?: "purple" | "cyan";
  className?: string;
}

export function CreatorCard({ name, avatar, role, rate, availability = "Open", accent = "purple", className }: CreatorCardProps) {
  return (
    <GradientBorder rounded="lg" className={cn("bg-[color:var(--color-card)]", className)}>
      <TiltCard elevation="hover" accent={accent} className="p-5 rounded-[var(--radius-lg)]">
        <div className="flex items-center gap-4">
          <Image src={avatar} alt="" width={56} height={56} className="rounded-full object-cover" />
          <div className="min-w-0">
            <div className="font-semibold truncate">{name}</div>
            <div className="text-sm text-[color:var(--text-muted)] truncate">{role}</div>
          </div>
          <div className="ml-auto flex items-center gap-2 text-[color:var(--text-muted)]">
            <button aria-label="Save" className="h-8 w-8 grid place-items-center rounded-md hover:bg-[color:var(--muted)] focus-ring"><Heart size={16} /></button>
            <button aria-label="Share" className="h-8 w-8 grid place-items-center rounded-md hover:bg-[color:var(--muted)] focus-ring"><Share2 size={16} /></button>
            <button aria-label="Brief" className="h-8 w-8 grid place-items-center rounded-md hover:bg-[color:var(--muted)] focus-ring"><FilePlus size={16} /></button>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-[color:var(--text-secondary)]">{formatCurrency(rate, "USD")} / day</div>
          <div className="px-2 py-1 rounded-full text-xs bg-[color:var(--muted)] text-[color:var(--text-secondary)]">{availability}</div>
        </div>
      </TiltCard>
    </GradientBorder>
  );
}

