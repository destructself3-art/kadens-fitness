import type { Metadata } from "next";
import Link from "next/link";
import { DayBoard } from "@/components/admin/DayBoard";
import { ago, capitalize, fillPct } from "@/components/admin/format";
import { miniBtn, miniField } from "@/components/admin/styles";
import { AdminTitle, BlockTitle, KpiStrip, LeadStatusPill, PeriodNav, SessionLine, type KpiItem } from "@/components/admin/ui";
import { BeatDot } from "@/components/pulse/Beat";
import { SPACES } from "@/data/spaces";
import { requireAdmin } from "@/lib/auth";
import { ensureDemoLeads } from "@/lib/demo";
import { plural } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getDaySessions } from "@/lib/schedule";
import { LEAD_KIND_LABELS, type LeadKind } from "@/lib/session-types";
import { addDays, clubParts, dateKeyOf, formatDay, hhmmToMinutes, hoursFor, isDateKey, minutesToHHMM } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Сегодня",
  description: "День клуба по студиям: занятия, заполняемость, кто пришёл, лист ожидания и новые заявки.",
};

const STUDIOS = SPACES.filter((s) => s.capacity).map((s) => ({ slug: s.slug, name: s.name, label: s.label }));
/** How far the panel lets you page: two months back, four weeks ahead. */
const DAYS_BACK = 56;
const DAYS_AHEAD = 28;

