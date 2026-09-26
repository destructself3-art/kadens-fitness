import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";
import { capitalize, fillPct, qs, shortDay } from "@/components/admin/format";
import { td, th } from "@/components/admin/styles";
import { AdminTitle, KpiStrip, PctMeter, PeriodNav, TableScroll, ZoneTag } from "@/components/admin/ui";
import { COACHES } from "@/data/coaches";
import { requireAdmin } from "@/lib/auth";
import { BOOKING } from "@/lib/club";
import { plural } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getUpcoming, getWeekSessions } from "@/lib/schedule";
import { addDays, dateKeyOf, formatDay, isDateKey, weekDays, weekRangeLabel, weekStartOf } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Тренеры",
  description: "Нагрузка тренеров за неделю: занятия, замены, заполняемость групп, посещаемость и ближайшее занятие.",
};

const percent = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : null);
/** "12 часов", "1,5 часа": a fraction takes the genitive singular. */
const hoursLabel = (minutes: number) => {
  const h = Math.round((minutes / 60) * 10) / 10;
  const word = Number.isInteger(h) ? plural(h, "час", "часа", "часов") : "часа";
  return `${String(h).replace(".", ",")} ${word}`;
};
/** Russian first names of the team end in -а/-я for women: enough for past-tense verbs in this table. */
const isFemale = (name: string) => /[ая]$/.test(name.split(" ")[0]);

