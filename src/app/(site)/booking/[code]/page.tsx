import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { CalendarPlus } from "lucide-react";
import { CancelBooking } from "@/components/booking/CancelBooking";
import { Ticket } from "@/components/booking/Ticket";
import { TicketReveal } from "@/components/booking/TicketReveal";
import { WaitlistRefresh } from "@/components/booking/WaitlistRefresh";
import { placeName } from "@/components/schedule/place";
import { isUpcoming, ticketState, type TicketState } from "@/components/booking/ticket-state";
import { BeatDot, BeatWord } from "@/components/pulse/Beat";
import { PersonalRange } from "@/components/pulse/Zones";
import { ArrowLink, Breadcrumbs } from "@/components/ui/Kit";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { getClass } from "@/data/classes";
import { getSpace } from "@/data/spaces";
import type { Space } from "@/data/types";
import { getBookingView } from "@/lib/booking";
import { BOOKING, CLUB } from "@/lib/club";
import { plural } from "@/lib/format";
import type { BookingView } from "@/lib/session-types";
import { formatDay, hhmmToMinutes, minutesToHHMM, relativeDayLabel } from "@/lib/time";
import { zoneMeta } from "@/lib/zones";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ code: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const cleanCode = (raw: string) => raw.trim().toUpperCase().slice(0, 16);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Запись ${cleanCode(code)}`,
    description: "Билет на занятие в «Каденсе»: время, студия, тренер и ваш пульсовой коридор. Здесь же лист ожидания и отмена записи.",
    robots: { index: false, follow: false },
  };
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const cancelHours = BOOKING.cancelBeforeMin / 60;
const hoursWord = plural(cancelHours, "час", "часа", "часов");
/** "меньше 2 часов" */
const hoursGen = plural(cancelHours, "часа", "часов", "часов");
const people = (n: number) => `${n} ${plural(n, "человек", "человека", "человек")}`;

/** Where the class runs, as a place phrase: "в студии «Вираж»", "в бассейне «Глубина»". */
function placeIn(space: Space): string {
  if (space.kind === "studio") return `в студии «${space.name}»`;
  const zones: Partial<Record<Space["slug"], string>> = {
    pool: `в бассейне «${space.name}»`,
    gym: "в тренажёрном зале",
    functional: "в функциональной зоне",
    cardio: "в кардиозоне",
  };
  return zones[space.slug] ?? `в зоне «${space.name}»`;
}

type Headline = { eyebrow: string; title: ReactNode; size: "d-1" | "d-2"; lead: ReactNode };

/** The status headline. `when` is "сегодня", "завтра" or "в пятницу, 26 сентября". */
function headline(state: TicketState, b: BookingView, when: string): Headline {
  const s = b.session;
  const cls = getClass(s.classSlug);
  const space = getSpace(s.studioSlug);
  const firstName = b.name.trim().split(/\s+/)[0];
  const n = b.waitlistPosition ?? 1;
  const time = (t: string) => <span className="digits text-[1.3em] leading-none text-chalk">{t}</span>;

  switch (state) {
    case "booked":
      return {
        eyebrow: "Место за вами",
        size: "d-1",
        title: (
          <>
            {firstName}, вы{" "}
            <BeatWord base={56} amp={22} className="text-pulse">
              записаны
            </BeatWord>
          </>
        ),
        lead: (
          <>
            {capitalize(when)} в {time(s.time)}, {placeIn(space)}, {space.floor} этаж. Приходите за 10 минут до начала, чтобы переодеться и без спешки занять
            место. Планы поменяются — отмените запись здесь же не позже чем за {cancelHours} {hoursWord} до начала, и место сразу получит первый из листа
            ожидания.
          </>
        ),
      };
    case "live":
      return {
        eyebrow: "Прямо сейчас",
        size: "d-1",
        title: (
          <>
            Занятие{" "}
            <span className="inline-flex items-center gap-[0.12em] text-pulse">
              идёт
              <BeatDot className="h-[0.16em] w-[0.16em]" />
            </span>
          </>
        ),
        lead: (
          <>
            «{cls.title}» {placeIn(space)} началось в {time(s.time)} и закончится в {time(s.endTime)}. Если вы ещё в пути, подойдите на ресепшен: там
            подскажут, успеваете ли вы присоединиться.
          </>
        ),
      };
    case "waitlist":
      return {
        eyebrow: "Мест нет, но есть очередь",
        size: "d-2",
        title: (
          <>
            Вы <span className="digits text-[1.25em] leading-[0.7] text-pulse">{n}-й</span> в листе ожидания
          </>
        ),
        lead: (
          <>
            Все {s.capacity} мест на занятие {when} в {time(s.time)} уже заняты. Как только кто-то отменит запись, место автоматически перейдёт первому в
            очереди — просить никого не нужно.
          </>
        ),
      };
    case "missed":
      return {
        eyebrow: "Лист ожидания закрыт",
        size: "d-2",
        title: "Место не освободилось",
        lead: "Занятие началось, а из записавшихся никто не отказался. Делать ничего не нужно: запись закрылась сама. В расписании видно, где есть свободные места.",
      };
    case "attended":
      return {
        eyebrow: "Тренировка в копилке",
        size: "d-1",
        title: (
          <>
            Отметка <span className="text-pulse">стоит</span>
          </>
        ),
        lead: `${capitalize(when)} вы были на занятии «${cls.title}», тренер — ${s.coachName}. Основная работа шла в зоне Z${s.zone}, «${zoneMeta(s.zone).name}». Следующее занятие лучше записать заранее: запись открывается за ${BOOKING.daysAhead} дней.`,
      };
    case "no_show":
      return {
        eyebrow: "Пропуск",
        size: "d-2",
        title: "Вас не было на занятии",
        lead: `Тренер отметил неявку. Бывает. В следующий раз, если планы поменяются, отмените запись хотя бы за ${cancelHours} ${hoursWord} до начала: место достанется тому, кто ждёт в листе ожидания.`,
      };
    case "cancelled":
      return {
        eyebrow: "Отмена",
        size: "d-1",
        title: "Запись отменена",
        lead: "Место вернулось в расписание или ушло первому из листа ожидания. Пока запись на занятие открыта, можно записаться снова — или выбрать другое время.",
      };
    case "club-cancelled":
      return {
        eyebrow: "Изменение в расписании",
        size: "d-2",
        title: "Клуб отменил занятие",
        lead: `${s.note ? `${s.note.replace(/\.$/, "")}. ` : ""}Приносим извинения. Отменять запись не нужно, она закрыта. Выберите другое время в расписании или позвоните на ресепшен: ${CLUB.phone}.`,
      };
    case "past":
      return {
        eyebrow: "Архив",
        size: "d-1",
        title: "Занятие прошло",
        lead: `«${cls.title}» ${when} закончилось в ${s.endTime}. Отметку о посещении тренер ставит после занятия. Следующее — в расписании.`,
      };
  }
}

/** The waitlist as a row of places: people ahead, the visitor, people behind. */
function Queue({ position, total }: { position: number; total: number }) {
  const ahead = position - 1;
  const aheadShown = Math.min(ahead, 10);
  const behind = Math.max(0, total - position);
  const behindShown = Math.min(behind, 3);
  const cell = "h-9 w-9 rounded-lg";
  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-dust">
        Очередь на это занятие
      </p>
      <div role="img" aria-label={`Вы ${position}-й из ${Math.max(total, position)} в листе ожидания`} className="mt-3 flex flex-wrap items-end gap-1.5">
        {ahead > aheadShown && <span className="digits pb-1 pr-1 text-[18px] text-dust">+{ahead - aheadShown}</span>}
        {Array.from({ length: aheadShown }, (_, i) => (
          <span key={`a${i}`} className={`${cell} bg-chalk/25`} />
        ))}
        <span className="grid h-12 w-9 place-items-center rounded-lg bg-pulse font-display text-[11px] uppercase text-asphalt" style={{ fontWeight: 800, fontVariationSettings: '"wdth" 110' }}>
          вы
        </span>
        {Array.from({ length: behindShown }, (_, i) => (
          <span key={`b${i}`} className={`${cell} border border-line/20`} />
        ))}
        {behind > behindShown && <span className="digits pb-1 pl-1 text-[18px] text-dust">+{behind - behindShown}</span>}
      </div>
    </div>
  );
}

export default async function BookingTicketPage({ params, searchParams }: Props) {
  const [{ code }, sp] = await Promise.all([params, searchParams]);
  const now = new Date();
  const booking = await getBookingView(cleanCode(code), now);
  if (!booking) notFound();

  const s = booking.session;
  const cls = getClass(s.classSlug);
  const space = getSpace(s.studioSlug);
  const state = ticketState(booking);
  const upcoming = isUpcoming(state);
  const day = formatDay(s.dateKey);
  const rel = relativeDayLabel(s.dateKey, now);
  const near = rel === "сегодня" || rel === "завтра";
  const h = headline(state, booking, near ? rel : `в ${day.weekdayAcc}, ${day.dayMonth}`);
  const play = sp.new === "1" && (state === "booked" || state === "waitlist");
  const place = placeName(space);
  const arrive = minutesToHHMM(hhmmToMinutes(s.time) - 10);
  const first = cls.structure[0];
  const last = cls.structure[cls.structure.length - 1];
  const position = booking.waitlistPosition ?? 1;
  const canManage = state === "booked" || state === "waitlist";

  const steps = [
    {
      time: arrive,
      title: "Приходите",
      text: "Ресепшен и раздевалки на первом этаже: шкафчики, душевые, фены. Десяти минут хватит, чтобы переодеться и дойти до зала.",
    },
    {
      time: s.time,
      title: `Начало ${placeIn(space)}`,
      text: `${space.floor} этаж. ${s.coachName} начинает с фазы «${first.title}»: ${first.minutes} мин в зоне Z${first.zone}, пульс разгоняется постепенно.`,
    },
    {
      time: s.endTime,
      title: "Финиш",
      text: `Последние ${last.minutes} мин — «${last.title}», пульс возвращается в зону Z${last.zone}. А большая часть занятия идёт в зоне Z${s.zone}: это`,
      range: true,
    },
  ];

  return (
    <>
      {/* Status */}
      <section className="relative isolate overflow-hidden pb-12 pt-32 md:pb-16 md:pt-40">
        <div aria-hidden className="ecg-grid absolute inset-0 -z-10 opacity-70 [mask-image:linear-gradient(to_bottom,black_20%,transparent)]" />
        <div className="container-page">
          <Breadcrumbs items={[{ href: "/", label: "Главная" }, { href: "/booking", label: "Мои записи" }, { label: booking.code }]} className="mb-10" />
          <Reveal className="max-w-5xl">
            <p className="eyebrow mb-5">{h.eyebrow}</p>
            <h1 className={`display ${h.size === "d-1" ? "text-d-1" : "text-d-2"} stretch-narrow`}>{h.title}</h1>
            <p className="mt-7 max-w-3xl text-[17px] leading-relaxed text-dust md:text-[19px]">{h.lead}</p>
          </Reveal>

          {state === "waitlist" && (
            <Reveal delay={0.1} className="mt-10 grid gap-8 rounded-card border border-line/10 bg-graphite/80 p-5 sm:p-7 md:grid-cols-2 md:gap-12">
              <div className="grid content-start gap-6">
                <Queue position={position} total={s.waitlist} />
                <p className="text-[15px] leading-relaxed text-chalk">
                  {position === 1
                    ? "Перед вами никого: первая же отмена отдаст место вам."
                    : `Перед вами ${people(position - 1)}. Место придёт, когда из записанных откажутся ${people(position)}, или раньше, если кто-то уйдёт из очереди.`}
                </p>
              </div>
              <div className="grid content-start gap-5">
                <p className="text-[15px] leading-relaxed text-dust">
                  Уведомлений мы не присылаем. Загляните сюда ближе к занятию и нажмите «Обновить»: если место освободилось, статус сменится на «Вы
                  записаны», а в билете появится номер места. Если место так и не придёт, делать ничего не нужно — запись закроется сама.
                </p>
                <WaitlistRefresh />
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* Ticket */}
      <section aria-label="Билет" className="container-page">
        <TicketReveal play={play}>
          <Ticket booking={booking} state={state} dayLabel={near ? `${rel}, ${day.dayMonth}` : day.long} />
        </TicketReveal>
      </section>

      {/* Details and management */}
      <section className="container-page grid gap-14 pb-24 pt-16 md:pb-32 md:pt-24 lg:grid-cols-12 lg:gap-10">
        <div className="grid min-w-0 content-start gap-16 lg:col-span-7">
          {state === "booked" && (
            <Reveal as="section">
              <h2 className="display text-d-3 stretch-normal">Перед занятием</h2>
              <ol className="mt-8 border-l border-line/15">
                {steps.map((step) => (
                  <li key={step.title} className="relative grid gap-1 pb-9 pl-6 last:pb-0 sm:grid-cols-[110px_1fr] sm:gap-6 sm:pl-8">
                    <span aria-hidden className="absolute -left-[5px] top-3 h-2.5 w-2.5 rounded-full bg-pulse" />
                    <span className="digits text-[40px] leading-none text-chalk">{step.time}</span>
                    <span>
                      <span className="block text-[17px] font-semibold text-chalk">{step.title}</span>
                      <span className="mt-1 block text-[15px] leading-relaxed text-dust">
                        {step.text}
                        {step.range && (
                          <>
                            {" "}
                            <PersonalRange zone={s.zone} withUnit className="text-[20px] text-chalk" /> по вашим цифрам.
                          </>
                        )}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </Reveal>
          )}

          {canManage && (
            <Reveal as="section">
              <h2 className="display text-d-3 stretch-normal">Что взять</h2>
              <ul className="mt-8 grid gap-px overflow-hidden rounded-card border border-line/10 bg-line/10 sm:grid-cols-2">
                {cls.bring.map((item, i) => (
                  <li key={item} className="flex gap-4 bg-graphite p-5">
                    <span className="digits text-[34px] leading-none text-pulse">{String(i + 1).padStart(2, "0")}</span>
                    <span className="pt-1 text-[15px] leading-snug text-chalk">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {!upcoming && (
            <Reveal as="section">
              <h2 className="display text-d-3 stretch-normal">Что дальше</h2>
              <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-dust">
                Запись открывается за {BOOKING.daysAhead} дней и закрывается за {BOOKING.closesBeforeMin} минут до начала. Хотите, чтобы неделя собралась сама,
                — соберите программу под свой пульс: она подберёт занятия в ваших зонах.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {state === "cancelled" && s.bookable ? (
                  <Link href={`/schedule/${s.id}`} className="btn-primary">
                    Записаться снова
                  </Link>
                ) : (
                  <Link href="/schedule" className="btn-primary">
                    Выбрать время в расписании
                  </Link>
                )}
                <Link href="/program" className="btn-ghost">
                  Собрать программу под пульс
                </Link>
              </div>
            </Reveal>
          )}

          <Reveal as="section">
            <Link href={`/studios/${space.slug}`} className="group relative block overflow-hidden rounded-card border border-line/10">
              <MediaFrame
                shot={space.photo}
                alt={`${space.label} ${place}`}
                sizes="(min-width: 1100px) 55vw, 92vw"
                className="aspect-[4/3] sm:aspect-[2/1]"
                imgClassName="transition-transform duration-700 ease-silk group-hover:scale-[1.04]"
              />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-asphalt via-asphalt/40 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 grid gap-2 p-5 sm:p-7">
                <span className="eyebrow">
                  {space.floor} этаж · {space.label}
                </span>
                <span className="font-display text-[clamp(2rem,5vw,3.4rem)] uppercase leading-[0.9] text-chalk" style={{ fontVariationSettings: '"wdth" 64', fontWeight: 850 }}>
                  {place}
                </span>
                <span className="max-w-lg text-[14.5px] text-dust">{space.mood}</span>
              </span>
            </Link>
          </Reveal>
        </div>

        <aside aria-labelledby="manage-title" className="min-w-0 lg:col-span-5">
          <div className="card grid gap-6 p-5 sm:p-7 lg:sticky lg:top-28">
            <div>
              <p className="eyebrow">Запись {booking.code}</p>
              <h2 id="manage-title" className="display mt-3 text-d-4 stretch-normal">
                Управление записью
              </h2>
            </div>

            <div className="grid gap-3">
              {canManage && (
                <a href={`/booking/${booking.code}/calendar`} className="btn-primary w-full">
                  <CalendarPlus aria-hidden className="h-4 w-4" />
                  Добавить в календарь
                </a>
              )}
              <Link href={`/booking?code=${encodeURIComponent(booking.code)}`} className="btn-ghost w-full">
                Все мои записи
              </Link>
              {canManage && (
                <p className="text-[13px] leading-snug text-dust">
                  Файл .ics: событие с кодом записи и напоминанием за {cancelHours} {hoursWord} до начала. Открывается в Google, Apple и Яндекс Календаре.
                </p>
              )}
            </div>

            <CancelBooking
              code={booking.code}
              cancellable={canManage && booking.cancellable}
              waitlist={state === "waitlist"}
              className="grid gap-4 border-t border-line/10 pt-6"
              note={
                <p className="text-[14.5px] leading-relaxed text-dust">
                  {state === "waitlist"
                    ? "Выйти из листа ожидания можно в любой момент до начала занятия."
                    : `Онлайн отменить можно не позже чем за ${cancelHours} ${hoursWord} до начала. Место сразу уйдёт первому из листа ожидания.`}
                </p>
              }
              fallback={
                state === "booked" ? (
                  <p className="rounded-xl border border-line/15 bg-raised px-4 py-3 text-[14.5px] leading-relaxed text-chalk">
                    До начала меньше {cancelHours} {hoursGen}, онлайн-отмена уже закрыта. Если не успеваете, позвоните на ресепшен{" "}
                    <a href={CLUB.phoneHref} className="link-underline digits whitespace-nowrap text-[18px]">
                      {CLUB.phone}
                    </a>
                    : администратор снимет запись, и место получит следующий в листе ожидания.
                  </p>
                ) : null
              }
            />

            <div className="grid gap-2 border-t border-line/10 pt-6 text-[14px] text-dust">
              <p>
                {CLUB.city}, {CLUB.street}
              </p>
              <p>
                Ресепшен:{" "}
                <a href={CLUB.phoneHref} className="link-underline digits whitespace-nowrap text-[18px] text-chalk">
                  {CLUB.phone}
                </a>
              </p>
              <ArrowLink href={`/classes/${cls.slug}`} className="mt-2">
                Всё о занятии «{cls.title}»
              </ArrowLink>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
