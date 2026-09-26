"use client";

import Link from "next/link";
import clsx from "clsx";
import type { ClassSlug, SpaceSlug, ZoneId } from "@/data/types";
import { plural } from "@/lib/format";
import type { SessionView } from "@/lib/session-types";
import { clubParts, hhmmToMinutes, minutesToHHMM } from "@/lib/time";
import { zoneMeta } from "@/lib/zones";

const START = 7 * 60;
const END = 23 * 60;
const HOUR_PX = 96;
const AXIS_PX = 52;
/** Ten studio columns fit a 1280 px screen; narrower screens scroll the grid sideways. */
const COL_MIN_PX = 116;
const HOURS = Array.from({ length: (END - START) / 60 }, (_, i) => START + i * 60);

/** Timetable names that fit a narrow column; the full title stays in the accessible name and the tooltip. */
const GRID_LABEL: Record<ClassSlug, string> = {
  cycle: "Сайкл",
  boxing: "Бокс",
  hiit: "HIIT",
  functional: "Функц. тренинг",
  dance: "Танцы",
  yoga: "Йога",
  stretching: "Растяжка",
  reformer: "Реформер",
  aqua: "Аква",
  swim: "Плавание",
  strength: "Силовая",
  run: "Бег",
  row: "Гребля",
  trx: "Петли",
};

/** Column heads that would not fit a narrow column in capitals; the full name stays in the tooltip. */
const STUDIO_LABEL: Partial<Record<SpaceSlug, string>> = {
  functional: "Функц. зона",
  gym: "Тренажёрный зал",
};

/** "Марина Ким" -> "Марина К." */
const shortName = (name: string) => {
  const [first, last] = name.split(" ");
  return last ? `${first} ${last[0]}.` : first;
};

const yOf = (minutes: number) => ((Math.min(END, Math.max(START, minutes)) - START) / 60) * HOUR_PX;

/** Seats in a few characters for the block; the long form goes to the accessible name. */
function places(s: SessionView): { short: string; long: string } {
  if (s.status === "cancelled") return { short: "отменено", long: "отменено" };
  if (s.live) return { short: "идёт", long: "идёт сейчас" };
  if (s.started) return { short: "прошло", long: "прошло" };
  if (s.left === 0) return { short: "мест нет", long: s.waitlist > 0 ? `мест нет, в листе ожидания ${s.waitlist}` : "мест нет, можно в лист ожидания" };
  const left = `${s.left} ${plural(s.left, "место", "места", "мест")}`;
  return { short: left, long: `свободно ${left}` };
}

type Column = { slug: SpaceSlug; name: string };

type Props = {
  /** Studios to draw as columns, in club order */
  columns: Column[];
  /** Sessions of the day after the filters */
  sessions: SessionView[];
  highlight: ZoneId | null;
  /** The chosen day is today in club time: draw the "now" line */
  isToday: boolean;
  now: number;
};

/**
 * The day as a timeline: a column per studio, a row per hour from 07:00 to 23:00.
 * Blocks sit at their start time and are as tall as the class is long. On narrow screens the grid scrolls sideways
 * inside its own frame while the hour axis stays pinned.
 */
