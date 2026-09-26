import clsx from "clsx";
import type { ClassPhase } from "@/data/types";
import { ZONES } from "@/lib/zones";
import { ClassCurve } from "./ClassCurve";
import { minuteTicks } from "./helpers";

/**
 * The class curve at full size, with a zone scale on the right and a minute axis below.
 * The zone guides use the same vertical mapping as ClassCurve, so labels sit on its dashed lines.
 */
export function CurveChart({ structure, height = 240, className }: { structure: ClassPhase[]; height?: number; className?: string }) {
  const total = structure.reduce((s, p) => s + p.minutes, 0) || 1;
  const pad = 6;
  const topPct = (zone: number) => ((height - pad - ((zone - 0.4) / 5) * (height - pad * 2)) / height) * 100;
  const ticks = minuteTicks(total);

  return (
    <div className={className}>
      <div className="flex gap-4">
        <div className="min-w-0 flex-1 overflow-hidden rounded-xl">
          <ClassCurve structure={structure} height={height} showLabels={false} />
        </div>
        <ul className="relative hidden w-[112px] flex-none md:block" style={{ height }} aria-hidden>
          {ZONES.map((z) => (
            <li key={z.id} className="absolute left-0 flex -translate-y-1/2 items-center gap-2 whitespace-nowrap text-[12px] text-dust" style={{ top: `${topPct(z.id)}%` }}>
              <span className="h-[3px] w-3 rounded-full" style={{ background: z.color }} />
              <span className="font-semibold text-chalk">Z{z.id}</span> {z.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="relative mt-2 h-6 md:mr-[128px]" aria-hidden>
        {ticks.map((t, i) => (
          <span
            key={t}
            className={clsx("digits absolute top-0 text-[16px] leading-none text-dust", i === 0 ? "" : i === ticks.length - 1 ? "-translate-x-full" : "-translate-x-1/2")}
            style={{ left: `${(t / total) * 100}%` }}
          >
            {t}′
          </span>
        ))}
      </div>
    </div>
  );
}
