import clsx from "clsx";
import { getCoach } from "@/data/coaches";
import type { CoachSlug } from "@/data/types";
import { HoloCard } from "@/components/coaches/HoloCard";
import { ArrowLink } from "@/components/ui/Kit";
import { HomeReveal } from "./HomeReveal";
import { CLUB } from "@/lib/club";
import { ZONES } from "@/lib/zones";

const FEATURED: CoachSlug[] = ["igor-semenov", "dina-sabirova", "alina-safina", "timur-galiev"];

/** How each zone's rim light looks on the portraits (the photo series follows docs/shot-list.json). */
const RIM: Record<number, string> = {
  1: "мягкий белый",
  2: "янтарный",
  3: "оранжевый",
  4: "алый",
  5: "раскалённо-белый",
};

/** Four coaches as holographic cards; the rim light on each portrait is the coach's usual heart-rate zone. */
export function CoachesTeaser() {
  const coaches = FEATURED.map(getCoach);
  return (
    <section aria-labelledby="coaches-title" className="overflow-hidden border-t border-line/10 py-24 md:py-36">
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-end lg:gap-16">
          <HomeReveal>
            <p className="eyebrow">Тренеры</p>
            <h2 id="coaches-title" className="display stretch-ultra mt-4 text-d-3">
              {CLUB.coaches} тренеров, пять зон
            </h2>
          </HomeReveal>
          <HomeReveal delay={0.1}>
            <p className="text-[16px] leading-relaxed text-dust">
              Контровой свет на портрете — это зона, в которой тренер обычно работает. Число в углу карточки — среднее из пяти характеристик, как
              на спортивной карточке. Наведите курсор: фольга поймает свет.
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-dust" aria-label="Цвет контрового света по зонам">
              {ZONES.map((z) => (
                <li key={z.id} className="flex items-center gap-2">
                  <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: z.color, boxShadow: `0 0 10px ${z.color}` }} />
                  Z{z.id} {RIM[z.id]}
                </li>
              ))}
            </ul>
          </HomeReveal>
        </div>

        <ul
          className="-mx-4 mt-14 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-6 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 lg:gap-5 [&::-webkit-scrollbar]:hidden"
          data-lenis-prevent-horizontal
        >
          {coaches.map((c, i) => (
            <HomeReveal as="li" key={c.slug} delay={i * 0.07} className={clsx("w-[74vw] max-w-[320px] flex-none snap-start sm:w-auto sm:max-w-none", i % 2 === 1 && "lg:mt-16")}>
              <HoloCard coach={c} sizes="(min-width: 1100px) 24vw, (min-width: 560px) 45vw, 74vw" />
              <p className="mt-3 text-[13.5px] text-dust">
                {RIM[c.zone][0].toUpperCase() + RIM[c.zone].slice(1)} свет: Z{c.zone}, {ZONES[c.zone - 1].name.toLowerCase()}
              </p>
            </HomeReveal>
          ))}
        </ul>

        <HomeReveal className="mt-10">
          <ArrowLink href="/coaches">Все тренеры клуба</ArrowLink>
        </HomeReveal>
      </div>
    </section>
  );
}
