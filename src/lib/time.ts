// Club-time helpers. The club lives in Moscow time (UTC+3, no DST), whatever the visitor's clock says.
// Pure functions: safe on the server and in the browser.
import { CLUB, HOURS } from "./club";

const OFFSET_MS = CLUB.utcOffsetMinutes * 60_000;
const pad = (n: number) => String(n).padStart(2, "0");

export type ClubParts = {
  year: number;
  month: number; // 1-12
  day: number;
  /** ISO weekday: 1 = Monday ... 7 = Sunday */
  isoDay: number;
  /** minutes since club midnight */
  minutes: number;
};

export function clubParts(date: Date = new Date()): ClubParts {
  const shifted = new Date(date.getTime() + OFFSET_MS);
  const weekday = shifted.getUTCDay();
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    isoDay: weekday === 0 ? 7 : weekday,
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
  };
}

/** "YYYY-MM-DD" of the club calendar day. */
export function dateKeyOf(date: Date = new Date()): string {
  const p = clubParts(date);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** "HH:MM" of a moment in club time. */
export function timeOf(date: Date): string {
  return minutesToHHMM(clubParts(date).minutes);
}

/** The UTC instant of a club wall-clock time. */
export function clubInstant(dateKey: string, minutes: number): Date {
  const base = Date.parse(`${dateKey}T00:00:00${CLUB.utcOffset}`);
  return new Date(base + minutes * 60_000);
}

export function minutesToHHMM(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

export function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function isDateKey(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`));
}

export function addDays(dateKey: string, days: number): string {
  const d = new Date(Date.parse(`${dateKey}T12:00:00Z`) + days * 86_400_000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function isoDayOf(dateKey: string): number {
  const d = new Date(Date.parse(`${dateKey}T12:00:00Z`)).getUTCDay();
  return d === 0 ? 7 : d;
}

/** Monday of the week that contains dateKey. */
export function weekStartOf(dateKey: string): string {
  return addDays(dateKey, 1 - isoDayOf(dateKey));
}

export function weekDays(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);
}

const MONTHS_GEN = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const MONTHS_NOM = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
const WEEKDAYS = ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"];
const WEEKDAYS_SHORT = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
const WEEKDAYS_ACC = ["понедельник", "вторник", "среду", "четверг", "пятницу", "субботу", "воскресенье"];

export function formatDay(dateKey: string) {
  const [, m, d] = dateKey.split("-").map(Number);
  const iso = isoDayOf(dateKey);
  return {
    day: d,
    month: MONTHS_GEN[m - 1],
    monthNominative: MONTHS_NOM[m - 1],
    weekday: WEEKDAYS[iso - 1],
    weekdayShort: WEEKDAYS_SHORT[iso - 1],
    weekdayAcc: WEEKDAYS_ACC[iso - 1],
    /** "26 сентября" */
    dayMonth: `${d} ${MONTHS_GEN[m - 1]}`,
    /** "пятница, 26 сентября" */
    long: `${WEEKDAYS[iso - 1]}, ${d} ${MONTHS_GEN[m - 1]}`,
  };
}

/** "сегодня", "завтра" or "пятница, 26 сентября" relative to the club calendar. */
export function relativeDayLabel(dateKey: string, now: Date = new Date()): string {
  const today = dateKeyOf(now);
  if (dateKey === today) return "сегодня";
  if (dateKey === addDays(today, 1)) return "завтра";
  return formatDay(dateKey).long;
}

/** "22–28 сентября" or "29 сентября – 5 октября" */
export function weekRangeLabel(weekStart: string): string {
  const end = addDays(weekStart, 6);
  const a = formatDay(weekStart);
  const b = formatDay(end);
  return a.month === b.month ? `${a.day}–${b.day} ${b.month}` : `${a.dayMonth} – ${b.dayMonth}`;
}

export function hoursFor(dateKey: string) {
  return HOURS[isoDayOf(dateKey)];
}

export type OpenStatus = { open: boolean; label: string };

/** "Открыто до 23:30", "Закрыто, откроемся в 08:00" */
export function openStatus(now: Date = new Date()): OpenStatus {
  const p = clubParts(now);
  const today = dateKeyOf(now);
  const h = hoursFor(today);
  if (p.minutes >= h.open && p.minutes < h.close) {
    const left = h.close - p.minutes;
    if (left <= 60) return { open: true, label: `Открыто, закроемся через ${left} мин` };
    return { open: true, label: `Открыто до ${minutesToHHMM(h.close)}` };
  }
  if (p.minutes < h.open) return { open: false, label: `Закрыто, откроемся в ${minutesToHHMM(h.open)}` };
  const tomorrow = hoursFor(addDays(today, 1));
  return { open: false, label: `Закрыто, завтра с ${minutesToHHMM(tomorrow.open)}` };
}
