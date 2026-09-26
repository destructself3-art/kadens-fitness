import clsx from "clsx";
import type { ClassPhase, ZoneId } from "@/data/types";
import { plural } from "@/lib/format";
import { ZONES, zoneMeta } from "@/lib/zones";
import { minutesByZone } from "./helpers";

/** Where the minutes of a class go: the main zone as a big number, then a stacked bar by zone. */
export function ZoneTime({ structure, mainZone, className }: { structure: ClassPhase[]; mainZone: ZoneId; className?: string }) {
  const byZone = minutesByZone(structure);
  const total = structure.reduce((s, p) => s + p.minutes, 0) || 1;
  const main = zoneMeta(mainZone);
  const used = ZONES.filter((z) => byZone[z.id] > 0);
  return (
    <div className={clsx("rounded-card border border-line/10 bg-graphite p-5 md:p-6", className)}>
      <p className="eyebrow">Время по зонам</p>
      <p className="mt-4 flex items-end gap-3">
        <span className="digits text-[72px] leading-[0.8] text-chalk">{byZone[mainZone]}</span>
        <span className="pb-1 text-[14.5px] leading-snug text-dust">
          из <span className="digits text-[18px] text-chalk">{total}</span> {plural(total, "минуты", "минут", "минут")} в основной зоне:{" "}
          <span className="text-chalk">
            Z{main.id} {main.name}
          </span>
        </span>
      </p>
      <div className="mt-5 flex h-3 gap-[2px] overflow-hidden rounded-full" aria-hidden>
        {used.map((z) => (
          <span key={z.id} style={{ flexGrow: byZone[z.id], background: z.color }} />
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[13.5px] text-dust sm:grid-cols-3">
        {used.map((z) => (
          <li key={z.id} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: z.color }} aria-hidden />
            Z{z.id}
            <span className="digits text-[18px] leading-none text-chalk">{byZone[z.id]}</span> мин
          </li>
        ))}
      </ul>
    </div>
  );
}
