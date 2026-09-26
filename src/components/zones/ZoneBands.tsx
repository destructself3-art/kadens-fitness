// Five wide bands, one per zone: what it is, the visitor's range, how it feels and where it lives in the club.
import Link from "next/link";
import { CLASSES } from "@/data/classes";
import { getSpace } from "@/data/spaces";
import { ZONES } from "@/lib/zones";
import { Reveal } from "@/components/ui/Reveal";
import { PersonalRange } from "@/components/pulse/Zones";
import { ZONE_DETAILS } from "./copy";

export function ZoneBands() {
  return (
    <ol className="grid gap-3">
      {ZONES.map((z) => {
        const classes = CLASSES.filter((c) => c.zone === z.id);
        const detail = ZONE_DETAILS[z.id];
        // Each band glows a little hotter than the one before.
        const glow = 10 + z.id * 4;
        return (
          <Reveal as="li" key={z.id}>
            <article
              id={`zone-${z.id}`}
              aria-labelledby={`zone-${z.id}-title`}
              className="relative scroll-mt-28 overflow-hidden rounded-card border border-line/10 bg-graphite"
              style={{ backgroundImage: `linear-gradient(100deg, color-mix(in srgb, ${z.color} ${glow}%, transparent), transparent 55%)` }}
            >
              <span className="absolute inset-y-0 left-0 w-1.5 sm:w-2" style={{ background: z.color }} aria-hidden />
              <div className="grid gap-8 p-6 pl-8 sm:p-8 sm:pl-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10 lg:p-10 lg:pl-14">
                {/* Name and range */}
                <div>
                  <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span
                      className="font-display text-[64px] uppercase leading-[0.8] sm:text-[88px]"
                      style={{ color: z.color, fontWeight: 850, fontVariationSettings: '"wdth" 90' }}
                      aria-hidden
                    >
                      Z{z.id}
                    </span>
                    <span className="digits text-[18px] text-dust">
                      {Math.round(z.reserve[0] * 100)}–{Math.round(z.reserve[1] * 100)} % резерва
                    </span>
                  </p>
                  <h3 id={`zone-${z.id}-title`} className="display stretch-narrow mt-4 text-[clamp(2rem,3.4vw,3.4rem)] leading-[0.92]">
                    <span className="sr-only">Зона {z.id}, </span>
                    {z.name}
                  </h3>
                  <p className="mt-5 text-[13px] text-dust">Ваш диапазон, уд/мин</p>
                  <p className="mt-1 whitespace-nowrap text-[56px] leading-[0.85] text-chalk sm:text-[72px]">
                    <PersonalRange zone={z.id} />
                  </p>
                </div>

                {/* Feel, effect, dose */}
                <dl className="grid content-start grid-cols-2 gap-x-6 gap-y-5 text-[15.5px] leading-relaxed">
                  <div className="col-span-2">
                    <dt className="eyebrow">Как ощущается</dt>
                    <dd className="mt-1.5 text-chalk">{z.feel}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="eyebrow">Что тренирует</dt>
                    <dd className="mt-1.5 text-chalk">{z.effect}</dd>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <dt className="eyebrow">Сколько держится</dt>
                    <dd className="mt-1.5 text-chalk">{detail.hold}</dd>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <dt className="eyebrow">Место в неделе</dt>
                    <dd className="mt-1.5 text-dust">{detail.when}</dd>
                  </div>
                </dl>

                {/* Classes built around this zone */}
                <div>
                  <p className="eyebrow">Занятия в этой зоне</p>
                  <ul className="mt-3 border-t border-line/10">
                    {classes.map((c) => (
                      <li key={c.slug} className="border-b border-line/10">
                        <Link
                          href={`/classes/${c.slug}`}
                          className="group flex min-h-[56px] items-center justify-between gap-4 py-3 transition-colors hover:text-chalk"
                        >
                          <span className="min-w-0">
                            <span className="block text-[16px] font-semibold text-chalk">
                              <span className="link-underline">{c.title}</span>
                            </span>
                            <span className="block text-[13px] text-dust">
                              «{getSpace(c.studio).name}» · <span className="digits text-[15px]">{c.durationMin}</span> мин
                            </span>
                          </span>
                          <span aria-hidden className="text-dust transition-transform duration-300 ease-silk group-hover:translate-x-1 group-hover:text-chalk">
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </Reveal>
        );
      })}
    </ol>
  );
}
