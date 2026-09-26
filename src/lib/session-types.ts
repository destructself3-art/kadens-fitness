// Shapes shared by the server (src/lib/schedule.ts, booking.ts) and client components. No server imports here.
import type { ClassSlug, CoachSlug, SpaceSlug, ZoneId } from "@/data/types";

export type SessionStatus = "scheduled" | "cancelled";

/** One class as pages see it. Dates are ISO strings so the object can cross the server/client boundary. */
export type SessionView = {
  id: string;
  classSlug: ClassSlug;
  classTitle: string;
  zone: ZoneId;
  studioSlug: SpaceSlug;
  studioName: string;
  /** The coach who actually leads it: the substitute when there is one */
  coachSlug: CoachSlug;
  coachName: string;
  /** The regular coach, set only when a substitute leads the class */
  regularCoachSlug: CoachSlug | null;
  regularCoachName: string | null;
  startsAt: string;
  endsAt: string;
  /** Club calendar day, "YYYY-MM-DD" */
  dateKey: string;
  /** "19:15" */
  time: string;
  endTime: string;
  durationMin: number;
  capacity: number;
  /** Places held (booked + attended) */
  taken: number;
  left: number;
  waitlist: number;
  status: SessionStatus;
  note: string | null;
  /** Already started */
  started: boolean;
  /** Running right now */
  live: boolean;
  /** Online booking accepts it right now (window open, not cancelled, not too late) */
  bookable: boolean;
  /** Why it is not bookable, for the UI */
  closedReason: "cancelled" | "started" | "closing" | "not-open-yet" | null;
};

export type BookingStatus = "booked" | "waitlist" | "attended" | "no_show" | "cancelled";

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  booked: "Записаны",
  waitlist: "Лист ожидания",
  attended: "Пришли",
  no_show: "Не пришли",
  cancelled: "Отменена",
};

export type BookingView = {
  id: string;
  code: string;
  name: string;
  /** Masked for public pages: "+7 916 •••-••-67" */
  phoneMasked: string;
  status: BookingStatus;
  seat: number | null;
  /** 1-based place in the waitlist, null when not waiting */
  waitlistPosition: number | null;
  source: string;
  createdAt: string;
  /** Online cancellation is still possible */
  cancellable: boolean;
  session: SessionView;
};

export type LeadKind = "trial" | "program" | "corporate" | "kids" | "membership" | "callback";

export const LEAD_KIND_LABELS: Record<LeadKind, string> = {
  trial: "Пробная тренировка",
  program: "Программа тренеру",
  corporate: "Корпоративный клиент",
  kids: "Детский клуб",
  membership: "Абонемент",
  callback: "Обратный звонок",
};

export type LeadStatus = "new" | "contacted" | "converted" | "lost";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Новая",
  contacted: "Связались",
  converted: "Купил",
  lost: "Отказ",
};
