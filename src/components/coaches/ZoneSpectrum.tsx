// The team sorted by rim light: five zone bands, each with the visitor's range and the coaches who work there.
// Server component; PersonalRange is a client island.
import Link from "next/link";
import type { Coach } from "@/data/types";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { PersonalRange } from "@/components/pulse/Zones";
import { ZONES } from "@/lib/zones";

export function ZoneSpectrum({ coaches, className }: { coaches: Coach[]; className?: string }) {
  return (
    <ol className={className} aria-label="Тренеры по цвету контрового света">
      {ZONES.map((z) => {
        const inZone = coaches.filter((c) => c.zone === z.id);
        return (
          <li key={z.id} className="relative overflow-hidden border-t border-line/10 last:border-b">
            {/* The rim light itself: a zone-colored glow from the left edge */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-2/3"
              style={{ background: `linear-gradient(90deg, ${z.color}29, transparent 80%)` }}
            />
            <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ background: z.color, boxShadow: `0 0 24px 2px ${z.color}` }} />
            <div className="relative grid gap-4 py-5 pl-5 pr-1 sm:grid-cols-[minmax(0,230px)_1fr] sm:items-center sm:gap-8 sm:pl-7">
              <div>
                <p className="flex items-baseline gap-3">
                  <span className="digits text-[34px] leading-none" style={{ color: z.color }}>
                    Z{z.id}
                  </span>
                  <span className="font-display text-[22px] uppercase leading-none" style={{ fontVariationSettings: '"wdth" 90', fontWeight: 800 }}>
                    {z.name}
                  </span>
                </p>
                <p className="mt-2 text-[13px] text-dust">
                  для вас <PersonalRange zone={z.id} className="text-[20px] text-chalk" /> уд/мин
                </p>
              </div>
              <ul className="flex flex-wrap gap-2">
                {inZone.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/coaches/${c.slug}`}
                      className="group flex min-h-[48px] items-center gap-3 rounded-full border border-line/10 bg-asphalt/70 py-1 pl-1 pr-4 transition-colors hover:border-line/40"
                    >
                      <span className="block h-10 w-10 flex-none overflow-hidden rounded-full" style={{ boxShadow: `0 0 0 2px ${z.color}` }}>
                        <MediaFrame shot={c.photo} alt="" sizes="48px" quiet className="h-full w-full" imgClassName="object-[50%_22%]" />
                      </span>
                      <span className="text-[14.5px] text-chalk">{c.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
