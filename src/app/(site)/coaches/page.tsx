import type { Metadata } from "next";
import Link from "next/link";
import { PulseNote } from "@/components/classes/PulseNote";
import { CoachesExplorer, type ClassOption } from "@/components/coaches/CoachesExplorer";
import { ZoneSpectrum } from "@/components/coaches/ZoneSpectrum";
import { cardData, classTitles, HEAD_COACH, teamHeadFirst } from "@/components/coaches/coach-utils";
import { BeatWord } from "@/components/pulse/Beat";
import { ZoneLegend } from "@/components/ui/Cards";
import { ArrowLink, Breadcrumbs, SectionHeading, Stat, ZoneBadge } from "@/components/ui/Kit";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { CLASSES } from "@/data/classes";
import type { ClassSlug, ZoneId } from "@/data/types";
import { CLUB } from "@/lib/club";
import { num, plural } from "@/lib/format";

export const metadata: Metadata = {
  title: "Тренеры",
  description:
    "Двенадцать тренеров клуба «Каденс» в Казани: бокс, сайкл, HIIT, йога, пилатес, плавание, бег. У каждого своя пульсовая зона, стаж, направления и цена персональной тренировки.",
};

type Search = { zone?: string | string[]; class?: string | string[] };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function CoachesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const zoneParam = Number(one(sp.zone));
  const initialZone = Number.isInteger(zoneParam) && zoneParam >= 1 && zoneParam <= 5 ? (zoneParam as ZoneId) : null;
  const classParam = one(sp.class);
  const initialClass = CLASSES.some((c) => c.slug === classParam) ? (classParam as ClassSlug) : null;

  const team = teamHeadFirst();
  const classOptions: ClassOption[] = CLASSES.map((c) => ({ slug: c.slug, title: c.title }));
  const totalYears = team.reduce((sum, c) => sum + c.experienceYears, 0);
  const calmest = team.reduce((a, b) => (b.restingHr < a.restingHr ? b : a));
  const personal = team.filter((c) => c.personalPrice !== null).sort((a, b) => a.personalPrice! - b.personalPrice!);
  const minPrice = personal[0]?.personalPrice ?? 0;
  const groupOnly = team.filter((c) => c.personalPrice === null);

  return (
    <>
      {/* ---------- Hero: the word beats in the visitor's rhythm ---------- */}
      <section className="relative isolate overflow-hidden pb-16 pt-32 md:pb-24 md:pt-40">
        <div aria-hidden className="ecg-grid absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(to_bottom,black_20%,transparent_90%)]" />
        <div className="container-page">
          <Breadcrumbs items={[{ href: "/", label: "Главная" }, { label: "Тренеры" }]} className="mb-10" />
          <Reveal>
            <p className="eyebrow">
              Команда «{CLUB.name}» · <span className="digits text-[16px] tracking-normal text-chalk">{team.length}</span> человек
            </p>
            {/* Sized so the widest beat (wdth 72) still fits the container at any viewport */}
            <BeatWord as="h1" className="mt-3 block whitespace-nowrap text-[clamp(3.4rem,15.5vw,13.5rem)] leading-[0.8]" base={54} amp={18}>
              Тренеры
            </BeatWord>
          </Reveal>
          <div className="mt-12 grid gap-12 md:mt-16 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-6">
              <p className="max-w-[60ch] text-[17px] leading-relaxed text-dust md:text-[19px]">
                Мастер спорта по гребле, КМС по боксу, пауэрлифтер с приседом 290 кг, барьеристка из сборной Татарстана, марафонка с личным
                рекордом 2:49. <span className="text-chalk">Каждый пришёл из своего спорта, и каждый ведёт занятия по пульсу:</span> смотрит не
                на громкость музыки, а на то, в какой зоне сейчас ваше сердце.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line/10 pt-8 lg:col-span-5 lg:col-start-8">
              <Stat value={totalYears} label={`${plural(totalYears, "год", "года", "лет")} тренерского стажа на всю команду`} />
              <Stat value={calmest.restingHr} label={`самый низкий пульс покоя в команде: ${calmest.name}`} />
              <Stat value={CLASSES.length} label="направлений, от йоги до бокс-интервалов" />
              <Stat value={num(minPrice)} label="рублей стоит самая доступная персональная тренировка" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Rim light = heart-rate zone ---------- */}
      <section className="container-page grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              eyebrow="Контровой свет"
              title="Цвет за спиной — это пульс"
              size="d-3"
              stretch="normal"
              lead="Все двенадцать портретов сняты в одной студии и одним светом. Меняется только цвет контрового света: это зона пульса, в которой тренер обычно ведёт свои занятия. Серый у йоги и растяжки, янтарный у тех, кто строит базу, оранжевый у темповых, алый у порога, почти белый у максимума."
            />
            <Reveal delay={0.1}>
              <ZoneLegend className="mt-8" />
              <PulseNote className="mt-6 max-w-md" />
            </Reveal>
          </div>
        </div>
        <Reveal className="lg:col-span-7">
          <ZoneSpectrum coaches={team} />
        </Reveal>
      </section>

      {/* ---------- The cards ---------- */}
      <section id="team" className="container-page scroll-mt-24 py-16 md:py-24">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow="Карточки" title="Вся команда" stretch="wide" />
          <Reveal delay={0.1} className="max-w-sm text-[15px] leading-relaxed text-dust">
            Наведите курсор на карточку: голографическая фольга ловит свет, на телефоне она переливается сама. Большая цифра — рейтинг по
            пяти показателям, справа — пульс покоя тренера.
          </Reveal>
        </div>
        <CoachesExplorer coaches={team.map(cardData)} classes={classOptions} initialZone={initialZone} initialClass={initialClass} />
      </section>

      {/* ---------- Personal training price list ---------- */}
      <section id="personal" className="scroll-mt-24 border-t border-line/10 py-16 md:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Один на один"
              title="Персональные тренировки"
              size="d-3"
              stretch="narrow"
              lead={`${personal.length} ${plural(personal.length, "тренер", "тренера", "тренеров")} из ${team.length} берут персональных клиентов. Цена указана за одно занятие. Оставьте заявку на странице тренера: администратор перезвонит и согласует время.`}
            />
            {groupOnly.length > 0 && (
              <Reveal delay={0.1}>
                <p className="mt-6 max-w-md text-[14.5px] leading-relaxed text-dust">
                  {groupOnly.map((c) => c.name).join(", ")} {groupOnly.length === 1 ? "ведёт" : "ведут"} только групповые занятия
                  {groupOnly.some((c) => c.slug === HEAD_COACH) ? ": время после групп уходит на подготовку тренеров." : "."}
                </p>
              </Reveal>
            )}
          </div>
          <Reveal className="lg:col-span-7">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">Цена персональной тренировки у каждого тренера</caption>
                <thead>
                  <tr className="border-b border-line/15 text-[12.5px] uppercase tracking-[0.14em] text-dust">
                    <th scope="col" className="py-3 pr-4 font-semibold">
                      Тренер
                    </th>
                    <th scope="col" className="hidden py-3 pr-4 font-semibold sm:table-cell">
                      Направления
                    </th>
                    <th scope="col" className="py-3 pr-4 font-semibold">
                      Зона
                    </th>
                    <th scope="col" className="py-3 text-right font-semibold">
                      Занятие
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {personal.map((c) => (
                    <tr key={c.slug} className="group border-b border-line/10 transition-colors hover:bg-graphite">
                      <th scope="row" className="py-0 pr-4 font-normal">
                        <Link href={`/coaches/${c.slug}`} className="flex min-h-[56px] flex-col justify-center py-2">
                          <span className="text-[16px] font-medium text-chalk group-hover:underline group-hover:decoration-line/40 group-hover:underline-offset-4">{c.name}</span>
                          <span className="text-[13px] text-dust">{c.role}</span>
                        </Link>
                      </th>
                      <td className="hidden py-2 pr-4 text-[13.5px] text-dust sm:table-cell">{classTitles(c).join(", ")}</td>
                      <td className="py-2 pr-4">
                        <ZoneBadge zone={c.zone} showName={false} />
                      </td>
                      <td className="whitespace-nowrap py-2 text-right">
                        <span className="digits text-[28px] leading-none text-chalk">{num(c.personalPrice!)}</span>
                        <span className="ml-1 text-[14px] text-dust">₽</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- First step: the trial class ---------- */}
      <section className="container-page pb-24 pt-8 md:pb-32">
        <div className="relative grid overflow-hidden rounded-card border border-line/10 bg-graphite md:grid-cols-[1.25fr_1fr]">
          <div className="relative z-10 flex flex-col justify-between gap-10 p-7 sm:p-10 md:p-14">
            <Reveal>
              <p className="eyebrow">Первое занятие бесплатно</p>
              <h2 className="display stretch-normal mt-4 text-d-3">Не знаете, к&nbsp;кому идти?</h2>
              <p className="mt-5 max-w-lg text-[16.5px] leading-relaxed text-dust">
                Начните с пробной тренировки. Тренер измерит пульс покоя, посчитает ваши зоны и подскажет, с какого направления начать:
                кому-то нужен ринг, кому-то бассейн и вторая зона.
              </p>
            </Reveal>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
              <MagneticButton href="/trial">Записаться на пробную</MagneticButton>
              <ArrowLink href="/program" className="min-h-[44px]">Собрать программу под пульс</ArrowLink>
            </div>
          </div>
          <MediaFrame
            shot="pulse-check"
            alt="Два пальца на шее: человек считает пульс перед тренировкой"
            sizes="(min-width: 820px) 42vw, 100vw"
            className="aspect-[4/3] md:aspect-auto md:min-h-[460px]"
          />
        </div>
      </section>
    </>
  );
}
