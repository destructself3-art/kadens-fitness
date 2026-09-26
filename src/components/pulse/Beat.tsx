"use client";

import { createElement, useRef, type CSSProperties, type ReactNode } from "react";
import clsx from "clsx";
import { useBeat } from "./PulseProvider";

type BeatWordProps = {
  children: ReactNode;
  as?: "span" | "div" | "h1" | "h2" | "p" | "strong";
  className?: string;
  /** Resting width (Science Gothic wdth axis, 50..200) */
  base?: number;
  /** How much wider the word gets on the beat */
  amp?: number;
  /** Resting weight and weight on the beat */
  weight?: [number, number];
  style?: CSSProperties;
  "aria-label"?: string;
};

/** A Science Gothic word that contracts and expands like a heart muscle, in the visitor's rhythm. */
export function BeatWord({ children, as = "span", className, base = 60, amp = 24, weight = [820, 880], style, ...rest }: BeatWordProps) {
  const ref = useRef<HTMLElement>(null);
  useBeat(ref, (el, beat) => {
    el.style.fontVariationSettings = `"wdth" ${(base + beat * amp).toFixed(1)}`;
    el.style.fontWeight = String(Math.round(weight[0] + beat * (weight[1] - weight[0])));
  });
  return createElement(
    as,
    {
      ref,
      className: clsx("font-display uppercase", className),
      style: { fontVariationSettings: `"wdth" ${base}`, fontWeight: weight[0], ...style },
      ...rest,
    },
    children,
  );
}

/** A dot that swells on every beat. Size and color come from className. */
export function BeatDot({ className, scale = 0.9 }: { className?: string; scale?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useBeat(ref, (el, beat) => {
    el.style.transform = `scale(${(1 + beat * scale).toFixed(3)})`;
    el.style.boxShadow = `0 0 ${Math.round(beat * 16)}px currentColor`;
  });
  return <span ref={ref} aria-hidden className={clsx("inline-block rounded-full bg-current", className)} />;
}

/** Sets the CSS variable --beat (0..1) on a wrapper so children can react to the pulse in CSS. */
export function BeatVar({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "span" | "section" }) {
  const ref = useRef<HTMLElement>(null);
  useBeat(ref, (el, beat) => el.style.setProperty("--beat", beat.toFixed(3)));
  return createElement(as, { ref, className }, children);
}
