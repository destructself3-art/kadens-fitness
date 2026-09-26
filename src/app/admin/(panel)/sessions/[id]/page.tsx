import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";
import { capitalize, SOURCE_LABELS, stamp } from "@/components/admin/format";
import { AddBookingForm, MarkAllAttended, RosterActions, SessionControls } from "@/components/admin/forms";
import { controlsFor } from "@/components/admin/session-props";
import { markingOpensAt } from "@/components/admin/rules";
import { td, th } from "@/components/admin/styles";
import { AdminTitle, BlockTitle, BookingStatusPill, KpiStrip, SessionState, TableScroll, ZoneTag } from "@/components/admin/ui";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { getRoster } from "@/lib/booking";
import { formatPhone, plural } from "@/lib/format";
import { getSessionView } from "@/lib/schedule";
import type { BookingStatus } from "@/lib/session-types";
import { dateKeyOf, relativeDayLabel, timeOf, weekStartOf } from "@/lib/time";
import { zoneMeta } from "@/lib/zones";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const session = (await isAdmin()) ? await getSessionView(id) : null;
  return {
    title: session ? `${session.classTitle}, ${session.time} · группа` : "Группа занятия",
    description: "Список группы: места, телефоны, отметки о приходе, лист ожидания и запись с ресепшена.",
  };
}

type Row = Awaited<ReturnType<typeof getRoster>>[number];

