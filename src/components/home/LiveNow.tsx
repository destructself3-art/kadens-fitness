import { ArrowLink } from "@/components/ui/Kit";
import { HomeReveal } from "./HomeReveal";
import { BeatDot } from "@/components/pulse/Beat";
import { SessionRow } from "@/components/schedule/SessionRow";
import { BOOKING } from "@/lib/club";
import { plural } from "@/lib/format";
import type { SessionView } from "@/lib/session-types";
import { dateKeyOf, formatDay, relativeDayLabel, timeOf, type OpenStatus } from "@/lib/time";

type Props = {
  live: SessionView[];
  next: SessionView[];
  /** First classes of the next days, filled only when nothing runs and nothing is left today */
  upcoming: SessionView[];
  people: number;
  status: OpenStatus;
  now: Date;
};

/** «Сейчас в клубе»: the club clock on the left, what runs and what starts next on the right. */
export function LiveNow({ live, next, upcoming, people, status, now }: Props) {
  const today = formatDay(dateKeyOf(now));
  const clock = timeOf(now);
  const dayOver = live.length === 0 && next.length === 0;

  return (
    <section aria-labelledby="now-title" className="relative border-t border-line/10 py-24 md:py-32">
      <div aria-hidden className="ecg-grid pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:linear-gradient(180deg,#000,transparent_70%)]" />
      <div className="container-page grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <HomeReveal>
            <p className="eyebrow flex items-center gap-2.5">
              <BeatDot className="h-2 w-2 text-pulse" />
              Живое расписание · {today.weekday}, {today.dayMonth}
            </p>
            <h2 id="now-title" className="display stretch-narrow mt-5 text-d-2">
              Сейчас в клубе
            </h2>
          </HomeReveal>

          <HomeReveal delay={0.1} className="mt-10 grid grid-cols-2 gap-6 border-y border-line/10 py-7">
            <div>
              <p className="digits text-[clamp(64px,9vw,112px)] leading-[0.8] text-chalk">{clock}</p>
              <p className="mt-3 text-[14px] text-dust">по Казани. {status.label}</p>
            </div>
            <div>
              <p className="digits text-[clamp(64px,9vw,112px)] leading-[0.8] text-chalk">{people}</p>
              <p className="mt-3 text-[14px] text-dust">
                {people > 0
                  ? `${plural(people, "человек", "человека", "человек")} в клубе прямо сейчас`
                  : dayOver
                    ? "в клубе уже никого, до утра"
                    : "в клубе пока пусто, ждём первых гостей"}
              </p>
            </div>
          </HomeReveal>

          <HomeReveal delay={0.15}>
            <p className="mt-8 max-w-md text-[15.5px] leading-relaxed text-dust">
              Запись открывается за {BOOKING.daysAhead} дней и закрывается за {BOOKING.closesBeforeMin} минут до начала. Мест нет? Встаньте в
              лист ожидания: освободившееся место достанется первому в очереди автоматически.
            </p>
            <ArrowLink href="/schedule" className="mt-7">
              Всё расписание на неделю
            </ArrowLink>
          </HomeReveal>
        </div>

        <div className="grid content-start gap-12">
          {!dayOver && (
            <HomeReveal>
              <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-line/10 pb-3">
                <h3 className="flex items-center gap-2.5 text-[15px] font-semibold uppercase tracking-[0.14em] text-chalk">
                  <BeatDot className="h-2.5 w-2.5 text-pulse" />
                  Идут сейчас
                </h3>
                <span className="digits text-[34px] leading-none text-pulse">{live.length}</span>
              </div>
              {live.length > 0 ? (
                <ul className="grid gap-2.5">
                  {live.map((s) => (
                    <li key={s.id}>
                      <SessionRow session={s} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-2xl border border-dashed border-line/15 px-5 py-6 text-[15px] text-dust">
                  {status.open ? "Сейчас пауза между занятиями. Ближайшее начнётся в " : "Клуб ещё закрыт. Первое занятие сегодня в "}
                  <span className="digits text-[22px] text-chalk">{next[0].time}</span>
                  {status.open ? ", а тренажёрный зал работает без перерыва." : "."}
                </p>
              )}
            </HomeReveal>
          )}

          {!dayOver && next.length > 0 && (
            <HomeReveal delay={0.1}>
              <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-line/10 pb-3">
                <h3 className="text-[15px] font-semibold uppercase tracking-[0.14em] text-chalk">Дальше сегодня</h3>
                <span className="text-[13.5px] text-dust">можно записаться</span>
              </div>
              <ul className="grid gap-2.5">
                {next.map((s) => (
                  <li key={s.id}>
                    <SessionRow session={s} />
                  </li>
                ))}
              </ul>
            </HomeReveal>
          )}

          {dayOver && (
            <HomeReveal>
              <div className="mb-6 rounded-card border border-line/10 bg-graphite px-6 py-7">
                <p className="display stretch-normal text-d-4">На сегодня всё</p>
                <p className="mt-2 max-w-lg text-[15.5px] text-dust">
                  Последнее занятие закончилось, в клубе остывают велосипеды. Утренние классы уже открыты для записи.
                </p>
              </div>
              {upcoming.length > 0 && (
                <>
                  <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-line/10 pb-3">
                    <h3 className="text-[15px] font-semibold uppercase tracking-[0.14em] text-chalk">
                      Ближайшие занятия <span className="text-dust">· {relativeDayLabel(upcoming[0].dateKey, now)}</span>
                    </h3>
                  </div>
                  <ul className="grid gap-2.5">
                    {upcoming.map((s) => (
                      <li key={s.id}>
                        <SessionRow session={s} showDate dateLabel={relativeDayLabel(s.dateKey, now)} />
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </HomeReveal>
          )}
        </div>
      </div>
    </section>
  );
}
