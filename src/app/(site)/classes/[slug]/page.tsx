import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { ArrowUpRight, Check, MapPin } from "lucide-react";
import { CLASSES } from "@/data/classes";
import { getCoach } from "@/data/coaches";
import { getGoal } from "@/data/goals";
import { getSpace } from "@/data/spaces";
import { CurveChart } from "@/components/classes/CurveChart";
import { heroTitleFit, relatedClasses, roomHeadingSize, roomName, roomTitle, sessionDayLabel } from "@/components/classes/helpers";
import { PhaseTable } from "@/components/classes/PhaseTable";
import { YourZone } from "@/components/classes/YourZone";
import { ZoneTime } from "@/components/classes/ZoneTime";
import { HoloCard } from "@/components/coaches/HoloCard";
import { cardData } from "@/components/coaches/coach-utils";
import { PulseTap } from "@/components/pulse/PulseTap";
import { PulseControls } from "@/components/pulse/Zones";
import { SessionRow } from "@/components/schedule/SessionRow";
import { ClassCard, levelLabel, SpaceCard } from "@/components/ui/Cards";
import { ArrowLink, Breadcrumbs, SectionHeading, ZoneBadge } from "@/components/ui/Kit";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { BOOKING } from "@/lib/club";
import { num, plural } from "@/lib/format";
import { getPhoto } from "@/lib/photos";
import { getUpcoming } from "@/lib/schedule";
import type { SessionView } from "@/lib/session-types";
import { zoneMeta } from "@/lib/zones";

// The upcoming sessions come from the database and depend on the clock.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const findClass = (slug: string) => CLASSES.find((c) => c.slug === slug);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cls = findClass((await params).slug);
  if (!cls) return { title: "Класс не найден" };
  const z = zoneMeta(cls.zone);
  const studio = getSpace(cls.studio);
  const photo = getPhoto(cls.photo);
  const description = `${cls.short} Основная зона Z${z.id} «${z.name}», ${cls.durationMin} минут. Где: ${roomTitle(studio)}. Кривая пульса, тренеры и запись онлайн.`;
  return {
    title: `${cls.title}: класс в зоне Z${z.id}`,
    description,
    openGraph: { title: `${cls.title} · Каденс`, description, images: photo ? [{ url: photo.src, width: photo.width, height: photo.height }] : undefined },
  };
}

