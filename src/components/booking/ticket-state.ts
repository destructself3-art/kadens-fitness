// What a booking means for the visitor right now. Pure: safe on the server and in the browser.
// The flags come from the server (session.started / session.live were computed at fetch time),
// so nothing here reads the clock and client renders stay deterministic.
import type { BookingView } from "@/lib/session-types";

export type TicketState =
  | "booked"
  | "live"
  | "waitlist"
  | "attended"
  | "no_show"
  | "cancelled"
  | "club-cancelled"
  | "past"
  /** Stood in the waitlist, the class started and no place came free */
  | "missed";

export function ticketState(b: BookingView): TicketState {
  if (b.status === "cancelled") return "cancelled";
  if (b.status === "attended") return "attended";
  if (b.status === "no_show") return "no_show";
  if (b.session.status === "cancelled") return "club-cancelled";
  if (b.status === "booked" && b.session.live) return "live";
  if (b.session.started) return b.status === "waitlist" ? "missed" : "past";
  return b.status;
}

/** States that still lie ahead of the visitor. */
export const isUpcoming = (state: TicketState) => state === "booked" || state === "live" || state === "waitlist";

export type Tone = "pulse" | "chalk" | "dust";

export const STATE_META: Record<TicketState, { chip: string; tone: Tone; stamp: string | null }> = {
  booked: { chip: "Записаны", tone: "pulse", stamp: null },
  live: { chip: "Идёт сейчас", tone: "pulse", stamp: null },
  waitlist: { chip: "Лист ожидания", tone: "chalk", stamp: null },
  attended: { chip: "Были на занятии", tone: "chalk", stamp: "Засчитано" },
  no_show: { chip: "Не пришли", tone: "dust", stamp: "Неявка" },
  cancelled: { chip: "Отменена", tone: "dust", stamp: "Отменена" },
  "club-cancelled": { chip: "Отменено клубом", tone: "dust", stamp: "Отменено" },
  past: { chip: "Прошло", tone: "dust", stamp: "Прошло" },
  missed: { chip: "Место не освободилось", tone: "dust", stamp: "Мест не было" },
};

/** "KD7K3M9Q", "kd-7k3m9q" or the same typed in the Russian layout ("лв-7л3ь9й") → "KD-7K3M9Q". */
const RU_LAYOUT: Record<string, string> = {
  й: "q", ц: "w", у: "e", к: "r", е: "t", н: "y", г: "u", ш: "i", щ: "o", з: "p",
  ф: "a", ы: "s", в: "d", а: "f", п: "g", р: "h", о: "j", л: "k", д: "l",
  я: "z", ч: "x", с: "c", м: "v", и: "b", т: "n", ь: "m",
};

export function normalizeCode(input: string): string {
  const latin = input
    .toLowerCase()
    .split("")
    .map((ch) => RU_LAYOUT[ch] ?? ch)
    .join("")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  if (latin.length <= 2) return latin;
  return `${latin.slice(0, 2)}-${latin.slice(2, 9)}`;
}

export const CODE_PATTERN = /^[A-Z]{2}-[0-9A-Z]{6,7}$/;
