// The phases of one class on the clock of this session: "19:15 Разминка 6′ Z1 104–117".
// Server-safe; the personal ranges come from the client-side pulse.
import type { ClassPhase } from "@/data/types";
import { PersonalRange } from "@/components/pulse/Zones";
import { hhmmToMinutes, minutesToHHMM } from "@/lib/time";
import { zoneMeta } from "@/lib/zones";

export function PhaseList({ structure, start }: { structure: ClassPhase[]; /** "19:15" */ start: string }) {
  let at = hhmmToMinutes(start);
  const rows = structure.map((phase) => {
    const row = { phase, from: minutesToHHMM(at) };
    at += phase.minutes;
    return row;
  });

  return (
    <ol className="divide-y divide-line/10 border-y border-line/10">
      {rows.map(({ phase, from }, i) => {
        const z = zoneMeta(phase.zone);
        return (
          <li key={`${phase.title}-${i}`} className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-x-3 py-3.5 sm:grid-cols-[64px_minmax(0,1fr)_auto_auto] sm:gap-x-5">
            <span className="digits text-[20px] leading-none text-dust">{from}</span>
            <span className="min-w-0">
              <span className="block text-[15.5px] font-medium leading-snug text-chalk">{phase.title}</span>
              <span className="text-[13px] text-dust">
                <span className="digits text-[16px]">{phase.minutes}</span> мин · {z.name.toLowerCase()}
              </span>
            </span>
            <span
              className="hidden rounded-md px-1.5 py-0.5 font-display text-[12px] uppercase leading-none sm:inline-block"
              style={{ background: z.color, color: z.ink, fontWeight: 800, fontVariationSettings: '"wdth" 110' }}
              aria-hidden
            >
              Z{z.id}
            </span>
            <span className="flex items-center gap-2 text-right">
              <span className="h-2 w-2 rounded-full sm:hidden" style={{ background: z.color }} aria-hidden />
              <span className="sr-only">Зона {z.id}, ваш пульс</span>
              <PersonalRange zone={phase.zone} withUnit className="text-[22px] leading-none text-chalk" />
            </span>
          </li>
        );
      })}
    </ol>
  );
}
