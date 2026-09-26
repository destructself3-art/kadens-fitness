import type { Metadata } from "next";
import Link from "next/link";
import { getCoach } from "@/data/coaches";
import { ClubNumbers } from "@/components/club/ClubNumbers";
import { CLUB_COPY, CLUB_LINKS, PRINCIPLES } from "@/components/club/copy";
import { EcgDraw } from "@/components/club/EcgDraw";
import { HoloCard } from "@/components/coaches/HoloCard";
import { BeatWord } from "@/components/pulse/Beat";
import { PersonalRange } from "@/components/pulse/Zones";
import { ArrowLink, Breadcrumbs, ZoneBadge } from "@/components/ui/Kit";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { CLUB } from "@/lib/club";
import { plural } from "@/lib/format";

export const metadata: Metadata = {
  title: "О клубе",
  description: `«Каденс» открылся в ${CLUB.openedYear} году на набережной Казанки: ${CLUB.floors} этажа, бассейн ${CLUB.poolLength} метров, ${CLUB.studios} студий и ${CLUB.coaches} тренеров. Почему клуб построен вокруг пульса и во что мы верим.`,
};

export default function ClubPage() {
  const head = getCoach("igor-semenov");
  const [storyLead, ...story] = CLUB_COPY.story;

  return (
    <>
      {/* ---------- Hero ---------- */}
      <header className="relative isolate overflow-hidden pb-10 pt-32 md:pb-14 md:pt-40">
        <div className="ecg-grid absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" aria-hidden />
        <div className="container-page">
          <Breadcrumbs items={[{ href: "/", label: "Главная" }, { label: CLUB_COPY.eyebrow }]} className="mb-8" />
          <Reveal>
            <p className="eyebrow mb-4">{CLUB_COPY.eyebrow}</p>
            <h1 className="display text-d-1 stretch-narrow max-w-[14ch]">
              {CLUB_COPY.titleBefore}{" "}
              <BeatWord className="text-pulse" base={56} amp={34}>
                {CLUB_COPY.titleBeat}
              </BeatWord>
            </h1>
            <p className="mt-7 max-w-2xl text-[17px] leading-relaxed text-dust md:text-[19px]">{CLUB_COPY.lead}</p>
          </Reveal>
        </div>
        <EcgDraw className="mt-12 md:mt-16" />
      </header>

      {/* ---------- Story ---------- */}
      <section aria-labelledby="club-story" className="container-page mt-16 md:mt-24">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <Reveal className="self-start lg:sticky lg:top-28">
            <p className="eyebrow">Открылись в</p>
            <p className="digits mt-2 text-[clamp(120px,26vw,300px)] leading-[0.78] text-chalk">{CLUB.openedYear}</p>
            <figure className="mt-10 border-l-2 border-pulse pl-5 md:pl-6">
              <blockquote className="text-[17px] leading-relaxed text-chalk/90 md:text-[18px]">{CLUB_COPY.nameNote}</blockquote>
              <figcaption className="mt-3 text-[13px] uppercase tracking-[0.14em] text-dust">Откуда название</figcaption>
            </figure>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow mb-4">{CLUB_COPY.storyEyebrow}</p>
            <h2 id="club-story" className="display text-d-2 stretch-wide">
              {CLUB_COPY.storyTitle}
            </h2>
            <p className="mt-8 text-[19px] leading-relaxed text-chalk md:text-[22px]">{storyLead}</p>
            {story.map((p) => (
              <p key={p.slice(0, 32)} className="mt-6 text-[16.5px] leading-relaxed text-dust md:text-[17.5px]">
                {p}
              </p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---------- Numbers ---------- */}
      <section aria-labelledby="club-numbers" className="container-page mt-28 md:mt-40">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <h2 id="club-numbers" className="display text-d-2 stretch-normal">
            {CLUB_COPY.numbersTitle}
          </h2>
          <ArrowLink href="/studios" className="min-h-[44px]">План трёх этажей</ArrowLink>
        </Reveal>
        <ClubNumbers variant="board" />
      </section>

      {/* ---------- The LED line over the reception ---------- */}
      <section aria-labelledby="club-led" className="mt-28 md:mt-40">
        <div className="relative isolate flex min-h-[88svh] flex-col justify-end overflow-hidden md:min-h-[92svh]">
          <MediaFrame
            shot="zone-lobby"
            alt="Ресепшен «Каденса» ночью: над бетонной стойкой красная светодиодная линия делает один удар кардиограммы и отражается в полу"
            sizes="100vw"
            className="absolute inset-0 -z-20"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-asphalt via-asphalt/55 to-asphalt/10" aria-hidden />
          <div className="container-page pb-12 md:pb-20">
            <Reveal className="max-w-2xl">
              <p className="eyebrow mb-4 text-chalk/80">{CLUB_COPY.ledEyebrow}</p>
              <h2 id="club-led" className="display text-d-2 stretch-narrow">
                {CLUB_COPY.ledTitle}
              </h2>
              <p className="mt-6 text-[17px] leading-relaxed text-chalk/85 md:text-[18px]">{CLUB_COPY.ledText}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Principles ---------- */}
      <section aria-labelledby="club-principles" className="container-page mt-28 md:mt-40">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-end">
          <Reveal>
            <p className="eyebrow mb-4">{CLUB_COPY.principlesEyebrow}</p>
            <h2 id="club-principles" className="display text-d-2 stretch-narrow">
              {CLUB_COPY.principlesTitle}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-lg text-[17px] leading-relaxed text-dust">{CLUB_COPY.principlesLead}</p>
          </Reveal>
        </div>
        <ol className="mt-14 border-t border-line/10">
          {PRINCIPLES.map((p, i) => (
            <Reveal as="li" key={p.title} className="grid gap-4 border-b border-line/10 py-10 md:grid-cols-[120px_minmax(0,1fr)_minmax(0,1.15fr)] md:gap-10 md:py-14">
              <span className="digits text-[64px] leading-[0.8] text-pulse md:text-[88px]" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-[30px] uppercase leading-[0.95] text-chalk md:text-[40px]" style={{ fontVariationSettings: '"wdth" 64', fontWeight: 850 }}>
                {p.title}
              </h3>
              <div>
                <p className="text-[16.5px] leading-relaxed text-dust md:text-[17.5px]">{p.text}</p>
                {p.zone && (
                  <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-line/10 bg-graphite px-4 py-3 text-[14px] text-dust">
                    <ZoneBadge zone={p.zone} showName={false} />
                    <span>{p.zoneNote}:</span>
                    <PersonalRange zone={p.zone} withUnit className="text-[24px] leading-none text-chalk" />
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </ol>
        <Reveal className="mt-8">
          <p className="text-[14px] text-dust">
            Цифры посчитаны по вашему пульсу покоя, если вы его уже измерили. Если нет,{" "}
            <Link href="/zones" className="link-underline text-chalk">
              узнайте свои зоны
            </Link>{" "}
            за десять секунд.
          </p>
        </Reveal>
      </section>

      {/* ---------- Head coach ---------- */}
      <section aria-labelledby="club-coach" className="container-page mt-28 md:mt-40">
        <div className="grid items-center gap-12 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-20">
          <Reveal className="mx-auto w-full max-w-[340px]">
            <HoloCard coach={head} sizes="(min-width: 768px) 340px, 80vw" />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow mb-4">{CLUB_COPY.coachEyebrow}</p>
            <h2 id="club-coach" className="sr-only">
              {head.name}, {head.role.toLowerCase()}
            </h2>
            <figure>
              <blockquote className="display text-[clamp(2.3rem,4.6vw,4.6rem)] leading-[0.9] stretch-narrow">
                <span className="text-pulse">«</span>
                {head.quote.replace(/[.!]$/, "")}
                <span className="text-pulse">»</span>
              </blockquote>
              <figcaption className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-2">
                <span className="text-[19px] font-semibold text-chalk">{head.name}</span>
                <span className="text-[15px] text-dust">
                  в клубе с <span className="digits text-[20px] text-chalk">{head.since}</span>, в профессии{" "}
                  <span className="digits text-[20px] text-chalk">{head.experienceYears}</span> {plural(head.experienceYears, "год", "года", "лет")}
                </span>
              </figcaption>
            </figure>
            <p className="mt-6 max-w-xl text-[16.5px] leading-relaxed text-dust">{head.bio[0]}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <ArrowLink href={`/coaches/${head.slug}`} className="min-h-[44px]">Страница тренера</ArrowLink>
              <ArrowLink href="/coaches" className="min-h-[44px]">Вся команда</ArrowLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Facade and what next ---------- */}
      <section aria-labelledby="club-next" className="mt-28 md:mt-40">
        <div className="container-page">
          <Reveal>
            <MediaFrame
              shot="facade-night"
              alt="Здание клуба ночью после дождя: на втором этаже красным горят окна сайкл-студии, мокрый асфальт отражает свет"
              sizes="(min-width: 1440px) 1344px, 100vw"
              className="aspect-[4/5] rounded-card sm:aspect-[16/9] lg:aspect-[21/9]"
            />
          </Reveal>
          <Reveal className="mt-14">
            <h2 id="club-next" className="display text-d-2 stretch-ultra">
              {CLUB_COPY.outroTitle}
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
            <Reveal>
              <p className="max-w-sm text-[16px] leading-relaxed text-dust">
                {CLUB.city}, {CLUB.street}. Первый визит бесплатный: пробное занятие с тренером и пульс-тест.
              </p>
              <MagneticButton href="/trial" className="mt-8">
                Записаться на пробную
              </MagneticButton>
            </Reveal>
            <Reveal delay={0.1}>
              <ul className="border-t border-line/10">
                {CLUB_LINKS.map((l) => (
                  <li key={l.href} className="border-b border-line/10">
                    <Link href={l.href} className="group flex min-h-[96px] items-center justify-between gap-6 py-5">
                      <span className="min-w-0">
                        <span
                          className="block font-display text-[30px] uppercase leading-none text-chalk transition-colors group-hover:text-pulse md:text-[44px]"
                          style={{ fontVariationSettings: '"wdth" 72', fontWeight: 850 }}
                        >
                          {l.label}
                        </span>
                        <span className="mt-2 block text-[14.5px] text-dust">{l.text}</span>
                      </span>
                      <span aria-hidden className="text-[28px] text-dust transition-transform duration-300 ease-silk group-hover:translate-x-1.5 group-hover:text-pulse">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
