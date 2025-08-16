"use client";
import Image from "next/image";
import { useState } from "react";

export function Logo({ className = "", height = 28 }: { className?: string; height?: number }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div
        className={
          "inline-flex items-center font-semibold tracking-tight text-gradient motion-safe:hover:shadow-[0_0_24px_rgba(102,123,255,0.25)] motion-reduce:shadow-none " +
          className
        }
      >
        Creator Hive
      </div>
    );
  }
  return (
    <Image
      src="/brand/creator-hive-logo.png"
      alt="Creator Hive"
      width={height * 4}
      height={height}
      priority
      sizes="(max-width: 768px) 112px, 160px"
      className={
        "w-auto rounded-sm motion-safe:transition-shadow motion-safe:hover:shadow-[0_0_24px_rgba(102,123,255,0.25)] motion-reduce:shadow-none " +
        className
      }
      onError={() => setErrored(true)}
    />
  );
}


