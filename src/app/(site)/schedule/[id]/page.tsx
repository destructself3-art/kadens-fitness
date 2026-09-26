import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowUpRight } from "lucide-react";
import { ClassCurve } from "@/components/classes/ClassCurve";
import { BeatDot } from "@/components/pulse/Beat";
import { PersonalRange } from "@/components/pulse/Zones";
import { BookingForm } from "@/components/schedule/BookingForm";
import { PhaseList } from "@/components/schedule/PhaseList";
import { placeName } from "@/components/schedule/place";
import { SeatsMap } from "@/components/schedule/SeatsMap";
import { SessionRow } from "@/components/schedule/SessionRow";
import { ArrowLink, Breadcrumbs, ZoneBadge } from "@/components/ui/Kit";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { getClass } from "@/data/classes";
import { getCoach } from "@/data/coaches";
import { getSpace } from "@/data/spaces";
import { BOOKING } from "@/lib/club";
import { placesLabel } from "@/lib/format";
import { getDaySessions, getSessionView, getSessionsBetween } from "@/lib/schedule";
import type { SessionView } from "@/lib/session-types";
import { addDays, dateKeyOf, formatDay, relativeDayLabel, timeOf, weekStartOf } from "@/lib/time";
import { zoneMeta } from "@/lib/zones";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// One database read for generateMetadata and the page.
const loadSession = cache((id: string) => getSessionView(id));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const s = await loadSession(id);
  if (!s) return { title: "Занятие не найдено", description: "Такого занятия нет в расписании «Каденса»." };
  const day = formatDay(s.dateKey);
  const space = getSpace(s.studioSlug);
  return {
    title: `${s.classTitle}, ${day.dayMonth} в ${s.time}`,
    description: `${s.classTitle}: ${day.long}, ${s.time}–${s.endTime}, ${placeName(space)}, ${space.floor} этаж. Ведёт ${s.coachName}, зона Z${s.zone} «${zoneMeta(s.zone).name}». ${
      s.status === "cancelled" ? "Занятие отменено." : s.left > 0 ? `Свободно ${s.left} из ${s.capacity} мест, запись онлайн.` : "Мест нет, открыт лист ожидания."
    }`,
  };
}

