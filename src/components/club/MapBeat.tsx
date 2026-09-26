"use client";

import { useRef } from "react";
import { useBeat } from "@/components/pulse/PulseProvider";

/** The club marker on the map: an SVG dot whose halo swells in the visitor's rhythm. */
export function MapBeat({ cx, cy }: { cx: number; cy: number }) {
  const halo = useRef<SVGCircleElement>(null);
  useBeat(halo, (el, beat) => {
    el.setAttribute("r", (13 + beat * 15).toFixed(1));
    el.style.opacity = (0.18 + beat * 0.45).toFixed(3);
  });
  return (
    <g>
      <circle ref={halo} cx={cx} cy={cy} r="13" fill="rgb(var(--pulse))" style={{ opacity: 0.18 }} />
      <circle cx={cx} cy={cy} r="7.5" fill="rgb(var(--pulse))" stroke="rgb(var(--asphalt))" strokeWidth="2.5" />
    </g>
  );
}