export default async function ClassPage({ params }: Props) {
  const { slug } = await params;
  const cls = findClass(slug);
  if (!cls) notFound();

  const now = new Date();
  let sessions: SessionView[] = [];
  let scheduleFailed = false;
  try {
    sessions = await getUpcoming({ classSlug: cls.slug }, 8, BOOKING.daysAhead, now);
  } catch (error) {
    console.error(`[classes/${cls.slug}] upcoming sessions failed`, error);
    scheduleFailed = true;
  }

  const z = zoneMeta(cls.zone);
  const studio = getSpace(cls.studio);
  const studioName = roomName(studio);
  const coaches = cls.coaches.map(getCoach);
  const goals = cls.goals.map(getGoal);
  const related = relatedClasses(cls, CLASSES, 3);
  const scheduleHref = `/schedule?class=${cls.slug}`;
  const [lead, ...paragraphs] = cls.description;
  const titleFit = heroTitleFit(cls.title);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <header className="relative isolate flex min-h-[92svh] flex-col justify-end overflow-hidden pb-12 pt-32 md:pb-16 md:pt-40">
        <MediaFrame shot={cls.photo} alt={`Класс «${cls.title}»: ${roomTitle(studio)}`} sizes="100vw" priority className="absolute inset-0 -z-20" imgClassName="opacity-80" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-asphalt via-asphalt/75 to-asphalt/25" aria-hidden />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-asphalt/80 via-asphalt/20 to-transparent" aria-hidden />
        <div className="container-page">
          <Breadcrumbs
            items={[
              { href: "/", label: "Главная" },
              { href: "/classes", label: "Направления" },
              { label: cls.title },
            ]}
            className="mb-8"
          />
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end lg:gap-14">
            <Reveal>
              <p className="eyebrow mb-5">
                {roomTitle(studio)} · {studio.floor} этаж
              </p>
              <h1 className={clsx("display stretch-narrow", titleFit.className)} style={titleFit.style}>
                {cls.title}
              </h1>
              <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-chalk/85 md:text-[20px]">{cls.short}</p>
              <ul className="mt-7 flex flex-wrap items-center gap-2 text-[14px]" aria-label="Коротко о классе">
                <li className="rounded-full border border-line/15 bg-asphalt/60 px-3 py-1.5">
                  <ZoneBadge zone={cls.zone} />
                </li>
                <li className="rounded-full border border-line/15 bg-asphalt/60 px-3 py-1.5 text-dust">
                  <span className="digits text-[19px] leading-none text-chalk">{cls.durationMin}</span> минут
                </li>
                <li className="rounded-full border border-line/15 bg-asphalt/60 px-3 py-1.5 text-chalk">{levelLabel(cls.level)}</li>
                <li className="rounded-full border border-line/15 bg-asphalt/60 px-3 py-1.5 text-dust">
                  <span className="digits text-[19px] leading-none text-chalk">
                    {cls.kcal[0]}–{cls.kcal[1]}
                  </span>{" "}
                  ккал
                </li>
                <li>
                  <Link
                    href={`/studios/${studio.slug}`}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-line/15 bg-asphalt/60 px-3 py-1.5 text-chalk transition-colors hover:border-chalk"
                  >
                    <MapPin className="h-4 w-4 text-dust" aria-hidden />
                    {studioName}
                  </Link>
                </li>
              </ul>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                <MagneticButton href="#upcoming">Выбрать время</MagneticButton>
                <ArrowLink href={scheduleHref} className="min-h-[44px]">Расписание на неделю</ArrowLink>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <YourZone zone={cls.zone} />
            </Reveal>
          </div>
        </div>
      </header>

      {/* ---------- Heart-rate curve ---------- */}
      <section className="container-page mt-20 md:mt-28" aria-labelledby="curve-title">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-end">
          <Reveal>
            <p className="eyebrow mb-4">Кривая пульса</p>
            <h2 id="curve-title" className="display text-d-2 stretch-narrow">
              {cls.durationMin} {plural(cls.durationMin, "минута", "минуты", "минут")} по фазам
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-xl text-[17px] leading-relaxed text-dust">
              Класс собран из фаз, у каждой своя зона. Держитесь в своих цифрах, и нагрузка будет ровно той, что задумал тренер: не легче и не
              тяжелее.
            </p>
          </Reveal>
        </div>
        <Reveal className="mt-12">
          <CurveChart structure={cls.structure} />
        </Reveal>
        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-14">
          <Reveal>
            <h3 className="eyebrow mb-4">Фазы и ваш пульс в них</h3>
            <PhaseTable structure={cls.structure} />
          </Reveal>
          <div className="grid content-start gap-5 lg:sticky lg:top-28">
            <Reveal>
              <ZoneTime structure={cls.structure} mainZone={cls.zone} />
            </Reveal>
            <Reveal delay={0.1} className="rounded-card border border-line/10 bg-graphite p-5 md:p-6">
              <p className="display text-[22px] stretch-wide">Сделайте цифры своими</p>
              <p className="mt-2 text-[14px] text-dust">Потапайте в такт пульсу и укажите возраст: диапазоны в фазах пересчитаются сразу.</p>
              <PulseTap size="compact" className="mt-5" />
              <PulseControls className="mt-4 border-t border-line/10 pt-4" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- About ---------- */}
      <section className="container-page mt-24 md:mt-36" aria-labelledby="about-title">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <Reveal>
              <p className="eyebrow mb-4">О классе</p>
              <h2 id="about-title" className="display text-d-3 stretch-normal">
                Что будет на занятии
              </h2>
              <p className="mt-8 text-[20px] leading-relaxed text-chalk md:text-[23px]">{lead}</p>
            </Reveal>
            {paragraphs.map((p, i) => (
              <Reveal key={i} delay={0.05}>
                <p className="mt-6 max-w-[68ch] text-[17px] leading-relaxed text-dust">{p}</p>
              </Reveal>
            ))}
            <Reveal className="mt-10 border-t border-line/10 pt-6">
              <p className="eyebrow mb-4">Подходит для цели</p>
              <ul className="flex flex-wrap gap-2">
                {goals.map((g) => (
                  <li key={g.slug}>
                    <Link href={`/program?goal=${g.slug}`} className="chip min-h-[44px] px-4 text-[14.5px] hover:border-chalk">
                      {g.title}
                      <ArrowUpRight className="h-4 w-4 text-dust" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[14px] text-dust">Нажмите на цель, и программа соберёт неделю под неё вместе с этим классом.</p>
            </Reveal>
          </div>
          <div className="grid content-start gap-10">
            <Reveal>
              <h3 className="eyebrow mb-5">Что даёт</h3>
              <ol className="grid gap-4">
                {cls.benefits.map((b, i) => (
                  <li key={b} className="grid grid-cols-[40px_1fr] gap-3 border-b border-line/10 pb-4">
                    <span className="digits text-[24px] leading-none text-pulse">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[16px] leading-snug text-chalk">{b}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
            <Reveal className="rounded-card border border-line/10 bg-graphite p-5 md:p-6">
              <h3 className="display text-[22px] stretch-wide">Взять с собой</h3>
              <ul className="mt-4 grid gap-3 text-[15px]">
                {cls.bring.map((b) => (
                  <li key={b} className="flex gap-3">
                    <Check className="mt-0.5 h-4 w-4 flex-none text-pulse" aria-hidden />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Coaches ---------- */}
      <section className="container-page mt-24 md:mt-36" aria-labelledby="coaches-title">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] lg:gap-16">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow mb-4">Ведут</p>
            <h2 id="coaches-title" className="display text-d-3 stretch-normal">
              {coaches.length === 1 ? "Один тренер, свой почерк" : `${coaches.length} ${plural(coaches.length, "тренер", "тренера", "тренеров")}, одна схема`}
            </h2>
            <p className="mt-5 max-w-sm text-[16px] leading-relaxed text-dust">
              {coaches.length === 1
                ? "Класс ведёт один тренер, так что от занятия к занятию он видит, как вы прибавляете, и подсказывает, когда пора добавить нагрузку."
                : "Музыка и упражнения у каждого свои, а фазы и зоны одинаковые: кривая пульса не зависит от того, кто сегодня на подиуме."}
            </p>
          </Reveal>
          {coaches.length === 1 ? (
            <div className="grid items-end gap-8 sm:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
              <Reveal>
                <HoloCard coach={cardData(coaches[0])} sizes="(min-width: 560px) 300px, 88vw" />
              </Reveal>
              <Reveal delay={0.1}>
                <blockquote className="display text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.02] stretch-narrow">«{coaches[0].quote}»</blockquote>
                <p className="mt-4 text-[15px] text-dust">
                  {coaches[0].name}, {coaches[0].role.toLowerCase()}. В клубе с{" "}
                  <span className="digits text-[18px] text-chalk">{coaches[0].since}</span> года, опыт{" "}
                  <span className="digits text-[18px] text-chalk">{coaches[0].experienceYears}</span>{" "}
                  {plural(coaches[0].experienceYears, "год", "года", "лет")}.
                </p>
                <ArrowLink href={`/coaches/${coaches[0].slug}`} className="min-h-[44px] mt-6">
                  Профиль тренера
                </ArrowLink>
              </Reveal>
            </div>
          ) : (
            <ul className={clsx("grid gap-8 sm:grid-cols-2", coaches.length >= 3 && "lg:grid-cols-3")}>
              {coaches.map((c, i) => (
                <Reveal as="li" key={c.slug} delay={i * 0.08}>
                  <HoloCard coach={cardData(c)} sizes={coaches.length >= 3 ? "(min-width: 1100px) 22vw, (min-width: 560px) 44vw, 88vw" : "(min-width: 1100px) 30vw, (min-width: 560px) 44vw, 88vw"} />
                  <p className="mt-4 text-[15px] leading-snug text-chalk/85">«{c.quote}»</p>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ---------- Upcoming sessions ---------- */}
      <section id="upcoming" className="container-page mt-24 scroll-mt-24 md:mt-36" aria-labelledby="upcoming-title">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)] lg:gap-16">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow mb-4">Запись онлайн</p>
            <h2 id="upcoming-title" className="display text-d-3 stretch-normal">
              Ближайшие занятия
            </h2>
            <ul className="mt-6 grid gap-3 text-[15px] leading-snug text-dust">
              <li>
                Запись открывается за <span className="digits text-[18px] text-chalk">{BOOKING.daysAhead}</span> дней и закрывается за{" "}
                <span className="digits text-[18px] text-chalk">{BOOKING.closesBeforeMin}</span> минут до начала.
              </li>
              <li>
                Отменить запись онлайн можно не позже чем за <span className="digits text-[18px] text-chalk">{BOOKING.cancelBeforeMin / 60}</span>{" "}
                {plural(BOOKING.cancelBeforeMin / 60, "час", "часа", "часов")} до начала.
              </li>
              <li>Мест нет? Встаньте в лист ожидания: освободившееся место достанется первому в очереди автоматически.</li>
            </ul>
            <ArrowLink href={scheduleHref} className="min-h-[44px] mt-7">
              Всё расписание: {cls.title}
            </ArrowLink>
          </Reveal>
          <div>
            {sessions.length > 0 ? (
              // On phones SessionRow's 21 px title does not fit «Функциональный» next to the time column: scale it down here.
              <ul className="grid gap-2.5 max-sm:[&_.font-display]:text-[17px]">
                {sessions.map((s) => (
                  <li key={s.id}>
                    <SessionRow session={s} showDate dateLabel={sessionDayLabel(s.dateKey, now)} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="card grid gap-4 px-6 py-12 md:px-10">
                <p className="display text-d-4 stretch-normal">{scheduleFailed ? "Расписание не загрузилось" : "На неделе занятий нет"}</p>
                <p className="max-w-lg text-dust">
                  {scheduleFailed
                    ? "Обновите страницу через минуту или откройте расписание целиком."
                    : `В ближайшие ${BOOKING.daysAhead} дней свободных занятий «${cls.title}» не осталось. Загляните в расписание следующей недели или выберите класс в той же зоне.`}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href={scheduleHref} className="btn-ghost">
                    Открыть расписание
                  </Link>
                  <Link href={`/classes?zone=${cls.zone}#list`} className="btn-quiet">
                    Классы в зоне Z{cls.zone}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Studio ---------- */}
      <section className="container-page mt-24 md:mt-36" aria-labelledby="studio-title">
        <div className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center lg:gap-16">
          {/* SpaceCard sets its name at 34 px: «Функциональная зона» would be clipped in a narrow card, so scale it down there. */}
          <Reveal className={clsx(roomHeadingSize(studioName) === "text-d-3" && "max-lg:[&_.font-display]:text-[26px]")}>
            <SpaceCard space={studio} sizes="(min-width: 820px) 38vw, 92vw" />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow mb-4">Где проходит</p>
            <h2 id="studio-title" className={clsx("display stretch-narrow", roomHeadingSize(studioName))}>
              {studioName}
            </h2>
            <p className="mt-4 text-[15px] text-dust">
              {studio.label}, {studio.floor} этаж · <span className="digits text-[18px] text-chalk">{num(studio.area)}</span> м²
              {studio.capacity ? (
                <>
                  {" "}
                  · <span className="digits text-[18px] text-chalk">{studio.capacity}</span> {plural(studio.capacity, "место", "места", "мест")} на занятии
                </>
              ) : null}
            </p>
            <p className="mt-6 max-w-[62ch] text-[17px] leading-relaxed text-chalk/85">{studio.description[0]}</p>
            <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-line/10 pt-6">
              {studio.facts.map((f) => (
                <div key={f.label}>
                  <dt className="sr-only">{f.label}</dt>
                  <dd className="digits text-[44px] leading-[0.85] text-chalk md:text-[56px]">{f.value}</dd>
                  <dd className="mt-2 text-[13px] leading-snug text-dust">{f.label}</dd>
                </div>
              ))}
            </dl>
            <ArrowLink href={`/studios/${studio.slug}`} className="min-h-[44px] mt-8">
              Подробнее о зале
            </ArrowLink>
          </Reveal>
        </div>
      </section>

      {/* ---------- Related ---------- */}
      {related.length > 0 && (
        <section className="container-page mt-24 md:mt-36" aria-labelledby="related-title">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow={`Та же цель: ${goals.map((g) => g.title.toLowerCase()).join(", ")}`}
              title={<span id="related-title">Что добавить в неделю</span>}
              size="d-3"
              stretch="normal"
              lead="Чередуйте тяжёлые дни с лёгкими: так пульс растёт в нужных зонах, а не просто всю неделю держится на пределе."
            />
            <ArrowLink href="/classes" className="min-h-[44px]">Все направления</ArrowLink>
          </div>
          <ul className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {related.map((c, i) => (
              <Reveal as="li" key={c.slug} delay={i * 0.08} className={clsx(i === 2 && "md:hidden xl:block")}>
                <ClassCard cls={c} />
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- Trial ---------- */}
      <section className="container-page mt-24 md:mt-32" aria-labelledby="trial-title">
        <Reveal className="grid gap-6 rounded-card border border-line/10 bg-graphite p-6 sm:p-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <h2 id="trial-title" className="display text-d-3 stretch-normal">
              Первый раз? Начните с пробной
            </h2>
            <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-dust">
              Пробная тренировка бесплатная: тренер проведёт пульс-тест, посчитает ваши зоны и скажет, готовы ли вы к классу «{cls.title}» или лучше
              начать с чего-то спокойнее.
            </p>
          </div>
          <Link href="/trial" className="btn-primary">
            Записаться на пробную
          </Link>
        </Reveal>
      </section>
    </>
  );
}