export default async function AdminTodayPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  await requireAdmin();
  const { date: requested } = await searchParams;
  const now = new Date();
  const today = dateKeyOf(now);
  const min = addDays(today, -DAYS_BACK);
  const max = addDays(today, DAYS_AHEAD);
  const date = isDateKey(requested) && requested >= min && requested <= max ? requested : today;

  await ensureDemoLeads(now);
  const sessions = await getDaySessions(date, {}, now);
  const [marks, newLeads, leadsDay, latestLeads] = await Promise.all([
    prisma.booking.groupBy({
      by: ["status"],
      where: { sessionId: { in: sessions.map((s) => s.id) }, status: { in: ["attended", "no_show"] } },
      _count: { _all: true },
    }),
    prisma.lead.count({ where: { status: "new" } }),
    prisma.lead.count({ where: { createdAt: { gte: new Date(now.getTime() - 24 * 3600_000), lte: now } } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const scheduled = sessions.filter((s) => s.status === "scheduled");
  const cancelled = sessions.length - scheduled.length;
  const taken = scheduled.reduce((sum, s) => sum + s.taken, 0);
  const capacity = scheduled.reduce((sum, s) => sum + s.capacity, 0);
  const waitlist = scheduled.reduce((sum, s) => sum + s.waitlist, 0);
  const waitingClasses = scheduled.filter((s) => s.waitlist > 0).length;
  const attended = marks.find((m) => m.status === "attended")?._count._all ?? 0;
  const noShow = marks.find((m) => m.status === "no_show")?._count._all ?? 0;
  const live = scheduled.filter((s) => s.live);
  const done = scheduled.filter((s) => s.started && !s.live).length;
  const isToday = date === today;
  const isPast = date < today;
  const isFuture = date > today;
  const nowMinutes = clubParts(now).minutes;

  const kpis: KpiItem[] = [
    {
      label: "Занятий",
      value: scheduled.length,
      note: [
        isToday ? `прошло ${done}, идёт ${live.length}` : isPast ? "день закончился" : "по расписанию",
        cancelled ? `отменено ${cancelled}` : "",
      ]
        .filter(Boolean)
        .join(" · "),
    },
    { label: "Записано", value: taken, note: `занято ${fillPct(taken, capacity)}% из ${capacity} мест` },
    {
      label: "Пришли",
      value: attended,
      note: isFuture ? "отметки появятся после начала занятий" : noShow ? `не пришли ${noShow}` : "пропусков нет",
    },
    {
      label: "В листе ожидания",
      value: waitlist,
      note: waitlist ? `на ${waitingClasses} ${plural(waitingClasses, "занятии", "занятиях", "занятиях")}` : "никто не ждёт",
    },
    { label: "Новых заявок", value: newLeads, note: `${leadsDay} за сутки`, hot: newLeads > 0 },
  ];

  const hours = hoursFor(date);
  const starts = sessions.map((s) => hhmmToMinutes(s.time));
  const ends = sessions.map((s) => hhmmToMinutes(s.time) + s.durationMin);
  const from = Math.floor(Math.min(hours.open, ...starts) / 60) * 60;
  const to = Math.ceil(Math.max(hours.close, ...ends) / 60) * 60;

  const day = formatDay(date);
  const heading =
    date === today ? "Сегодня" : date === addDays(today, 1) ? "Завтра" : date === addDays(today, -1) ? "Вчера" : capitalize(day.weekday);
  const upcoming = isPast ? [] : scheduled.filter((s) => !s.started).slice(0, 6);
  const fullest = [...scheduled].sort((a, b) => b.taken / b.capacity - a.taken / a.capacity).slice(0, 5);

  return (
    <>
      <AdminTitle
        eyebrow={`${capitalize(day.weekday)} · клуб открыт ${minutesToHHMM(hours.open)}–${minutesToHHMM(hours.close)}`}
        title={
          <>
            {heading}
            <span className="block text-dust">{day.dayMonth}</span>
          </>
        }
        aside={
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <PeriodNav
              label="Выбор дня"
              prev={addDays(date, -1) >= min ? `/admin?date=${addDays(date, -1)}` : null}
              next={addDays(date, 1) <= max ? `/admin?date=${addDays(date, 1)}` : null}
              current={isToday ? null : "/admin"}
              prevLabel="День назад"
              nextLabel="Следующий"
              currentLabel="Сегодня"
            />
            <form action="/admin" className="flex items-center gap-2">
              <label htmlFor="board-date" className="sr-only">
                Перейти к дате
              </label>
              <input id="board-date" type="date" name="date" defaultValue={date} min={min} max={max} className={`${miniField} w-[170px]`} />
              <button type="submit" className={miniBtn}>
                Показать
              </button>
            </form>
          </div>
        }
      />

      <KpiStrip items={kpis} className="mt-10" />

      <section aria-labelledby="board-title" className="mt-14">
        <BlockTitle
          id="board-title"
          aside={
            <p className="max-w-xl text-[13px] leading-snug text-dust">
              Высота блока — длительность, полоса снизу — заполненность, цветная грань — пульсовая зона. Нажмите на занятие,
              чтобы открыть список группы.
            </p>
          }
        >
          Студии и часы
        </BlockTitle>
        {sessions.length ? (
          <DayBoard sessions={sessions} studios={STUDIOS} from={from} to={to} nowMinutes={isToday ? nowMinutes : null} />
        ) : (
          <p className="rounded-card border border-dashed border-line/20 px-6 py-10 text-dust">На этот день занятий нет.</p>
        )}
      </section>

      <div className="mt-16 grid gap-x-10 gap-y-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.85fr)]">
        <section aria-labelledby="live-title">
          <BlockTitle id="live-title">
            <span className="inline-flex items-center gap-3">
              {isToday && live.length > 0 && <BeatDot className="h-2.5 w-2.5 text-pulse" />}
              Идёт сейчас
            </span>
          </BlockTitle>
          {live.length ? (
            <div className="border-t border-line/10">
              {live.map((s) => (
                <SessionLine key={s.id} session={s} />
              ))}
            </div>
          ) : (
            <p className="border-t border-line/10 pt-4 text-[15px] text-dust">
              {isToday
                ? nowMinutes < hoursFor(today).open
                  ? `Клуб ещё закрыт, откроемся в ${minutesToHHMM(hoursFor(today).open)}.`
                  : nowMinutes >= hoursFor(today).close
                    ? "Клуб уже закрыт, занятия на сегодня закончились."
                    : "Сейчас в студиях пауза между занятиями."
                : isPast
                  ? `День закончился: пришли ${attended} из ${attended + noShow} отмеченных.`
                  : "День ещё не начался."}
            </p>
          )}
        </section>

        <section aria-labelledby="next-title">
          <BlockTitle id="next-title">{isPast ? "Самые полные" : "Дальше"}</BlockTitle>
          {(isPast ? fullest : upcoming).length ? (
            <div className="border-t border-line/10">
              {(isPast ? fullest : upcoming).map((s) => (
                <SessionLine key={s.id} session={s} />
              ))}
            </div>
          ) : (
            <p className="border-t border-line/10 pt-4 text-[15px] text-dust">{isToday ? "На сегодня занятий больше нет." : "Занятий нет."}</p>
          )}
        </section>

        <section aria-labelledby="leads-title">
          <BlockTitle
            id="leads-title"
            aside={
              <Link href="/admin/leads" className="inline-flex min-h-11 items-center text-[14px] font-semibold text-chalk">
                <span className="link-underline">Все заявки</span>
              </Link>
            }
          >
            Заявки
          </BlockTitle>
          {latestLeads.length ? (
            <ul className="border-t border-line/10">
              {latestLeads.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/admin/leads#lead-${l.id}`}
                    className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 border-b border-line/10 py-3.5 transition-colors hover:bg-chalk/[0.03]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[15.5px] font-semibold group-hover:underline">{l.name}</span>
                      <span className="block truncate text-[13px] text-dust">
                        {LEAD_KIND_LABELS[l.kind as LeadKind] ?? l.kind} · {ago(l.createdAt, now)}
                      </span>
                    </span>
                    <LeadStatusPill status={l.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="border-t border-line/10 pt-4 text-[15px] text-dust">Заявок пока нет: они появятся здесь, как только кто-то оставит их на сайте.</p>
          )}
        </section>
      </div>
    </>
  );
}
