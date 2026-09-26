// Weekly timetable template (club time, Moscow). Sessions are generated from it week by week (src/lib/timetable.ts).
// The studio of a slot is the studio of its class (src/data/classes.ts); coaches are assigned automatically
// without overlaps, rotating through the class's coaches so different faces appear on different days.
import type { ClassSlug } from "./types";

export type TimetableSlot = {
  time: string;
  class: ClassSlug;
  /** ISO weekdays, 1 = Monday */
  days: readonly number[];
};

const WEEKDAYS = [1, 2, 3, 4, 5] as const;
const WEEKEND = [6, 7] as const;

const slots = (days: readonly number[], cls: ClassSlug, times: string[]): TimetableSlot[] =>
  times.map((time) => ({ time, class: cls, days }));

export const TIMETABLE: TimetableSlot[] = [
  // «Вираж», cycle studio
  ...slots(WEEKDAYS, "cycle", ["07:00", "08:15", "12:30", "18:00", "19:15", "20:30"]),
  ...slots(WEEKEND, "cycle", ["09:00", "10:15", "12:00", "17:00"]),
  // «Ринг»
  ...slots(WEEKDAYS, "boxing", ["07:30", "13:00", "18:30", "19:45", "21:00"]),
  ...slots(WEEKEND, "boxing", ["10:00", "12:00"]),
  // «Кузня»
  ...slots(WEEKDAYS, "hiit", ["07:00", "12:15", "18:00", "19:15", "20:30"]),
  ...slots(WEEKEND, "hiit", ["09:30", "11:00", "16:00"]),
  // «Такт»
  ...slots(WEEKDAYS, "dance", ["10:00", "18:30", "19:45", "21:00"]),
  ...slots(WEEKEND, "dance", ["11:00", "13:00", "17:30"]),
  // «Тишина»
  ...slots(WEEKDAYS, "yoga", ["07:00", "09:30", "18:00", "21:00"]),
  ...slots(WEEKDAYS, "stretching", ["12:30", "19:30"]),
  ...slots(WEEKEND, "yoga", ["09:00", "18:00"]),
  ...slots(WEEKEND, "stretching", ["11:00"]),
  // «Опора»
  ...slots(WEEKDAYS, "reformer", ["08:00", "09:15", "12:00", "17:30", "18:45", "20:00"]),
  ...slots(WEEKEND, "reformer", ["10:00", "11:15", "12:30"]),
  // «Глубина»
  ...slots(WEEKDAYS, "swim", ["07:30", "19:00"]),
  ...slots(WEEKDAYS, "aqua", ["10:30", "18:00", "20:15"]),
  ...slots(WEEKEND, "aqua", ["09:00", "12:00"]),
  ...slots(WEEKEND, "swim", ["10:00"]),
  // Тренажёрный зал
  ...slots(WEEKDAYS, "strength", ["07:30", "18:30", "20:00"]),
  ...slots(WEEKEND, "strength", ["10:00"]),
  // Функциональная зона
  ...slots(WEEKDAYS, "functional", ["08:00", "18:00", "20:30"]),
  ...slots(WEEKDAYS, "trx", ["12:30", "19:15"]),
  ...slots(WEEKEND, "functional", ["10:30"]),
  ...slots(WEEKEND, "trx", ["12:00"]),
  // Кардиозона
  ...slots(WEEKDAYS, "run", ["07:15", "19:00"]),
  ...slots(WEEKDAYS, "row", ["13:00", "20:15"]),
  ...slots(WEEKEND, "run", ["09:30"]),
];
