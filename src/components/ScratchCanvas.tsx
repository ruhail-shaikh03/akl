"use client";

import { useEffect, useRef, useState } from "react";

const REVEAL_THRESHOLD = 0.5;
const BRUSH_RADIUS = 22;

export function ScratchCanvas({
  onRevealed,
  disabled = false,
  className,
  label = "Scratch me",
  children,
}: {
  onRevealed: () => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (disabled) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#c7a8ae");
    gradient.addColorStop(1, "#8a6f72");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "600 13px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, width / 2, height / 2);

    setReady(true);

    let drawing = false;
    let revealed = false;
    let moveCount = 0;

    function localPoint(clientX: number, clientY: number) {
      const r = canvas!.getBoundingClientRect();
      return { x: clientX - r.left, y: clientY - r.top };
    }

    function scratchAt(x: number, y: number) {
      ctx!.globalCompositeOperation = "destination-out";
      ctx!.beginPath();
      ctx!.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2);
      ctx!.fill();
    }

    function checkRevealPercent() {
      if (revealed) return;
      const w = canvas!.width;
      const h = canvas!.height;
      const data = ctx!.getImageData(0, 0, w, h).data;
      let transparent = 0;
      let total = 0;
      // Sample every 10th pixel's alpha channel for performance.
      for (let i = 3; i < data.length; i += 40) {
        total++;
        if (data[i] === 0) transparent++;
      }
      if (total > 0 && transparent / total > REVEAL_THRESHOLD) {
        revealed = true;
        canvas!.style.transition = "opacity 300ms ease";
        canvas!.style.opacity = "0";
        setTimeout(onRevealed, 300);
      }
    }

    function handlePointerDown(e: PointerEvent) {
      drawing = true;
      const p = localPoint(e.clientX, e.clientY);
      scratchAt(p.x, p.y);
    }
    function handlePointerMove(e: PointerEvent) {
      if (!drawing) return;
      const p = localPoint(e.clientX, e.clientY);
      scratchAt(p.x, p.y);
      moveCount += 1;
      if (moveCount % 4 === 0) checkRevealPercent();
    }
    function handlePointerUp() {
      if (!drawing) return;
      drawing = false;
      checkRevealPercent();
    }

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [disabled, onRevealed, label]);

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      {children}
      {!disabled && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none rounded-[inherit]"
          style={{ opacity: ready ? 1 : 0, cursor: "pointer" }}
        />
      )}
    </div>
  );
}
