"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, LayoutGrid, List } from "lucide-react";
import type { ClassSlug, CoachSlug, SpaceSlug } from "@/data/types";
import { SessionRow } from "./SessionRow";
import { ZoneLegend } from "@/components/ui/Cards";
import { EmptyState } from "@/components/ui/Kit";
import { plural } from "@/lib/format";
import type { SessionView } from "@/lib/session-types";
import { addDays, formatDay, weekRangeLabel } from "@/lib/time";
import { zoneMeta } from "@/lib/zones";
import {
  DAY_PARTS,
  DAY_PART_LABELS,
  EMPTY_FILTERS,
  boardQuery,
  dayPartOf,
  activeFilterCount,
  matchesFilters,
  type BoardState,
} from "./board-state";
import { DayTabs, dayTabId } from "./DayTabs";
import { FilterDeck, type Option } from "./FilterDeck";
import { ScheduleGrid } from "./ScheduleGrid";
import { useNow } from "./use-now";

type Props = {
  sessions: SessionView[];
  week: string;
  days: string[];
  today: string;
  /** The day the board opens on when the URL has none */
  defaultDay: string;
  currentWeek: string;
  prevWeek: string | null;
  nextWeek: string | null;
  /** Studios that host classes, in club order: {slug, name} */
  studioOrder: { slug: SpaceSlug; name: string }[];
  initial: BoardState;
  serverNow: number;
};

const PANEL_ID = "schedule-day-panel";

/** Recomputes "started" and "live" as the clock moves, so a page left open stays honest. */
function withClock(s: SessionView, now: number): SessionView {
  const started = Date.parse(s.startsAt) <= now;
  const live = started && Date.parse(s.endsAt) > now;
  return started === s.started && live === s.live ? s : { ...s, started, live };
}

function uniqueOptions<T extends string>(items: Array<{ value: T; label: string }>): Option<T>[] {
  const seen = new Map<T, string>();
  for (const i of items) if (!seen.has(i.value)) seen.set(i.value, i.label);
  return [...seen].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label, "ru"));
}

