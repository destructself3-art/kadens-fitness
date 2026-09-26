import clsx from "clsx";
import type { ClassPhase } from "@/data/types";
import { PersonalRange } from "@/components/pulse/Zones";
import { ZoneBadge } from "@/components/ui/Kit";
import { zoneMeta } from "@/lib/zones";
import { timeline } from "./helpers";

/** The phases of a class in order: minutes, zone and the visitor's heart-rate range for each. */
export function PhaseTable({ structure, className }: { structure: ClassPhase[]; className?: string }) {
  const phases = timeline(structure);
  const total = phases.at(-1)?.end ?? 1;
  return (
    <ol className={clsx("border-t border-line/10", className)}>
      {phases.map((p, i) => {
        const z = zoneMeta(p.zone);
        return (
          <li key={`${p.title}-${i}`} className="grid grid-cols-[34px_1fr] items-center gap-x-3 gap-y-2.5 border-b border-line/10 py-4 md:grid-cols-[48px_minmax(0,1fr)_auto] md:gap-x-6">
            <span className="digits self-start text-[22px] leading-none text-dust md:self-center">{String(i + 1).padStart(2, "0")}</span>
            <div className="min-w-0">
              <p className="text-[16.5px] font-medium leading-snug text-chalk">{p.title}</p>
              <p className="mt-1 flex items-center gap-3 text-[13px] text-dust">
                <span className="digits text-[16px] text-chalk/80">
                  <span className="sr-only">С {p.start} по {p.end} минуту</span>
                  <span aria-hidden>
                    {p.start}′–{p.end}′
                  </span>
                </span>
                <span aria-hidden className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-line/10 md:max-w-[220px]">
                  <span className="absolute inset-y-0 rounded-full" style={{ left: `${(p.start / total) * 100}%`, width: `${(p.minutes / total) * 100}%`, background: z.color }} />
                </span>
                <span>
                  <span className="digits text-[16px] text-chalk">{p.minutes}</span> мин
                </span>
              </p>
            </div>
            <div className="col-start-2 flex items-center justify-between gap-4 md:col-start-auto md:justify-end md:gap-6">
              <ZoneBadge zone={p.zone} className="md:w-[118px]" />
              <PersonalRange zone={p.zone} withUnit className="min-w-[128px] text-right text-[26px] leading-none text-chalk" />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
