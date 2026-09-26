"use client";

import { useRef, type KeyboardEvent } from "react";
import clsx from "clsx";
import { plural } from "@/lib/format";
import { formatDay } from "@/lib/time";

type Props = {
  days: string[];
  value: string;
  onChange: (day: string) => void;
  /** Classes per day after the filters */
  counts: Record<string, number>;
  today: string;
  panelId: string;
};

export const dayTabId = (day: string) => `schedule-day-${day}`;

/** Seven days as an ARIA tablist: arrows, Home and End move between days, the focused day is selected. */
export function DayTabs({ days, value, onChange, counts, today, panelId }: Props) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = days.length;
    const next =
      e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (next < 0) return;
    e.preventDefault();
    onChange(days[next]);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label="Дни недели" className="grid grid-cols-7 gap-1 sm:gap-2">
      {days.map((d, i) => {
        const f = formatDay(d);
        const selected = d === value;
        const isToday = d === today;
        const past = d < today;
        const count = counts[d] ?? 0;
        return (
          <button
            key={d}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={dayTabId(d)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(d)}
            onKeyDown={(e) => onKey(e, i)}
            aria-label={`${isToday ? "Сегодня, " : ""}${f.long}: ${count} ${plural(count, "занятие", "занятия", "занятий")}`}
            className={clsx(
              "group relative flex min-h-[76px] flex-col items-center justify-center rounded-2xl border px-1 py-2 transition-colors duration-300 sm:min-h-[92px] sm:items-start sm:px-4",
              selected ? "border-chalk bg-chalk text-asphalt" : "border-line/10 bg-graphite hover:border-line/35",
              !selected && past && "text-dust",
            )}
          >
            <span className={clsx("flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] sm:text-[12px]", selected ? "text-asphalt/70" : "text-dust")}>
              {f.weekdayShort}
              {isToday && <span className="h-1.5 w-1.5 rounded-full bg-pulse" aria-hidden />}
              {isToday && <span className="hidden normal-case tracking-normal sm:inline">сегодня</span>}
            </span>
            <span className="digits mt-0.5 text-[30px] leading-none sm:text-[40px]">{f.day}</span>
            <span className={clsx("mt-1 text-[11.5px] leading-none sm:text-[12.5px]", selected ? "text-asphalt/70" : "text-dust")}>
              {count > 0 ? (
                <>
                  <span className="tabular">{count}</span>
                  <span className="hidden sm:inline"> {plural(count, "занятие", "занятия", "занятий")}</span>
                </>
              ) : (
                "—"
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
