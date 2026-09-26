"use client";

import { useEffect, useRef } from "react";

// A cardiogram strip along the bottom edge of the header. The red trace fills in as you scroll the page:
// the whole site reads as one heartbeat strip from top to bottom.

const BEAT_EVERY = 160; // viewBox units between beats
const WIDTH = 1600;

function tracePath() {
  let d = "M0 12";
  for (let x = 0; x < WIDTH; x += BEAT_EVERY) {
    const b = x + BEAT_EVERY * 0.55;
    d += ` L${b} 12 L${b + 6} 9 L${b + 10} 12 L${b + 16} 12 L${b + 20} 15 L${b + 25} 1 L${b + 31} 21 L${b + 35} 12 L${b + 48} 12 L${b + 58} 8 L${b + 68} 12`;
  }
  return `${d} L${WIDTH} 12`;
}

const PATH = tracePath();

export function EcgRail() {
  const clip = useRef<SVGRectElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      clip.current?.setAttribute("width", String(p * WIDTH));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <svg className="pointer-events-none absolute inset-x-0 -bottom-[11px] h-[22px] w-full" viewBox={`0 0 ${WIDTH} 24`} preserveAspectRatio="none" aria-hidden>
      <defs>
        <clipPath id="ecg-rail-progress">
          <rect ref={clip} x="0" y="0" width="0" height="24" />
        </clipPath>
      </defs>
      <path d={PATH} stroke="rgb(242 239 234 / 0.1)" strokeWidth="1.2" fill="none" vectorEffect="non-scaling-stroke" />
      <path d={PATH} stroke="#FF3A24" strokeWidth="1.6" fill="none" vectorEffect="non-scaling-stroke" clipPath="url(#ecg-rail-progress)" />
    </svg>
  );
}
