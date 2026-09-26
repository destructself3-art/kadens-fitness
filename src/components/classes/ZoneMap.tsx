import Link from "next/link";
import clsx from "clsx";
import type { CSSProperties } from "react";
import type { ClassType } from "@/data/types";
import { PersonalRange } from "@/components/pulse/Zones";
import { Reveal } from "@/components/ui/Reveal";
import { plural } from "@/lib/format";
import { ZONES } from "@/lib/zones";
import { PhaseBars } from "./PhaseBars";

/** How much lower each easier column starts on wide screens, so the column tops climb like zone steps. */
const STEP_PX = 34;

/**
 * All classes on one screen, placed by the zone they are built around.
 * From lg the five columns rise like steps from Z1 to Z5; below that every zone is a row: numbers left, classes right.
 */
export function ZoneMap({ classes, className }: { classes: ClassType[]; className?: string }) {
  return (
    <ol className={clsx("grid gap-3 lg:grid-cols-5 lg:items-start lg:gap-4", className)}>
      {ZONES.map((z, i) => {
        const inZone = classes.filter((c) => c.zone === z.id);
        return (
          <li key={z.id} className="border-t-[3px] lg:mt-[var(--lift)]" style={{ borderColor: z.color, "--lift": `${(5 - z.id) * STEP_PX}px` } as CSSProperties}>
            <Reveal delay={i * 0.06} className="grid grid-cols-[minmax(0,118px)_minmax(0,1fr)] gap-x-4 pt-4 sm:grid-cols-[190px_minmax(0,1fr)] lg:block lg:pt-5">
              <div className="lg:min-h-[150px]">
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-display text-[30px] uppercase leading-none lg:text-[40px]" style={{ color: z.color, fontWeight: 850, fontVariationSettings: '"wdth" 96' }}>
                    Z{z.id}
                  </span>
                  <span className="text-[15px] font-semibold text-chalk">{z.name}</span>
                </p>
                <p className="mt-2 text-chalk">
                  <PersonalRange zone={z.id} className="text-[24px] leading-none lg:text-[28px]" withUnit />
                </p>
                <p className="mt-2 hidden text-[13.5px] leading-snug text-dust sm:block">{z.feel}</p>
                <Link
                  href={`/classes?zone=${z.id}#list`}
                  className="group mt-1 inline-flex min-h-[44px] items-center text-[13.5px] font-semibold text-dust transition-colors hover:text-chalk"
                >
                  <span className="link-underline">
                    Показать <span className="digits text-[17px] text-chalk">{inZone.length}</span>{" "}
                    {plural(inZone.length, "класс", "класса", "классов")}
                  </span>
                  <span aria-hidden className="ml-1.5 transition-transform duration-300 ease-silk group-hover:translate-y-0.5">
                    ↓
                  </span>
                </Link>
              </div>
              <ul className="grid content-start gap-2 md:grid-cols-2 lg:mt-3 lg:grid-cols-1">
                {inZone.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/classes/${c.slug}`}
                      className="group flex h-full min-h-[56px] flex-col justify-between gap-2.5 rounded-xl border border-line/10 bg-graphite px-3.5 py-3 transition-colors hover:border-line/35 hover:bg-raised"
                    >
                      <span className="block font-display text-[15px] uppercase leading-[1.05] text-chalk lg:text-[14px]" style={{ fontVariationSettings: '"wdth" 64', fontWeight: 800 }}>
                        {c.title}
                      </span>
                      <span className="flex items-center justify-between gap-3">
                        <PhaseBars structure={c.structure} className="h-3 w-20 opacity-75 transition-opacity group-hover:opacity-100" />
                        <span className="text-[12px] text-dust">
                          <span className="digits text-[18px] leading-none text-chalk">{c.durationMin}</span> мин
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}