export function ScheduleBoard({ sessions: raw, week, days, today, defaultDay, currentWeek, prevWeek, nextWeek, studioOrder, initial, serverNow }: Props) {
  const [state, setState] = useState<BoardState>(initial);
  const now = useNow(serverNow);
  const sessions = useMemo(() => raw.map((s) => withClock(s, now)), [raw, now]);

  const update = useCallback((patch: Partial<BoardState>) => setState((s) => ({ ...s, ...patch })), []);
  const reset = useCallback(() => setState((s) => ({ ...s, ...EMPTY_FILTERS })), []);

  // Keep the URL in step with the board. history.replaceState is integrated with the Next router
  // (useSearchParams stays in sync) and, unlike router.replace, does not refetch the server page on every chip.
  useEffect(() => {
    const query = boardQuery(state, week === currentWeek ? null : week, defaultDay);
    const url = `${window.location.pathname}${query ? `?${query}` : ""}`;
    if (url !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(window.history.state, "", url);
  }, [state, week, currentWeek, defaultDay]);

  const studios = useMemo(() => {
    const present = new Set(sessions.map((s) => s.studioSlug));
    return studioOrder.filter((s) => present.has(s.slug)).map((s) => ({ value: s.slug, label: s.name }));
  }, [sessions, studioOrder]);
  const classes = useMemo(() => uniqueOptions<ClassSlug>(sessions.map((s) => ({ value: s.classSlug, label: s.classTitle }))), [sessions]);
  const coaches = useMemo(() => uniqueOptions<CoachSlug>(sessions.map((s) => ({ value: s.coachSlug, label: s.coachName }))), [sessions]);

  const filtered = useMemo(() => sessions.filter((s) => matchesFilters(s, state)), [sessions, state]);
  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const s of filtered) out[s.dateKey] = (out[s.dateKey] ?? 0) + 1;
    return out;
  }, [filtered]);

  const dayAll = useMemo(() => sessions.filter((s) => s.dateKey === state.day), [sessions, state.day]);
  const dayShown = useMemo(() => filtered.filter((s) => s.dateKey === state.day), [filtered, state.day]);
  const columns = useMemo(() => {
    const present = new Set(dayAll.map((s) => s.studioSlug));
    return studioOrder.filter((s) => present.has(s.slug) && (!state.studios.length || state.studios.includes(s.slug)));
  }, [dayAll, studioOrder, state.studios]);

  const activeCount = activeFilterCount(state);
  const active = activeCount > 0;
  const day = formatDay(state.day);
  const isToday = state.day === today;
  const weekQuery = (w: string) => {
    const q = boardQuery({ ...state, day: undefined }, w === currentWeek ? null : w);
    return q ? `/schedule?${q}` : "/schedule";
  };
  const highlightZone = state.highlight ? zoneMeta(state.highlight) : null;
  const followingWeek = addDays(currentWeek, 7);

  return (
    <section aria-labelledby="schedule-day-title" className="grid gap-5 sm:gap-6">
      {/* Weeks and view */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Недели расписания" className="flex items-center gap-2">
          {prevWeek ? (
            <Link href={weekQuery(prevWeek)} scroll={false} className="grid h-11 w-11 place-items-center rounded-full border border-line/15 text-chalk transition-colors hover:border-chalk" aria-label={`Предыдущая неделя, ${weekRangeLabel(prevWeek)}`}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <span className="grid h-11 w-11 place-items-center rounded-full border border-line/10 text-dust/40" aria-hidden>
              <ArrowLeft className="h-4 w-4" />
            </span>
          )}
          <Link href={weekQuery(currentWeek)} scroll={false} className="chip min-h-[44px] px-4 text-[14px]" data-active={week === currentWeek} aria-current={week === currentWeek ? "page" : undefined}>
            Эта неделя
          </Link>
          <Link
            href={weekQuery(followingWeek)}
            scroll={false}
            className="chip min-h-[44px] px-4 text-[14px]"
            data-active={week === followingWeek}
            aria-current={week === followingWeek ? "page" : undefined}
          >
            Следующая
          </Link>
          {nextWeek ? (
            <Link href={weekQuery(nextWeek)} scroll={false} className="grid h-11 w-11 place-items-center rounded-full border border-line/15 text-chalk transition-colors hover:border-chalk" aria-label={`Следующая неделя, ${weekRangeLabel(nextWeek)}`}>
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <span className="grid h-11 w-11 place-items-center rounded-full border border-line/10 text-dust/40" aria-hidden>
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
          <span className="ml-2 hidden text-[14px] text-dust md:inline">{weekRangeLabel(week)}</span>
        </nav>

        <div role="group" aria-label="Вид расписания" className="flex rounded-full border border-line/15 p-1">
          {(
            [
              ["list", "Список", List],
              ["grid", "Сетка", LayoutGrid],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              aria-pressed={state.view === value}
              onClick={() => update({ view: value })}
              className={clsx(
                "inline-flex min-h-[40px] items-center gap-2 rounded-full px-4 text-[14px] font-medium transition-colors",
                state.view === value ? "bg-chalk text-asphalt" : "text-dust hover:text-chalk",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </div>

      <DayTabs days={days} value={state.day} onChange={(d) => update({ day: d })} counts={counts} today={today} panelId={PANEL_ID} />

      <FilterDeck state={state} onChange={update} onReset={reset} studios={studios} classes={classes} coaches={coaches} activeCount={activeCount} />

      <div id={PANEL_ID} role="tabpanel" aria-labelledby={dayTabId(state.day)} className="grid gap-6 pt-4">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h2 id="schedule-day-title" className="display text-d-3 stretch-normal">
            {isToday ? "Сегодня" : day.weekday}
            <span className="ml-3 align-middle font-sans text-[15px] font-medium normal-case tracking-normal text-dust" style={{ fontVariationSettings: "normal" }}>
              {day.dayMonth}
            </span>
          </h2>
          <p role="status" aria-live="polite" className="text-[14px] text-dust">
            {active ? (
              <>
                Подходит <span className="digits text-[20px] text-chalk">{dayShown.length}</span> из {dayAll.length}{" "}
                {plural(dayAll.length, "занятия", "занятий", "занятий")}
              </>
            ) : (
              <>
                <span className="digits text-[20px] text-chalk">{dayAll.length}</span> {plural(dayAll.length, "занятие", "занятия", "занятий")} в этот день
              </>
            )}
            {highlightZone && (
              <>
                {" · "}
                подсвечена зона <span className="font-semibold" style={{ color: highlightZone.color }}>Z{highlightZone.id}</span>
              </>
            )}
          </p>
        </div>

        {dayShown.length === 0 ? (
          <EmptyState
            title={dayAll.length === 0 ? "В этот день занятий нет" : "Под фильтры ничего не нашлось"}
            text={
              dayAll.length === 0
                ? "Загляните в соседний день: групповые классы идут каждый день недели."
                : "Попробуйте другое время или студию. Зона и тренер часто сужают выбор сильнее, чем кажется."
            }
            action={
              active ? (
                <button type="button" onClick={reset} className="btn-ghost mt-2">
                  Сбросить фильтры
                </button>
              ) : undefined
            }
          />
        ) : state.view === "grid" ? (
          <ScheduleGrid columns={columns} sessions={dayShown} highlight={state.highlight} isToday={isToday} now={now} />
        ) : (
          <div className="grid gap-10 md:gap-12">
            {DAY_PARTS.map((part) => {
              const items = dayShown.filter((s) => dayPartOf(s.time) === part);
              if (!items.length) return null;
              return (
                <section key={part} aria-labelledby={`part-${part}`} className="grid gap-4 md:grid-cols-[200px_minmax(0,1fr)] md:gap-8">
                  <header className="flex items-baseline gap-3 md:sticky md:top-28 md:block md:self-start">
                    <h3 id={`part-${part}`} className="display text-d-4 stretch-wide">
                      {DAY_PART_LABELS[part].short}
                    </h3>
                    <p className="text-[13px] text-dust md:mt-2">
                      {DAY_PART_LABELS[part].range} · <span className="digits text-[17px] text-chalk">{items.length}</span>
                    </p>
                  </header>
                  <ul className="grid gap-2">
                    {items.map((s) => {
                      const lit = state.highlight !== null && s.zone === state.highlight;
                      const dim = state.highlight !== null && !lit;
                      // On phones the row titles step down a size so "Функциональный тренинг" stays inside the card (the Z badge keeps its size)
                      return (
                        <li
                          key={s.id}
                          className={clsx("rounded-2xl transition-opacity duration-300 max-sm:[&_.font-display:not(.rounded-md)]:text-[18px]", dim && "opacity-35 hover:opacity-100 focus-within:opacity-100")}
                          style={lit ? { boxShadow: `0 0 0 2px ${zoneMeta(s.zone).color}, 0 18px 40px -24px ${zoneMeta(s.zone).color}` } : undefined}
                        >
                          <SessionRow session={s} />
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        )}

        <ZoneLegend className="border-t border-line/10 pt-5" />
      </div>
    </section>
  );
}
