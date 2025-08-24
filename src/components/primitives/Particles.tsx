"use client";
import { memo, useEffect, useRef } from "react";

interface ParticlesProps {
  density?: number; // number of particles per 10k px²
  color?: string; // CSS color
  className?: string;
}

function draw(ctx: CanvasRenderingContext2D, width: number, height: number, density: number, color: string) {
  ctx.clearRect(0, 0, width, height);
  const count = Math.min(120, Math.round((width * height) / 10000 * density));
  for (let i = 0; i < count; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = Math.random() * 1.4 + 0.4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = Math.random() * 0.35 + 0.15;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export const Particles = memo(function Particles({ density = 0.6, color = "rgba(124,58,237,0.4)", className }: ParticlesProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let raf = 0;
    function loop() {
      const ctx = context as CanvasRenderingContext2D; // stable reference
      const c = canvas as HTMLCanvasElement;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const width = c.clientWidth;
      const height = c.clientHeight;
      if (c.width !== width * dpr || c.height !== height * dpr) {
        c.width = width * dpr;
        c.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      draw(ctx, width, height, density, color);
      if (!reduce) raf = requestAnimationFrame(loop);
    }
    loop();
    return () => cancelAnimationFrame(raf);
  }, [density, color]);

  return <canvas ref={ref} className={className} aria-hidden />;
});

