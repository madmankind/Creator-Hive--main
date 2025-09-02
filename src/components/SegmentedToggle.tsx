"use client";
import { useState } from "react";

type Tab = "hire" | "getHired";

export default function SegmentedToggle({
  defaultValue = "hire",
  onChange,
}: {
  defaultValue?: Tab;
  onChange?: (v: Tab) => void;
}) {
  const [val, setVal] = useState<Tab>(defaultValue as Tab);
  const click = (v: Tab) => {
    setVal(v);
    onChange?.(v);
  };

  const btn = "px-3.5 h-9 rounded-full text-xs tracking-wide transition-colors focus:outline-none focus-visible:ring-2 ring-offset-0";
  const activeStyle = { backgroundColor: 'var(--surface)', color: 'var(--text-primary)' };
  const idleStyle = { backgroundColor: 'rgba(255,255,255,0.04)', color: 'var(--text-dim)' };
  const focusStyle = { '--tw-ring-color': 'rgba(34, 211, 238, 0.4)' } as React.CSSProperties;

  return (
    <div role="tablist" aria-label="mode" className="inline-flex items-center gap-2">
      <button 
        role="tab" 
        aria-selected={val === "hire"} 
        className={btn}
        style={val === "hire" ? { ...activeStyle, ...focusStyle } : { ...idleStyle, ...focusStyle }}
        onClick={() => click("hire")}
        onMouseEnter={(e) => {
          if (val !== "hire") {
            e.currentTarget.style.color = 'var(--text-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (val !== "hire") {
            e.currentTarget.style.color = 'var(--text-dim)';
          }
        }}
      >
        Hire
      </button>
      <button 
        role="tab" 
        aria-selected={val === "getHired"} 
        className={btn}
        style={val === "getHired" ? { ...activeStyle, ...focusStyle } : { ...idleStyle, ...focusStyle }}
        onClick={() => click("getHired")}
        onMouseEnter={(e) => {
          if (val !== "getHired") {
            e.currentTarget.style.color = 'var(--text-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (val !== "getHired") {
            e.currentTarget.style.color = 'var(--text-dim)';
          }
        }}
      >
        Get hired
      </button>
    </div>
  );
}