export default async function AdminCoachesPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const now = new Date();
  const today = dateKeyOf(now);
  const thisWeek = weekStartOf(today);
  const minWeek = addDays(thisWeek, -56);
  const maxWeek = addDays(thisWeek, 28);
  const asked = isDateKey(sp.week) ? weekStartOf(sp.week) : thisWeek;
  const week = asked < minWeek || asked > maxWeek ? thisWeek : asked;

  // One after the other: both may generate a week of sessions, and demo bookings must land before the counts.
  const sessions = await getWeekSessions(week, {}, now);
  const upcoming = await getUpcoming({}, 1000, BOOKING.daysAhead, now);
  const marks = await prisma.booking.groupBy({
    by: ["sessionId", "status"],
    where: { sessionId: { in: sessions.map((s) => s.id) }, status: { in: ["attended", "no_show"] } },
    _count: { _all: true },
  });
  const marksOf = new Map<string, { attended: number; noShow: number }>();
  for (const m of marks) {
    const v = marksOf.get(m.sessionId) ?? { attended: 0, noShow: 0 };
    if (m.status === "attended") v.attended += m._count._all;
    else v.noShow += m._count._all;
    marksOf.set(m.sessionId, v);
  }

  const days = weekDays(week);
  const rows = COACHES.map((c) => {
    const mine = sessions.filter((s) => s.coachSlug === c.slug);
    const led = mine.filter((s) => s.status === "scheduled");
    let attended = 0;
    let noShow = 0;
    for (const s of led) {
      const m = marksOf.get(s.id);
      attended += m?.attended ?? 0;
      noShow += m?.noShow ?? 0;
    }
    return {
      coach: c,
      led: led.length,
      cancelled: mine.length - led.length,
      asSubstitute: led.filter((s) => s.regularCoachSlug !== null).length,
      replaced: sessions.filter((s) => s.regularCoachSlug === c.slug && s.status === "scheduled").length,
      minutes: led.reduce((n, s) => n + s.durationMin, 0),
      fill: led.length ? Math.round(led.reduce((n, s) => n + fillPct(s.taken, s.capacity), 0) / led.length) : null,
      attended,
      noShow,
      attendance: percent(attended, attended + noShow),
      perDay: days.map((d) => led.filter((s) => s.dateKey === d).length),
      next: upcoming.find((s) => s.coachSlug === c.slug) ?? null,
    };
  }).sort((a, b) => b.minutes - a.minutes || b.led - a.led);

  const scheduled = sessions.filter((s) => s.status === "scheduled");
  const totalAttended = rows.reduce((n, r) => n + r.attended, 0);
  const totalNoShow = rows.reduce((n, r) => n + r.noShow, 0);
  const substitutions = scheduled.filter((s) => s.regularCoachSlug !== null).length;
  const clubFill = scheduled.length ? Math.round(scheduled.reduce((n, s) => n + fillPct(s.taken, s.capacity), 0) / scheduled.length) : 0;
  const attendance = percent(totalAttended, totalAttended + totalNoShow);
  const maxMinutes = Math.max(1, ...rows.map((r) => r.minutes));
  const maxPerDay = Math.max(1, ...rows.flatMap((r) => r.perDay));
  const href = (w: string | undefined) => `/admin/coaches${qs({ week: w === thisWeek ? undefined : w })}`;

  return (
    <>
      <AdminTitle
        eyebrow={week === thisWeek ? "Эта неделя" : week < thisWeek ? "Прошедшая неделя" : "Будущая неделя"}
        title={
          <>
            Тренеры
            <span className="block text-dust">{weekRangeLabel(week)}</span>
          </>
        }
        sub={
          <>
            Кто сколько ведёт, кого подменяли и как ходят к каждому. Поставить замену можно в{" "}
            <Link href={`/admin/schedule${qs({ week: week === thisWeek ? undefined : week })}`} className="link-underline text-chalk">
              расписании недели
            </Link>
            : кнопка «Изменить» у занятия.
          </>
        }
        aside={
          <PeriodNav
            label="Выбор недели"
            prev={addDays(week, -7) >= minWeek ? href(addDays(week, -7)) : null}
            next={addDays(week, 7) <= maxWeek ? href(addDays(week, 7)) : null}
            current={week === thisWeek ? null : href(undefined)}
            prevLabel="Неделя назад"
            nextLabel="Следующая"
            currentLabel="Эта неделя"
          />
        }
      />

      <KpiStrip
        className="mt-10"
        items={[
          { label: "Занятий", value: scheduled.length, note: `${hoursLabel(scheduled.reduce((n, s) => n + s.durationMin, 0))} в студиях` },
          { label: "Замен", value: substitutions, note: substitutions ? "видны на сайте с пометкой" : "все ведут по расписанию", hot: substitutions > 0 },
          { label: "Заполненность", value: `${clubFill}%`, note: "в среднем по группам" },
          {
            label: "Посещаемость",
            value: attendance === null ? "—" : `${attendance}%`,
            note: attendance === null ? "отметок ещё нет" : `пришли ${totalAttended} из ${totalAttended + totalNoShow} отмеченных`,
          },
          { label: "Отменено", value: sessions.length - scheduled.length, note: "занятий за неделю" },
        ]}
      />

      <TableScroll label="Нагрузка тренеров за неделю" className="mt-12">
        <table className="w-full min-w-[1180px] border-collapse text-[14.5px]">
          <caption className="sr-only">
            Нагрузка тренеров, {weekRangeLabel(week)}: занятия по дням, замены, заполняемость, посещаемость и ближайшее занятие
          </caption>
          <thead>
            <tr>
              <th scope="col" className={th}>
                Тренер
              </th>
              <th scope="col" className={th}>
                <span className="sr-only">Занятия по дням</span>
                <span className="flex gap-1" aria-hidden>
                  {days.map((d) => (
                    <span key={d} className={clsx("w-7 text-center", d === today && "text-pulse")}>
                      {formatDay(d).weekdayShort}
                    </span>
                  ))}
                </span>
              </th>
              <th scope="col" className={th}>
                Занятий
              </th>
              <th scope="col" className={th}>
                Замены
              </th>
              <th scope="col" className={th}>
                Заполненность
              </th>
              <th scope="col" className={th}>
                Посещаемость
              </th>
              <th scope="col" className={th}>
                Ближайшее
              </th>
              <th scope="col" className={th}>
                <span className="sr-only">Страница на сайте</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.coach.slug} className="border-t border-line/10 transition-colors hover:bg-chalk/[0.025]">
                <th scope="row" className={clsx(td, "text-left font-normal")}>
                  <span className="flex items-center gap-2">
                    <ZoneTag zone={r.coach.zone} />
                    <span className="whitespace-nowrap font-semibold text-chalk">{r.coach.name}</span>
                  </span>
                  <span className="mt-0.5 block max-w-[240px] text-[12.5px] leading-snug text-dust">{r.coach.role}</span>
                </th>
                <td className={td}>
                  <span className="flex gap-1">
                    {r.perDay.map((n, i) => {
                      const alpha = n ? 0.2 + (0.75 * n) / maxPerDay : 0.05;
                      return (
                        <span
                          key={days[i]}
                          title={`${capitalize(formatDay(days[i]).weekday)}: ${n} ${plural(n, "занятие", "занятия", "занятий")}`}
                          className={clsx(
                            "digits grid h-7 w-7 place-items-center rounded-md text-[15px] leading-none",
                            !n ? "text-dust/60" : alpha >= 0.55 ? "text-asphalt" : "text-chalk",
                            days[i] === today && "ring-1 ring-pulse",
                          )}
                          style={{ background: `rgb(var(--line) / ${alpha.toFixed(2)})` }}
                        >
                          <span className="sr-only">{formatDay(days[i]).weekdayShort}: </span>
                          {n || "·"}
                        </span>
                      );
                    })}
                  </span>
                </td>
                <td className={td}>
                  <span className="flex items-baseline gap-2">
                    <span className="digits text-[26px] leading-none text-chalk">{r.led}</span>
                    <span className="whitespace-nowrap text-[12.5px] text-dust">{hoursLabel(r.minutes)}</span>
                  </span>
                  <span className="mt-1.5 block h-[3px] w-[120px] overflow-hidden rounded-full bg-line/10" aria-hidden>
                    <span className="block h-full rounded-full bg-chalk/70" style={{ width: `${(r.minutes / maxMinutes) * 100}%` }} />
                  </span>
                  {r.cancelled > 0 && <span className="mt-1 block text-[12px] text-pulse">отменено {r.cancelled}</span>}
                </td>
                <td className={clsx(td, "text-[13.5px]")}>
                  {r.asSubstitute || r.replaced ? (
                    <>
                      {r.asSubstitute > 0 && (
                        <span className="block whitespace-nowrap text-chalk">
                          {isFemale(r.coach.name) ? "вышла" : "вышел"} на замену{" "}
                          <span className="digits text-[18px] leading-none">{r.asSubstitute}</span>
                        </span>
                      )}
                      {r.replaced > 0 && (
                        <span className="block whitespace-nowrap text-dust">
                          {isFemale(r.coach.name) ? "её" : "его"} подменяли{" "}
                          <span className="digits text-[18px] leading-none text-chalk">{r.replaced}</span>
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-dust">—</span>
                  )}
                </td>
                <td className={td}>
                  <PctMeter value={r.fill} />
                </td>
                <td className={td}>
                  <PctMeter
                    value={r.attendance}
                    note={r.attendance === null ? "нет отметок" : r.noShow ? `не пришли ${r.noShow}` : "без пропусков"}
                  />
                </td>
                <td className={td}>
                  {r.next ? (
                    <Link href={`/admin/sessions/${r.next.id}`} className="group block">
                      <span className="block text-[12px] text-dust">
                        {r.next.dateKey === today ? "сегодня" : r.next.dateKey === addDays(today, 1) ? "завтра" : shortDay(r.next.dateKey)}
                      </span>
                      <span className="flex items-baseline gap-2">
                        <span className="digits text-[22px] leading-none text-chalk">{r.next.time}</span>
                        <span className="whitespace-nowrap font-semibold text-chalk group-hover:underline">{r.next.classTitle}</span>
                      </span>
                      <span className="block whitespace-nowrap text-[12.5px] text-dust">«{r.next.studioName}»</span>
                    </Link>
                  ) : (
                    <span className="text-[13px] text-dust">в ближайшие {BOOKING.daysAhead} дней занятий нет</span>
                  )}
                </td>
                <td className={clsx(td, "text-right")}>
                  <Link
                    href={`/coaches/${r.coach.slug}`}
                    className="inline-flex min-h-11 items-center gap-1 whitespace-nowrap px-1 text-[13.5px] font-semibold text-dust hover:text-chalk"
                    aria-label={`${r.coach.name}: страница на сайте`}
                  >
                    <span className="link-underline">На сайте</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>

      <p className="mt-4 max-w-3xl text-[13px] leading-relaxed text-dust">
        Заполненность — средняя доля занятых мест в группах тренера. Посещаемость — сколько записанных пришли из тех, кого отметили на
        занятии: «пришёл» или «не пришёл». Цветная метка у имени — зона, в которой тренер обычно ведёт.
      </p>
    </>
  );
}
