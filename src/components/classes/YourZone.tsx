import clsx from "clsx";
import type { ZoneId } from "@/data/types";
import { PersonalRange } from "@/components/pulse/Zones";
import { ZoneBadge } from "@/components/ui/Kit";
import { zoneMeta } from "@/lib/zones";
import { PulseNote } from "./PulseNote";

/** Hero card: the zone a class is built around, in the visitor's own beats per minute. */
export function YourZone({ zone, className }: { zone: ZoneId; className?: string }) {
  const z = zoneMeta(zone);
  return (
    <aside aria-label="Ваш пульс на этом занятии" className={clsx("relative overflow-hidden rounded-card border border-line/15 bg-asphalt/85 p-5 md:p-6", className)}>
      <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: z.color }} aria-hidden />
      <p className="eyebrow">Основная работа в зоне</p>
      <ZoneBadge zone={zone} className="mt-3 text-[15px]" />
      <p className="mt-4">
        <PersonalRange zone={zone} withUnit className="text-[64px] leading-[0.82] text-chalk md:text-[76px]" />
      </p>
      <p className="mt-3 text-[14.5px] leading-snug text-chalk/85">{z.feel}.</p>
      <PulseNote className="mt-4 border-t border-line/10 pt-4 text-[13px]" />
    </aside>
  );
}
