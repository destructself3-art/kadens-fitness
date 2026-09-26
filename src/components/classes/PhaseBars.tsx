import clsx from "clsx";
import type { ClassPhase } from "@/data/types";
import { zoneMeta } from "@/lib/zones";

/**
 * A tiny equaliser of a class: one bar per phase, width = minutes, height = zone.
 * Decorative (the text next to it carries the meaning). Server-safe, no ids, so any number can share a page.
 */
export function PhaseBars({ structure, className }: { structure: ClassPhase[]; className?: string }) {
  const total = structure.reduce((s, p) => s + p.minutes, 0) || 1;
  const H = 20;
  let x = 0;
  return (
    <svg viewBox={`0 0 ${total} ${H}`} preserveAspectRatio="none" className={clsx("block", className)} aria-hidden focusable="false">
      {structure.map((p, i) => {
        const h = (p.zone / 5) * H;
        const rect = <rect key={i} x={x + 0.35} y={H - h} width={Math.max(0.4, p.minutes - 0.7)} height={h} fill={zoneMeta(p.zone).color} />;
        x += p.minutes;
        return rect;
      })}
    </svg>
  );
}