export function ScheduleGrid({ columns, sessions, highlight, isToday, now }: Props) {
  const nowMin = clubParts(new Date(now)).minutes;
  const showNow = isToday && nowMin >= START && nowMin <= END;
  const template = `${AXIS_PX}px repeat(${columns.length}, minmax(${COL_MIN_PX}px, 1fr))`;
  const height = yOf(END);

  return (
    <div
      role="region"
      aria-label="Сетка дня по студиям, прокручивается по горизонтали"
      tabIndex={0}
      className="relative overflow-x-auto rounded-card border border-line/10 bg-graphite [scrollbar-width:thin]"
    >
      <div style={{ minWidth: AXIS_PX + columns.length * COL_MIN_PX }}>
        {/* Studio names */}
        <div className="grid border-b border-line/10" style={{ gridTemplateColumns: template }}>
          <div className="sticky left-0 z-30 bg-graphite" />
          {columns.map((c) => (
            <div key={c.slug} className="min-w-0 border-l border-line/10 px-3 py-3.5" title={c.name}>
              <span className="line-clamp-2 text-[12px] font-semibold uppercase leading-tight tracking-[0.08em] text-dust [overflow-wrap:anywhere]">
                {STUDIO_LABEL[c.slug] ?? c.name}
              </span>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: template,
            height,
            backgroundImage: `repeating-linear-gradient(to bottom, rgb(var(--line) / 0.07) 0 1px, transparent 1px ${HOUR_PX / 2}px, rgb(var(--line) / 0.03) ${HOUR_PX / 2}px ${HOUR_PX / 2 + 1}px, transparent ${HOUR_PX / 2 + 1}px ${HOUR_PX}px)`,
          }}
        >
          <div className="sticky left-0 z-20 border-r border-line/10 bg-graphite" aria-hidden>
            {HOURS.map((h) => (
              <span key={h} className="digits absolute left-0 w-full pr-2.5 text-right text-[17px] leading-none text-dust" style={{ top: yOf(h) + 6 }}>
                {minutesToHHMM(h)}
              </span>
            ))}
            {showNow && (
              <span className="digits absolute left-1 z-10 rounded bg-pulse px-1.5 py-0.5 text-[16px] leading-none text-asphalt" style={{ top: yOf(nowMin) - 10 }}>
                {minutesToHHMM(nowMin)}
              </span>
            )}
          </div>

          {columns.map((c) => (
            <div key={c.slug} className="relative border-l border-line/10">
              {sessions
                .filter((s) => s.studioSlug === c.slug)
                .map((s) => {
                  const z = zoneMeta(s.zone);
                  const start = hhmmToMinutes(s.time);
                  const top = yOf(start);
                  const h = Math.max(40, yOf(start + s.durationMin) - top - 4);
                  const muted = s.status === "cancelled" || (s.started && !s.live);
                  const lit = highlight !== null && s.zone === highlight;
                  const dim = highlight !== null && !lit;
                  const p = places(s);
                  return (
                    <Link
                      key={s.id}
                      href={`/schedule/${s.id}`}
                      aria-label={`${s.time}–${s.endTime}, ${s.classTitle}, ${s.studioName}, зона ${z.id}, ${s.coachName}${s.regularCoachName ? " (замена)" : ""}, ${p.long}`}
                      className={clsx(
                        "group absolute inset-x-1 flex flex-col overflow-hidden rounded-xl py-1.5 pl-3 pr-1.5 text-left transition-[opacity,transform,box-shadow] duration-300 ease-silk hover:z-10 hover:-translate-y-0.5 focus-visible:z-10",
                        muted && !lit && "opacity-45",
                        dim && "opacity-25 hover:opacity-100 focus-visible:opacity-100",
                      )}
                      style={{
                        top: top + 2,
                        height: h,
                        background: s.status === "cancelled" ? `repeating-linear-gradient(135deg, ${z.color}14 0 6px, transparent 6px 12px)` : `${z.color}24`,
                        boxShadow: lit ? `inset 0 0 0 2px ${z.color}, 0 12px 30px -14px ${z.color}` : `inset 0 0 0 1px ${z.color}30`,
                      }}
                    >
                      <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: z.color }} aria-hidden />
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="digits text-[16px] leading-none text-chalk">{s.time}</span>
                        <span className={clsx("truncate text-[11px] leading-none", s.left > 0 && s.left <= 3 && !s.started ? "font-semibold text-pulse" : "text-dust")}>
                          {s.live && <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-pulse align-middle" aria-hidden />}
                          {p.short}
                        </span>
                      </span>
                      <span
                        className={clsx(
                          "mt-1 font-display text-[14px] uppercase leading-tight text-chalk",
                          s.durationMin >= 55 ? "line-clamp-2" : "truncate",
                          s.status === "cancelled" && "line-through",
                        )}
                        style={{ fontVariationSettings: '"wdth" 54', fontWeight: 800 }}
                        title={s.classTitle}
                      >
                        {GRID_LABEL[s.classSlug] ?? s.classTitle}
                      </span>
                      {s.durationMin >= 45 && (
                        <span className="truncate text-[11.5px] leading-snug text-dust">
                          {shortName(s.coachName)}
                          {s.regularCoachName && <span className="text-chalk"> · замена</span>}
                        </span>
                      )}
                    </Link>
                  );
                })}
            </div>
          ))}

          {showNow && (
            <div className="pointer-events-none absolute inset-x-0 z-10 h-0.5 bg-pulse shadow-[0_0_12px_rgb(var(--pulse))]" style={{ top: yOf(nowMin) }} aria-hidden />
          )}
        </div>
      </div>
    </div>
  );
}
