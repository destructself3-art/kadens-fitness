// Formatting for the admin panel. Pure functions in club time, used by server components only,
// so the output never differs between server and browser.
import { addDays, clubParts, dateKeyOf, formatDay, timeOf } from "@/lib/time";

const MONTHS_SHORT = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

const toDate = (value: Date | string) => (typeof value === "string" ? new Date(value) : value);

/** "25 сен, 14:05" in club time. */
export function stamp(value: Date | string): string {
  const d = toDate(value);
  const p = clubParts(d);
  return `${p.day} ${MONTHS_SHORT[p.month - 1]}, ${timeOf(d)}`;
}

/** "только что", "12 мин назад", "3 ч назад", "вчера, 21:40" or a stamp. */
export function ago(value: Date | string, now: Date): string {
  const d = toDate(value);
  const min = Math.floor((now.getTime() - d.getTime()) / 60_000);
  if (min < 0) return stamp(d);
  if (min < 1) return "только что";
  if (min < 60) return `${min} мин назад`;
  if (min < 24 * 60 && dateKeyOf(d) === dateKeyOf(now)) return `${Math.floor(min / 60)} ч назад`;
  if (dateKeyOf(d) === addDays(dateKeyOf(now), -1)) return `вчера, ${timeOf(d)}`;
  return stamp(d);
}

/** "пт, 26 сен" */
export function shortDay(dateKey: string): string {
  const f = formatDay(dateKey);
  const [, m] = dateKey.split("-").map(Number);
  return `${f.weekdayShort}, ${f.day} ${MONTHS_SHORT[m - 1]}`;
}

export const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** Fill rate in whole percent. */
export const fillPct = (taken: number, capacity: number) => (capacity > 0 ? Math.round((taken / capacity) * 100) : 0);

export const SOURCE_LABELS: Record<string, string> = {
  site: "Сайт",
  program: "Программа",
  admin: "Ресепшен",
  demo: "Демо",
};

/** Query string from a record, skipping empty values. */
export function qs(params: Record<string, string | number | undefined | null>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  const s = sp.toString();
  return s ? `?${s}` : "";
}