export default async function SessionPage({ params }: Params) {
  const { id } = await params;
  const s = await loadSession(id);
  if (!s) notFound();

  const now = new Date();
  const cls = getClass(s.classSlug);
  const space = getSpace(s.studioSlug);
  const coach = getCoach(s.coachSlug);
  const regular = s.regularCoachSlug ? getCoach(s.regularCoachSlug) : null;
  const z = zoneMeta(s.zone);
  const day = formatDay(s.dateKey);
  const dayLabel = relativeDayLabel(s.dateKey, now);
  /** "сегодня" / "завтра" read better than a date */
  const near = dayLabel === "сегодня" || dayLabel === "завтра";
  const week = weekStartOf(s.dateKey);
  const scheduleHref = `/schedule?week=${week}&day=${s.dateKey}`;

  const [sameClass, sameStudio] = await Promise.all([
    getSessionsBetween(week, addDays(week, 6), { classSlug: s.classSlug }, now),
    getDaySessions(s.dateKey, { studioSlug: s.studioSlug }, now),
  ]);
  const upcomingSameClass = sameClass.filter((x) => x.id !== s.id && !x.started && x.status === "scheduled");
  const otherClassTimes = (upcomingSameClass.length ? upcomingSameClass : sameClass.filter((x) => x.id !== s.id)).slice(0, 6);
  // The studio's day without the times already listed for this class (the cycle studio runs only cycle).
  const listed = new Set(otherClassTimes.map((x) => x.id));
  const otherInStudio = sameStudio.filter((x) => x.id !== s.id && !listed.has(x.id));
  const bookableNext = upcomingSameClass.find((x) => x.bookable);

  const today = dateKeyOf(now);
  const openDay = addDays(s.dateKey, -(BOOKING.daysAhead - 1));
  const opensLabel = s.closedReason === "not-open-yet" ? (openDay === addDays(today, 1) ? "завтра" : formatDay(openDay).dayMonth) : null;
  const shortDate = (x: SessionView) => {
    const rel = relativeDayLabel(x.dateKey, now);
    return rel === "сегодня" || rel === "завтра" ? rel : `${formatDay(x.dateKey).weekdayShort}, ${formatDay(x.dateKey).dayMonth}`;
  };
  const alternative = bookableNext ? { id: bookableNext.id, label: `Ближайший: ${shortDate(bookableNext)} в ${bookableNext.time}` } : null;
  const cancelUntil = new Date(Date.parse(s.startsAt) - BOOKING.cancelBeforeMin * 60_000);

  return (
    <>
      {/* Photo header */}
      <header className="relative isolate flex min-h-[74svh] flex-col justify-end overflow-hidden pb-10 pt-32 md:min-h-[82svh] md:pb-14">
        <MediaFrame shot={cls.photo} alt={`${cls.title}: ${cls.short}`} sizes="100vw" priority className="absolute inset-0 -z-20" imgClassName="opacity-80" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-asphalt via-asphalt/65 to-asphalt/20" aria-hidden />
        <div className="absolute inset-y-0 left-0 -z-10 w-[5px]" style={{ background: z.color }} aria-hidden />
        <div className="container-page">
          <Breadcrumbs
            items={[
              { href: "/", label: "Главная" },
              { href: scheduleHref, label: "Расписание" },
              { label: `${s.classTitle}, ${s.time}` },
            ]}
            className="mb-8"
          />
          <Reveal>
            <p className="eyebrow mb-4 flex flex-wrap items-center gap-x-2">
              {s.live && (
                <span className="inline-flex items-center gap-1.5 text-pulse">
                  <BeatDot className="h-2 w-2" /> идёт сейчас ·
                </span>
              )}
              {near ? `${dayLabel}, ${day.dayMonth}` : day.long}
            </p>
            <h1 className={`display stretch-narrow text-[clamp(2.6rem,8.5vw,8.5rem)] leading-[0.84] ${s.status === "cancelled" ? "line-through decoration-pulse decoration-[0.06em]" : ""}`}>
              {s.classTitle}
            </h1>
          </Reveal>
          <Reveal delay={0.08}>
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-line/15 pt-6 md:flex md:flex-wrap md:items-end md:gap-x-12">
              <div className="col-span-2 md:col-span-1">
                <dt className="sr-only">Время</dt>
                <dd className="digits text-[64px] leading-[0.8] text-chalk md:text-[88px]">
                  {s.time}
                  <span className="text-dust">–{s.endTime}</span>
                </dd>
              </div>
              <div>
                <dt className="eyebrow mb-2">Зона</dt>
                <dd className="flex flex-wrap items-center gap-3">
                  <ZoneBadge zone={s.zone} />
                  <PersonalRange zone={s.zone} withUnit className="text-[26px] leading-none text-chalk" />
                </dd>
              </div>
              <div>
                <dt className="eyebrow mb-2">Где</dt>
                <dd>
                  <Link href={`/studios/${space.slug}`} className="link-underline text-[15.5px] font-medium text-chalk">
                    {placeName(space)}
                  </Link>
                  <span className="block text-[13.5px] text-dust">
                    {space.label}, {space.floor} этаж
                  </span>
                </dd>
              </div>
              <div>
                <dt className="eyebrow mb-2">Длится</dt>
                <dd className="text-[15.5px] text-chalk">
                  <span className="digits text-[26px] leading-none">{s.durationMin}</span> мин
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </header>

      {/* Changes to this class: cancellation, substitute, a note from the admin */}
      {(s.status === "cancelled" || regular || (s.note && s.note !== "Замена тренера")) && (
        <div className="container-page">
          <div
            role="note"
            className={`mt-2 flex flex-col gap-1 rounded-card border px-5 py-4 sm:flex-row sm:items-center sm:gap-4 ${s.status === "cancelled" ? "border-pulse/50 bg-pulse/10" : "border-line/20 bg-raised"}`}
          >
            <p className="font-semibold text-chalk">{s.status === "cancelled" ? "Занятие отменено" : regular ? "Замена тренера" : "Важно"}</p>
            <p className="text-[15px] text-dust">
              {s.status === "cancelled"
                ? (s.note ?? "Посмотрите соседнее время в расписании.")
                : regular
                  ? `Ведёт ${coach.name}, обычно этот класс ведёт ${regular.name}. Формат, зона и время те же.`
                  : s.note}
            </p>
          </div>
        </div>
      )}

      <div className="container-page grid gap-14 py-14 md:py-20 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16">
        {/* Booking card: first on phones, a sticky column on desktop */}
        <aside id="booking" aria-labelledby="booking-title" className="scroll-mt-28 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1 lg:self-start">
          <div className="card relative overflow-hidden p-5 sm:p-7">
            <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: z.color }} aria-hidden />
            <h2 id="booking-title" className="display text-d-4 stretch-normal">
              {s.bookable && s.left === 0 ? "Лист ожидания" : "Запись"}
            </h2>
            <p className="mt-2 text-[14.5px] text-dust">
              {s.classTitle}, {near ? dayLabel : day.dayMonth} в <span className="digits text-[19px] text-chalk">{s.time}</span>
              {s.bookable && (
                <>
                  {" "}
                  · {s.left > 0 ? <>свободно <span className="digits text-[19px] text-chalk">{s.left}</span> из {s.capacity}</> : "мест нет"}
                </>
              )}
            </p>
            <div className="mt-6">
              <BookingForm session={s} opensLabel={opensLabel} alternative={alternative} />
            </div>
            {s.bookable && (
              <p className="mt-5 border-t border-line/10 pt-4 text-[13px] text-dust">
                {s.left === 0 ? (
                  "Выйти из листа ожидания можно онлайн до самого начала."
                ) : (
                  <>
                    Отменить онлайн — до <span className="digits text-[17px] text-chalk">{timeOf(cancelUntil)}</span>
                    {dateKeyOf(cancelUntil) !== s.dateKey ? ` ${relativeDayLabel(dateKeyOf(cancelUntil), now)}` : ""}.
                  </>
                )}
              </p>
            )}
          </div>
        </aside>

        <div className="grid min-w-0 gap-16 md:gap-20 lg:col-start-1 lg:row-start-1">
          {/* Places */}
          <section aria-labelledby="seats-title">
            <Reveal>
              <p className="eyebrow mb-3">
                {placeName(space)}: {placesLabel(s.capacity)} на занятии
              </p>
              <h2 id="seats-title" className="display text-d-3 stretch-normal">
                Места
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <SeatsMap session={s} className="mt-8" />
            </Reveal>
          </section>

          {/* Coach */}
          <section aria-labelledby="coach-title">
            <Reveal>
              <h2 id="coach-title" className="display text-d-3 stretch-normal">
                Ведёт
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <Link
                href={`/coaches/${coach.slug}`}
                className="group mt-8 grid grid-cols-[104px_minmax(0,1fr)] items-center gap-5 rounded-card border border-line/10 bg-graphite p-3 pr-5 transition-colors hover:border-line/30 sm:grid-cols-[132px_minmax(0,1fr)_auto] sm:gap-7"
              >
                <MediaFrame shot={coach.photo} alt={`${coach.name}, ${coach.role.toLowerCase()}`} sizes="132px" className="aspect-[4/5] rounded-2xl" quiet />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-[26px] uppercase leading-[0.95] text-chalk sm:text-[32px]" style={{ fontVariationSettings: '"wdth" 66', fontWeight: 850 }}>
                      {coach.name}
                    </span>
                    {regular && <span className="rounded-full bg-chalk px-2 py-0.5 text-[12px] font-semibold text-asphalt">замена</span>}
                  </span>
                  <span className="mt-1.5 block text-[14.5px] text-dust">{coach.role}</span>
                  {regular ? (
                    <span className="mt-2 block text-[13.5px] text-dust">Обычно этот класс ведёт {regular.name}</span>
                  ) : (
                    <span className="mt-3 hidden text-[14.5px] italic leading-snug text-chalk/85 sm:block">«{coach.quote}»</span>
                  )}
                </span>
                <ArrowUpRight
                  className="hidden h-5 w-5 text-dust transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-chalk sm:block"
                  aria-hidden
                />
              </Link>
            </Reveal>
          </section>

          {/* Heart-rate curve */}
          <section aria-labelledby="curve-title">
            <Reveal>
              <p className="eyebrow mb-3">
                Основная работа в зоне Z{z.id} «{z.name}»: <PersonalRange zone={z.id} withUnit className="text-[17px] text-chalk" />
              </p>
              <h2 id="curve-title" className="display text-d-3 stretch-normal">
                Пульс по минутам
              </h2>
              <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-dust">{z.feel}. Цифры справа — ваш пульс в каждой части занятия.</p>
            </Reveal>
            <Reveal delay={0.05} className="mt-8">
              <div className="rounded-card border border-line/10 bg-graphite p-4 pt-6 sm:p-6">
                <ClassCurve structure={cls.structure} showLabels={false} height={150} />
              </div>
            </Reveal>
            <Reveal delay={0.1} className="mt-6">
              <PhaseList structure={cls.structure} start={s.time} />
            </Reveal>
          </section>

          {/* About */}
          <section aria-labelledby="about-title" className="grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-10">
            <Reveal>
              <h2 id="about-title" className="display text-d-3 stretch-normal">
                О занятии
              </h2>
              <p className="mt-6 text-[17px] leading-relaxed text-chalk/90">{cls.description[0]}</p>
              <ArrowLink href={`/classes/${cls.slug}`} className="mt-6">
                Всё о направлении «{cls.title}»
              </ArrowLink>
            </Reveal>
            <Reveal delay={0.08} className="md:pt-3">
              <h3 className="eyebrow mb-4">Что взять с собой</h3>
              <ul className="grid gap-3 text-[15.5px] leading-snug">
                {cls.bring.map((item) => (
                  <li key={item} className="flex gap-3 border-t border-line/10 pt-3">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full" style={{ background: z.color }} aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[13.5px] leading-relaxed text-dust">
                Приходите за 10 минут: переодеться и, если вы впервые, познакомиться с тренером.
              </p>
            </Reveal>
          </section>
        </div>
      </div>

      {/* Other times */}
      {(otherClassTimes.length > 0 || otherInStudio.length > 0) && (
        <section aria-labelledby="more-title" className="border-t border-line/10 bg-graphite/40 py-16 md:py-24">
          <div className="container-page">
            <Reveal className="flex flex-wrap items-end justify-between gap-6">
              <h2 id="more-title" className="display text-d-2 stretch-wide">
                Другое время
              </h2>
              <ArrowLink href={scheduleHref}>Всё расписание на {day.dayMonth}</ArrowLink>
            </Reveal>
            <div className={`mt-10 grid gap-12 lg:gap-10 ${otherClassTimes.length > 0 && otherInStudio.length > 0 ? "lg:grid-cols-2" : "lg:max-w-[calc(50%-20px)]"}`}>
              {otherClassTimes.length > 0 && (
                <div>
                  <h3 className="eyebrow mb-4">«{s.classTitle}» на этой неделе</h3>
                  <ul className="grid gap-2 max-sm:[&_.font-display:not(.rounded-md)]:text-[18px]">
                    {otherClassTimes.map((x) => (
                      <li key={x.id}>
                        <SessionRow session={x} showDate dateLabel={shortDate(x)} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {otherInStudio.length > 0 && (
                <div>
                  <h3 className="eyebrow mb-4">
                    {placeName(space)} {near ? dayLabel : day.dayMonth}
                  </h3>
                  <ul className="grid gap-2 max-sm:[&_.font-display:not(.rounded-md)]:text-[18px]">
                    {otherInStudio.map((x) => (
                      <li key={x.id}>
                        <SessionRow session={x} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