export default async function AdminSessionPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const now = new Date();
  const session = await getSessionView(id, now);
  if (!session) notFound();
  const roster = await getRoster(id);

  const inClass = roster.filter((b) => b.seat !== null && b.status !== "cancelled");
  const waiting = roster.filter((b) => b.status === "waitlist").sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const cancelled = roster.filter((b) => b.status === "cancelled");
  const count = (s: BookingStatus) => roster.filter((b) => b.status === s).length;
  const booked = count("booked");
  const z = zoneMeta(session.zone);
  const isCancelled = session.status === "cancelled";
  const toCall = inClass.filter((b) => b.status === "booked").length + waiting.length;
  const marksFrom = markingOpensAt(session.startsAt);
  const canMark = !isCancelled && now >= marksFrom;

  const groups: { key: string; title: string; rows: Row[]; empty: string }[] = [
    { key: "class", title: `В группе · ${session.taken} из ${session.capacity}`, rows: inClass, empty: "Пока никто не записан." },
    { key: "wait", title: `Лист ожидания · ${waiting.length}`, rows: waiting, empty: "Никто не ждёт места." },
    { key: "cancel", title: `Отменили · ${cancelled.length}`, rows: cancelled, empty: "" },
  ];

  return (
    <>
      <nav aria-label="Навигация по пульту" className="mb-6 flex flex-wrap gap-x-6 text-[14px] text-dust">
        <Link href={`/admin?date=${session.dateKey}`} className="inline-flex min-h-11 items-center gap-1 hover:text-chalk">
          <span aria-hidden>←</span>
          <span className="link-underline">День на таймлайне</span>
        </Link>
        <Link
          href={`/admin/schedule?week=${weekStartOf(session.dateKey)}#day-${session.dateKey}`}
          className="inline-flex min-h-11 items-center hover:text-chalk"
        >
          <span className="link-underline">Расписание недели</span>
        </Link>
        <Link href={`/schedule/${session.id}`} className="inline-flex min-h-11 items-center gap-1 hover:text-chalk">
          <span className="link-underline">Страница занятия на сайте</span>
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </nav>

      <AdminTitle
        eyebrow={`${capitalize(relativeDayLabel(session.dateKey, now))} · ${session.time}–${session.endTime} · ${session.durationMin} мин`}
        title={<span className={clsx(isCancelled && "text-dust line-through decoration-pulse decoration-[6px]")}>{session.classTitle}</span>}
        sub={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="inline-flex items-center gap-2 text-chalk">
              <ZoneTag zone={session.zone} /> {z.name}
            </span>
            <span>«{session.studioName}»</span>
            <span>
              ведёт <span className="text-chalk">{session.coachName}</span>
              {session.regularCoachName && <> на замене, по расписанию {session.regularCoachName}</>}
            </span>
            <SessionState session={session} />
          </span>
        }
      />

      {isCancelled && toCall > 0 && (
        <p role="note" className="mt-8 rounded-card border border-pulse/50 bg-pulse/10 px-5 py-4 text-[15px] text-chalk">
          Занятие отменено, а в списке ещё {toCall} {plural(toCall, "человек", "человека", "человек")} с активной записью. Позвоните им: телефоны ниже.
          Записи остаются на месте, если вернуть занятие в расписание.
        </p>
      )}

      <KpiStrip
        className="mt-10"
        items={[
          { label: "Мест занято", value: `${session.taken}/${session.capacity}`, note: session.left ? `свободно ${session.left}` : "мест нет", hot: session.left === 0 },
          { label: "Лист ожидания", value: waiting.length, note: waiting.length ? "первый получит освободившееся место" : "никто не ждёт" },
          {
            label: "Пришли",
            value: count("attended"),
            note: isCancelled ? "занятие отменено" : canMark
                ? `ещё без отметки ${booked}`
                : `отмечаем с ${timeOf(marksFrom)}${session.dateKey === dateKeyOf(now) ? "" : " в день занятия"}`,
          },
          { label: "Не пришли", value: count("no_show") },
          { label: "Отменили", value: cancelled.length },
        ]}
      />

      <div className="mt-12 grid gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-labelledby="roster-title" className="min-w-0">
          <BlockTitle
            id="roster-title"
            aside={session.started && !isCancelled ? <MarkAllAttended sessionId={session.id} count={booked} /> : undefined}
          >
            Группа
          </BlockTitle>
          <TableScroll label="Список группы">
            <table className="w-full min-w-[860px] border-collapse text-[14.5px]">
              <thead>
                <tr>
                  <th scope="col" className={th}>
                    Место
                  </th>
                  <th scope="col" className={th}>
                    Гость
                  </th>
                  <th scope="col" className={th}>
                    Телефон
                  </th>
                  <th scope="col" className={th}>
                    Статус
                  </th>
                  <th scope="col" className={th}>
                    Действия
                  </th>
                </tr>
              </thead>
              {groups
                .filter((g) => g.rows.length || g.empty)
                .map((g) => (
                  <tbody key={g.key}>
                    <tr className="border-t border-line/10 bg-asphalt/40">
                      <th scope="colgroup" colSpan={5} className="px-4 py-2.5 text-left text-[12.5px] font-semibold uppercase tracking-[0.12em] text-dust">
                        {g.title}
                      </th>
                    </tr>
                    {g.rows.length === 0 ? (
                      <tr className="border-t border-line/10">
                        <td colSpan={5} className={clsx(td, "text-dust")}>
                          {g.empty}
                        </td>
                      </tr>
                    ) : (
                      g.rows.map((b) => {
                        const position = b.status === "waitlist" ? waiting.indexOf(b) + 1 : null;
                        return (
                          <tr key={b.id} className={clsx("border-t border-line/10", b.status === "cancelled" && "text-dust")}>
                            <td className={clsx(td, "w-[84px]")}>
                              {b.seat !== null && b.status !== "cancelled" ? (
                                <span className="digits text-[26px] leading-none text-chalk">{String(b.seat).padStart(2, "0")}</span>
                              ) : position ? (
                                <span className="digits text-[20px] leading-none text-dust">ож.{position}</span>
                              ) : (
                                <span className="text-dust">—</span>
                              )}
                            </td>
                            <td className={td}>
                              <span className="block font-semibold text-chalk">{b.name}</span>
                              <span className="mt-0.5 block whitespace-nowrap text-[12.5px] text-dust">
                                <span className="digits text-[15px] leading-none">{b.code}</span> · {SOURCE_LABELS[b.source] ?? b.source},{" "}
                                {stamp(b.createdAt)}
                              </span>
                            </td>
                            <td className={clsx(td, "whitespace-nowrap")}>
                              <a href={`tel:+${b.phone}`} className="link-underline tabular text-chalk">
                                {formatPhone(b.phone)}
                              </a>
                            </td>
                            <td className={td}>
                              <BookingStatusPill status={b.status as BookingStatus} />
                            </td>
                            <td className={clsx(td, "w-px whitespace-nowrap")}>
                              <RosterActions id={b.id} status={b.status as BookingStatus} name={b.name} canMark={canMark} />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                ))}
            </table>
          </TableScroll>
        </section>

        <aside className="grid content-start gap-6" aria-label="Управление занятием">
          <section aria-labelledby="add-title" className="rounded-card border border-line/10 bg-graphite p-6">
            <h2 id="add-title" className="display stretch-normal text-[22px] leading-none">
              Записать гостя
            </h2>
            {isCancelled ? (
              <p className="mt-4 text-[14.5px] text-dust">Занятие отменено: записать на него нельзя. Сначала верните его в расписание.</p>
            ) : (
              <>
                <p className="mt-3 text-[13.5px] leading-snug text-dust">
                  С ресепшена или по телефону. Правила те же, что на сайте: один номер записывается один раз, без мест человек
                  встаёт в лист ожидания.
                </p>
                <div className="mt-5">
                  <AddBookingForm sessionId={session.id} full={session.left === 0} />
                </div>
              </>
            )}
          </section>
          <section aria-labelledby="ctl-title" className="rounded-card border border-line/10 bg-graphite p-6">
            <h2 id="ctl-title" className="display stretch-normal mb-5 text-[22px] leading-none">
              Тренер и отмена
            </h2>
            <SessionControls {...controlsFor(session)} />
          </section>
        </aside>
      </div>
    </>
  );
}
