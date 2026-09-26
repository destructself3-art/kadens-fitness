import type { Metadata } from "next";
import { SPACES } from "@/data/spaces";
import { ClubNumbers } from "@/components/club/ClubNumbers";
import { FLOOR_NAMES, FLOOR_TAGLINES, STUDIOS_COPY } from "@/components/club/copy";
import { FloorTour } from "@/components/club/FloorTour";
import { FLOORS, parseFloor, toPlanSpace, type Floor } from "@/components/club/plan";
import { SpaceCard } from "@/components/ui/Cards";
import { ArrowLink, PageHero } from "@/components/ui/Kit";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { plural } from "@/lib/format";

export const metadata: Metadata = {
  title: "Студии и зоны клуба",
  description:
    "План трёх этажей «Каденса»: шесть студий, бассейн 25 метров, тренажёрный зал на 1 100 м², функциональная и кардиозона с видом на Кремль, SPA, детский клуб и фитнес-бар.",
};

/**
 * SpaceCard sets its title at 34px, which is too wide for «Функциональная» or «Тренажёрный» in a card column.
 * The size steps follow the longest word, so every name stays on the card at every breakpoint.
 */
function cardTitleClass(name: string): string | undefined {
  const longest = Math.max(...name.split(/\s+/).map((w) => w.length));
  if (longest >= 13) return "[&_.font-display]:text-[22px] sm:[&_.font-display]:text-[18px] md:[&_.font-display]:text-[24px] lg:[&_.font-display]:text-[28px]";
  if (longest >= 10) return "[&_.font-display]:text-[28px] sm:[&_.font-display]:text-[22px] md:[&_.font-display]:text-[30px] lg:[&_.font-display]:text-[34px]";
  if (longest >= 8) return "sm:[&_.font-display]:text-[28px] md:[&_.font-display]:text-[34px]";
  return undefined;
}

export default async function StudiosPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const initialFloor = parseFloor((await searchParams).floor);
  const spaces = SPACES.map(toPlanSpace);

  const grids = Object.fromEntries(
    FLOORS.map((floor) => {
      const onFloor = SPACES.filter((s) => s.floor === floor);
      return [
        floor,
        <section key={floor} aria-labelledby={`floor-${floor}-list`}>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-t border-line/10 pt-8">
            <h2 id={`floor-${floor}-list`} className="display text-d-3 stretch-normal">
              {FLOOR_NAMES[floor]}
            </h2>
            <p className="text-[14px] text-dust">
              <span className="digits text-[28px] text-chalk">{onFloor.length}</span> {plural(onFloor.length, "пространство", "пространства", "пространств")}
            </p>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {onFloor.map((space, i) => (
              <li key={space.slug}>
                <Reveal delay={0.06 * (i % 3)}>
                  <SpaceCard space={space} className={cardTitleClass(space.name)} sizes="(min-width: 1360px) 390px, (min-width: 1100px) 36vw, (min-width: 560px) 45vw, 92vw" />
                </Reveal>
              </li>
            ))}
          </ul>
        </section>,
      ];
    }),
  ) as Record<Floor, React.ReactNode>;

  return (
    <>
      <PageHero
        eyebrow={STUDIOS_COPY.eyebrow}
        title={STUDIOS_COPY.title}
        lead={STUDIOS_COPY.lead}
        crumbs={[{ href: "/", label: "Главная" }, { label: "Студии и зоны" }]}
        stretch="narrow"
      />

      <section aria-label="План клуба по этажам" className="container-page">
        <FloorTour spaces={spaces} initialFloor={initialFloor} taglines={FLOOR_TAGLINES} grids={grids} note={STUDIOS_COPY.planNote} />
      </section>

      <section aria-labelledby="club-numbers" className="container-page mt-28 md:mt-36">
        <h2 id="club-numbers" className="eyebrow mb-6">
          Клуб в цифрах
        </h2>
        <ClubNumbers variant="line" />
      </section>

      <section aria-labelledby="studios-cta" className="container-page mt-28 md:mt-36">
        <Reveal className="grid gap-8 rounded-card border border-line/10 bg-graphite p-6 md:grid-cols-[1.2fr_1fr] md:items-end md:p-12">
          <div>
            <h2 id="studios-cta" className="display text-d-2 stretch-narrow">
              {STUDIOS_COPY.ctaTitle}
            </h2>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-dust">{STUDIOS_COPY.ctaText}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 md:justify-end">
            <MagneticButton href="/trial">Записаться на пробную</MagneticButton>
            <ArrowLink href="/schedule" className="min-h-[44px]">Расписание на неделю</ArrowLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
