import clsx from "clsx";
import type { ClassPhase } from "@/data/types";
import { zoneMeta } from "@/lib/zones";

/**
 * The heart-rate shape of a class: phases left to right, height = zone. Each phase is filled in its zone color.
 * Server-safe SVG; pair it with <PersonalRange> for the visitor's numbers.
 */
export function ClassCurve({ structure, className, showLabels = true, height = 140 }: { structure: ClassPhase[]; className?: string; showLabels?: boolean; height?: number }) {
  const total = structure.reduce((s, p) => s + p.minutes, 0) || 1;
  const W = 1000;
  const H = height;
  const pad = 6;
  const yOf = (zone: number) => H - pad - ((zone - 0.4) / 5) * (H - pad * 2);
  let x = 0;
  const segments = structure.map((p) => {
    const w = (p.minutes / total) * W;
    const seg = { x0: x, x1: x + w, y: yOf(p.zone), phase: p };
    x += w;
    return seg;
  });
  // A smooth outline through the phase tops.
  let d = `M0 ${H}`;
  segments.forEach((s, i) => {
    const prev = segments[i - 1];
    if (!prev) d += ` L0 ${s.y}`;
    else {
      const mid = s.x0;
      d += ` C${mid - 18} ${prev.y} ${mid + 18} ${s.y} ${mid + 30} ${s.y}`;
    }
    d += ` L${s.x1} ${s.y}`;
  });
  d += ` L${W} ${H} Z`;

  return (
    <figure className={clsx("w-full", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block w-full" style={{ height }} role="img" aria-label="Пульс по ходу занятия">
        <defs>
          <clipPath id={`curve-${structure.length}-${total}`}>
            <path d={d} />
          </clipPath>
        </defs>
        <g clipPath={`url(#curve-${structure.length}-${total})`}>
          {segments.map((s, i) => (
            <rect key={i} x={s.x0} y={0} width={s.x1 - s.x0 + 1} height={H} fill={zoneMeta(s.phase.zone).color} opacity={0.85} />
          ))}
        </g>
        {[1, 2, 3, 4, 5].map((z) => (
          <line key={z} x1={0} x2={W} y1={yOf(z)} y2={yOf(z)} stroke="rgb(242 239 234 / 0.07)" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      {showLabels && (
        <figcaption className="mt-3 grid gap-x-3 gap-y-2 text-[12.5px] text-dust" style={{ gridTemplateColumns: segments.map((s) => `${Math.max(1, s.phase.minutes)}fr`).join(" ") }}>
          {segments.map((s, i) => (
            <span key={i} className="min-w-0 border-l border-line/15 pl-2">
              <span className="block truncate text-chalk">{s.phase.title}</span>
              <span className="digits text-[16px]">{s.phase.minutes}′</span> <span>Z{s.phase.zone}</span>
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}
