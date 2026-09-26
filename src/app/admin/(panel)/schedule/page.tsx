import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { EditableRow } from "@/components/admin/EditableRow";
import { capitalize, fillPct, qs } from "@/components/admin/format";
import { SessionControls } from "@/components/admin/forms";
import { controlsFor } from "@/components/admin/session-props";
import { miniBtn, td, th } from "@/components/admin/styles";
import { AdminTitle, FillMeter, FilterLink, KpiStrip, PeriodNav, SessionState, TableScroll, ZoneTag } from "@/components/admin/ui";
import { SPACES } from "@/data/spaces";
import { requireAdmin } from "@/lib/auth";
import { plural } from "@/lib/format";
import { getWeekSessions } from "@/lib/schedule";
import type { SessionView } from "@/lib/session-types";
import { addDays, dateKeyOf, formatDay, isDateKey, weekDays, weekRangeLabel, weekStartOf } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Расписание недели",
  description: "Все занятия недели по дням: заполняемость, лист ожидания, замены тренеров и отмены.",
};

const STUDIOS = SPACES.filter((s) => s.capacity);
const COLS = 7;

type Search = { week?: string; studio?: string; view?: string };

export default async function AdminSchedulePage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin();
  const sp = await searchParams;
  const now = new Date();
  const today = dateKeyOf(now);
  const thisWeek = weekStartOf(today);
  const minWeek = addDays(thisWeek, -56);
  const maxWeek = addDays(thisWeek, 28);
  const asked = isDateKey(sp.week) ? weekStartOf(sp.week) : thisWeek;
  const week = asked < minWeek || asked > maxWeek ? thisWeek : asked;
  const studio = STUDIOS.find((s) => s.slug === sp.studio)?.slug;
  const onlyChanges = sp.view === "changes";

  const all = await getWeekSessions(week, studio ? { studioSlug: studio } : {}, now);
  const isChange = (s: SessionView) => s.status === "cancelled" || s.regularCoachSlug !== null;
  const sessions = onlyChanges ? all.filter(isChange) : all;
  const scheduled = all.filter((s) => s.status === "scheduled");
  const taken = scheduled.reduce((n, s) => n + s.taken, 0);
  const capacity = scheduled.reduce((n, s) => n + s.capacity, 0);
  const changes = all.filter(isChange).length;

  const href = (p: Partial<Search>) =>
    `/admin/schedule${qs({ week: week === thisWeek ? undefined : week, studio, view: onlyChanges ? "changes" : undefined, ...p })}`;
  const days = weekDays(week).map((key) => ({ key, items: sessions.filter((s) => s.dateKey === key) }));

  return (
    <>
      <AdminTitle
        eyebrow={week === thisWeek ? "Эта неделя" : week < thisWeek ? "Прошедшая неделя" : "Будущая неделя"}
        title={
          <>
            Расписание
            <span className="block text-dust">{weekRangeLabel(week)}</span>
          </>
        }
        sub="Замена тренера и отмена сразу появляются на сайте. Отмена не удаляет записи: если вернуть занятие, группа останется на месте."
        aside={
          <PeriodNav
            label="Выбор недели"
            prev={addDays(week, -7) >= minWeek ? href({ week: addDays(week, -7) }) : null}
            next={addDays(week, 7) <= maxWeek ? href({ week: addDays(week, 7) }) : null}
            current={week === thisWeek ? null : href({ week: undefined })}
            prevLabel="Неделя назад"
            nextLabel="Следующая"
            currentLabel="Эта неделя"
          />
        }
      />

      <KpiStrip
        className="mt-10"
        items={[
          { label: "Занятий", value: scheduled.length, note: studio ? `в «${STUDIOS.find((s) => s.slug === studio)?.name}»` : "во всех студиях" },
          { label: "Заполнено", value: `${fillPct(taken, capacity)}%`, note: `${taken} из ${capacity} мест` },
          { label: "В листе ожидания", value: scheduled.reduce((n, s) => n + s.waitlist, 0), note: "ждут, пока освободится место" },
          {
            label: "Изменения",
            value: changes,
            note: `замен ${all.filter((s) => s.regularCoachSlug).length}, отмен ${all.length - scheduled.length}`,
            hot: changes > 0,
          },
        ]}
      />

      <div className="mt-10 grid gap-4">
        <nav aria-label="Студия" className="-mx-1 overflow-x-auto px-1">
          <div className="flex w-max gap-1.5">
            <FilterLink href={href({ studio: undefined })} active={!studio}>
              Все студии
            </FilterLink>
            {STUDIOS.map((s) => (
              <FilterLink key={s.slug} href={href({ studio: s.slug })} active={studio === s.slug}>
                «{s.name}»
              </FilterLink>
            ))}
          </div>
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Что показать" className="flex flex-wrap gap-1.5">
            <FilterLink href={href({ view: undefined })} active={!onlyChanges}>
              Все занятия
            </FilterLink>
            <FilterLink href={href({ view: "changes" })} active={onlyChanges} count={changes}>
              Только замены и отмены
            </FilterLink>
          </nav>
          <nav aria-label="Дни недели" className="-mx-1 overflow-x-auto px-1">
            <ul className="flex w-max gap-1">
              {days.map((d) => {
                const f = formatDay(d.key);
                return (
                  <li key={d.key}>
                    <a
                      href={`#day-${d.key}`}
                      className={clsx(
                        "flex min-h-11 min-w-11 flex-col items-center justify-center rounded-xl px-2 text-[11.5px] uppercase text-dust transition-colors hover:bg-chalk/5 hover:text-chalk",
                        d.key === today && "text-pulse",
                      )}
                    >
                      {f.weekdayShort}
                      <span className="digits text-[18px] leading-none text-chalk">{f.day}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-14">
        {days.map((d) => {
          const f = formatDay(d.key);
          const open = d.items.filter((s) => s.status === "scheduled");
          const dayTaken = open.reduce((n, s) => n + s.taken, 0);
          const dayCap = open.reduce((n, s) => n + s.capacity, 0);
          return (
            <section key={d.key} id={`day-${d.key}`} aria-labelledby={`day-${d.key}-title`} className="min-w-0 scroll-mt-40">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                <h2 id={`day-${d.key}-title`} className="display stretch-normal text-[clamp(1.5rem,2.6vw,2.2rem)] leading-none">
                  {capitalize(f.weekday)}, {f.dayMonth}
                  {d.key === today && <span className="ml-3 align-middle text-[14px] text-pulse">сегодня</span>}
                </h2>
                <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13.5px] text-dust">
                  <span>
                    {open.length} {plural(open.length, "занятие", "занятия", "занятий")} · заполнено {fillPct(dayTaken, dayCap)}%
                  </span>
                  <Link href={`/admin?date=${d.key}`} className="inline-flex min-h-11 items-center font-semibold text-chalk">
                    <span className="link-underline">Таймлайн дня</span>
                  </Link>
                </p>
              </div>
              {d.items.length ? (
                <TableScroll label={`Занятия: ${f.long}`}>
                  <table className="w-full min-w-[1040px] border-collapse text-[14.5px]">
                    <thead>
                      <tr>
                        <th scope="col" className={th}>
                          Время
                        </th>
                        <th scope="col" className={th}>
                          Занятие
                        </th>
                        <th scope="col" className={th}>
                          Студия
                        </th>
                        <th scope="col" className={th}>
                          Тренер
                        </th>
                        <th scope="col" className={th}>
                          Заполнено
                        </th>
                        <th scope="col" className={th}>
                          Статус
                        </th>
                        <th scope="col" className={clsx(th, "text-right")}>
                          <span className="sr-only">Действия</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.items.map((s) => (
                        <EditableRow
                          key={s.id}
                          colSpan={COLS}
                          label={`${s.classTitle}, ${s.time}`}
                          muted={s.started && !s.live}
                          actions={
                            <Link href={`/admin/sessions/${s.id}`} className={miniBtn}>
                              Группа
                            </Link>
                          }
                          panel={<SessionControls {...controlsFor(s)} className="max-w-4xl md:grid-cols-2" />}
                        >
                          <td className={clsx(td, "whitespace-nowrap")}>
                            <span className="digits text-[24px] leading-none text-chalk">{s.time}</span>
                            <span className="digits ml-1 text-[16px] leading-none text-dust">–{s.endTime}</span>
                          </td>
                          <td className={td}>
                            <span className="flex items-center gap-2">
                              <ZoneTag zone={s.zone} />
                              <span className={clsx("font-semibold text-chalk", s.status === "cancelled" && "text-dust line-through")}>{s.classTitle}</span>
                            </span>
                            {s.status === "cancelled" && s.note && <span className="mt-1 block max-w-[280px] text-[12.5px] text-dust">{s.note}</span>}
                          </td>
                          <td className={clsx(td, "whitespace-nowrap")}>«{s.studioName}»</td>
                          <td className={td}>
                            <span className="block whitespace-nowrap">{s.coachName}</span>
                            {s.regularCoachName && (
                              <span className="mt-0.5 block whitespace-nowrap text-[12.5px] text-dust">
                                <span className="font-semibold text-chalk">замена</span> · в расписании {s.regularCoachName}
                              </span>
                            )}
                          </td>
                          <td className={td}>
                            {s.status === "cancelled" ? <span className="text-dust">—</span> : <FillMeter taken={s.taken} capacity={s.capacity} waitlist={s.waitlist} />}
                          </td>
                          <td className={td}>
                            <SessionState session={s} />
                          </td>
                        </EditableRow>
                      ))}
                    </tbody>
                  </table>
                </TableScroll>
              ) : (
                <p className="rounded-card border border-dashed border-line/20 px-6 py-8 text-[15px] text-dust">
                  {onlyChanges ? "В этот день всё идёт по расписанию." : "В этот день занятий нет."}
                </p>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
