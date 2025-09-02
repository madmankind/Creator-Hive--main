"use client";
import { useState, useRef } from "react";

export default function HeroSearch({
  onDiscover,
}: {
  onDiscover?: (q: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-3 w-full max-w-[980px] mx-auto">
      <div
        className="flex-1 relative"
        onClick={() => ref.current?.focus()}
      >
        <input
          ref={ref}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              ref.current?.blur();
            }
          }}
          aria-label="Search creators"
          className="w-full h-14 rounded-full px-6 pr-12 shadow-inner-subtle outline-none transition-all
                     focus:ring-2 focus:ring-opacity-30"
          style={{
            backgroundColor: 'rgba(13, 17, 23, 0.8)',
            color: 'var(--text-primary)',
            '--tw-ring-color': 'rgba(34, 211, 238, 0.3)',
          } as React.CSSProperties}
          placeholder={focused ? "Short description of your campaign brief & talent" : ""}
        />
        {/* right bullet/enter icon space if needed */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[rgba(255,255,255,0.03)] border border-white/5" />
      </div>

      <button
        onClick={() => onDiscover?.(ref.current?.value ?? "")}
        className="h-12 px-5 rounded-full transition-colors focus:outline-none focus-visible:ring-2"
        style={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          color: 'var(--text-primary)',
          '--tw-ring-color': 'rgba(34, 211, 238, 0.4)',
        } as React.CSSProperties}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.09)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
        }}
      >
        Discover
      </button>
    </div>
  );
}