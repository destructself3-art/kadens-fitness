"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import { ecgValue, usePulse, useBeatFrame } from "./PulseProvider";

type Props = {
  className?: string;
  /** Paper speed in px per second */
  speed?: number;
  /** Draw the cardiogram millimetre grid */
  grid?: boolean;
  color?: string;
  lineWidth?: number;
  /** Baseline position, 0 (top) .. 1 (bottom) */
  baseline?: number;
  /** Peak height as a share of the canvas height */
  amplitude?: number;
};

/**
 * A heart monitor sweep: the trace is drawn left to right in the visitor's rhythm and erases just ahead of itself.
 * With reduced motion it draws a static strip.
 */
export function EcgMonitor({ className, speed = 200, grid = true, color = "#FF3A24", lineWidth = 2, baseline = 0.62, amplitude = 0.5 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef({ w: 0, h: 0, ys: new Float32Array(0), col: 0, carry: 0, phase: 0 });
  const { reducedMotion, rest } = usePulse();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth);
      const h = Math.round(canvas.clientHeight);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      const s = state.current;
      s.w = w;
      s.h = h;
      s.ys = new Float32Array(w + 1).fill(Number.NaN);
      s.col = 0;
      if (reducedMotion) {
        const perBeat = Math.max(140, (speed * 60) / rest);
        for (let x = 0; x <= w; x++) s.ys[x] = ecgValue((x / perBeat) % 1);
        draw(-1);
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, rest, speed]);

  function draw(head: number) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const s = state.current;
    if (!ctx || !s.w) return;
    ctx.clearRect(0, 0, s.w, s.h);
    if (grid) {
      for (let x = 0; x <= s.w; x += 10) {
        ctx.fillStyle = x % 50 === 0 ? "rgba(255,58,36,0.10)" : "rgba(255,58,36,0.04)";
        ctx.fillRect(x, 0, 1, s.h);
      }
      for (let y = 0; y <= s.h; y += 10) {
        ctx.fillStyle = y % 50 === 0 ? "rgba(255,58,36,0.10)" : "rgba(255,58,36,0.04)";
        ctx.fillRect(0, y, s.w, 1);
      }
    }
    const yOf = (v: number) => s.h * baseline - v * s.h * amplitude;
    const gapFrom = head + 2;
    const gapTo = head + 26;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = "round";
    ctx.beginPath();
    let pen = false;
    for (let x = 0; x < s.ys.length; x++) {
      const inGap = head >= 0 && ((x >= gapFrom && x <= gapTo) || x <= gapTo - s.w);
      const v = s.ys[x];
      if (inGap || Number.isNaN(v)) {
        pen = false;
        continue;
      }
      if (!pen) {
        ctx.moveTo(x, yOf(v));
        pen = true;
      } else ctx.lineTo(x, yOf(v));
    }
    ctx.stroke();
    if (head >= 0) {
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(head, yOf(Number.isNaN(s.ys[head]) ? 0 : s.ys[head]), 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  useBeatFrame((frame) => {
    const s = state.current;
    if (reducedMotion || !s.w || frame.dt === 0) return;
    // Advance the pen pixel by pixel so the trace has no holes; the phase follows the shared heartbeat.
    s.carry += speed * frame.dt;
    const n = Math.floor(s.carry);
    s.carry -= n;
    const before = s.phase;
    let delta = frame.phase - before;
    if (delta < 0) delta += 1;
    for (let i = 1; i <= n; i++) {
      s.col = (s.col + 1) % s.w;
      s.ys[s.col] = ecgValue((before + (delta * i) / n) % 1);
    }
    s.phase = frame.phase;
    draw(s.col);
  });

  return <canvas ref={canvasRef} aria-hidden className={clsx("block h-full w-full", className)} />;
}
