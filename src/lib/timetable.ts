// Expands the weekly template into concrete sessions for a date. Pure and deterministic:
// the same date always gives the same plan, so generation is idempotent.
import { getClass } from "@/data/classes";
import { getSpace } from "@/data/spaces";
import { TIMETABLE } from "@/data/timetable";
import type { ClassSlug, CoachSlug, SpaceSlug } from "@/data/types";
import { daysBetween, hhmmToMinutes, isoDayOf, weekDays } from "./time";

export type PlannedSession = {
  dateKey: string;
  /** minutes from club midnight */
  start: number;
  end: number;
  classSlug: ClassSlug;
  studioSlug: SpaceSlug;
  coachSlug: CoachSlug;
  capacity: number;
};

/** Minimum gap a coach gets between two classes. */
const COACH_BREAK_MIN = 15;
/** Rotation anchor: any fixed Monday. */
const EPOCH = "2026-01-05";

export function planDay(dateKey: string): PlannedSession[] {
  const iso = isoDayOf(dateKey);
  const dayIndex = daysBetween(EPOCH, dateKey);
  const todays = TIMETABLE.filter((slot) => slot.days.includes(iso)).map((slot, index) => {
    const cls = getClass(slot.class);
    const start = hhmmToMinutes(slot.time);
    return { slot, index, cls, start, end: start + cls.durationMin };
  });

  // Classes with fewer possible coaches get their coach first, then by time.
  const order = [...todays].sort((a, b) => a.cls.coaches.length - b.cls.coaches.length || a.start - b.start || a.index - b.index);
  const busy = new Map<CoachSlug, Array<[number, number]>>();
  const isFree = (coach: CoachSlug, start: number, end: number) =>
    (busy.get(coach) ?? []).every(([s, e]) => end + COACH_BREAK_MIN <= s || start >= e + COACH_BREAK_MIN);
  const candidates = (item: (typeof order)[number]) => {
    const pool = item.cls.coaches;
    const shift = (dayIndex + item.index) % pool.length;
    return [...pool.slice(shift), ...pool.slice(0, shift)];
  };

  // Depth-first search with backtracking: every coach gets a break between classes.
  // The rotation decides who is tried first, so faces change from day to day.
  const assigned = new Map<number, CoachSlug>();
  let steps = 0;
  const solve = (i: number): boolean => {
    if (i === order.length) return true;
    if (++steps > 200_000) return false;
    const item = order[i];
    for (const coach of candidates(item)) {
      if (!isFree(coach, item.start, item.end)) continue;
      busy.set(coach, [...(busy.get(coach) ?? []), [item.start, item.end]]);
      assigned.set(item.index, coach);
      if (solve(i + 1)) return true;
      busy.set(coach, (busy.get(coach) ?? []).slice(0, -1));
      assigned.delete(item.index);
    }
    return false;
  };
  if (!solve(0)) {
    // No clean plan (should not happen with the current timetable): fall back to the first free or first listed coach.
    busy.clear();
    assigned.clear();
    for (const item of order) {
      const pool = candidates(item);
      const coach = pool.find((c) => isFree(c, item.start, item.end)) ?? pool[0];
      busy.set(coach, [...(busy.get(coach) ?? []), [item.start, item.end]]);
      assigned.set(item.index, coach);
    }
  }

  return todays
    .map((item) => ({
      dateKey,
      start: item.start,
      end: item.end,
      classSlug: item.slot.class,
      studioSlug: item.cls.studio,
      coachSlug: assigned.get(item.index)!,
      capacity: getSpace(item.cls.studio).capacity ?? 12,
    }))
    .sort((a, b) => a.start - b.start || a.studioSlug.localeCompare(b.studioSlug));
}

export function planWeek(weekStart: string): PlannedSession[] {
  return weekDays(weekStart).flatMap(planDay);
}
