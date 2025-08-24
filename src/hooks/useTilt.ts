"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UseTiltOptions {
  maxTiltDeg?: number; // 6-8deg recommended
  perspective?: number; // px
  scale?: number; // 1.0 - 1.05
}

export function useTilt<T extends HTMLElement>({ maxTiltDeg = 7, perspective = 900, scale = 1.02 }: UseTiltOptions = {}) {
  const ref = useRef<T | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // no-op

    function handlePointer(e: PointerEvent) {
      const target = node as T; // non-null after guard
      const rect = target.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const tiltX = (0.5 - y) * maxTiltDeg * 2;
      const tiltY = (x - 0.5) * maxTiltDeg * 2;
      target.style.transform = `perspective(${perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${isHovering ? scale : 1})`;
    }

    function reset() {
      const target = node as T;
      target.style.transform = "perspective(" + perspective + "px) rotateX(0deg) rotateY(0deg) scale(1)";
    }

    const onEnter = () => {
      setIsHovering(true);
    };
    const onLeave = () => {
      setIsHovering(false);
      reset();
    };

    node.addEventListener("pointermove", handlePointer);
    node.addEventListener("pointerenter", onEnter);
    node.addEventListener("pointerleave", onLeave);
    return () => {
      node.removeEventListener("pointermove", handlePointer);
      node.removeEventListener("pointerenter", onEnter);
      node.removeEventListener("pointerleave", onLeave);
    };
  }, [maxTiltDeg, perspective, scale, isHovering]);

  const setRef = useCallback((el: T | null) => {
    ref.current = el;
  }, []);

  return { ref: setRef } as const;
}