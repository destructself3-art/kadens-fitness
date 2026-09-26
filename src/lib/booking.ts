import "server-only";
import { randomInt } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import { BOOKING, CLUB } from "./club";
import { maskPhone } from "./format";
import { prisma } from "./prisma";
import { getSessionView, toView } from "./schedule";
import type { BookingStatus, BookingView, SessionView } from "./session-types";
import { addDays, clubInstant, dateKeyOf } from "./time";

// Capacity is enforced by seats: a booking that holds a place gets a seat number 1..capacity,
// and the unique (sessionId, seat) index rejects a second booking of the same seat.
// Without a free seat the booking goes to the waitlist (seat = null) and is promoted when a place frees up.

const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function makeCode() {
  let s = BOOKING.codePrefix;
  for (let i = 0; i < 6; i++) s += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return s;
}

const ACTIVE: BookingStatus[] = ["booked", "waitlist", "attended"];

export type BookingSource = "site" | "program" | "admin";

export type CreateResult =
  | { ok: true; code: string; status: "booked" | "waitlist"; position: number | null; sessionId: string }
  | { ok: false; reason: "not-found" | "closed" | "duplicate" | "conflict"; message: string; code?: string; sessionId: string };

function closedMessage(view: SessionView): string {
  switch (view.closedReason) {
    case "cancelled":
      return "Это занятие отменено. Посмотрите соседнее время в расписании.";
    case "started":
      return "Занятие уже началось.";
    case "closing":
      return `Онлайн-запись закрывается за ${BOOKING.closesBeforeMin} минут до начала. Подходите на ресепшен: если есть место, вас впустят.`;
    case "not-open-yet":
      return `Запись открывается за ${BOOKING.daysAhead} дней до занятия.`;
    default:
      return "Запись на это занятие закрыта.";
  }
}

async function freeSeat(sessionId: string, capacity: number): Promise<number | null> {
  const rows = await prisma.booking.findMany({ where: { sessionId, seat: { not: null } }, select: { seat: true } });
  const taken = new Set(rows.map((r) => r.seat));
  for (let seat = 1; seat <= capacity; seat++) if (!taken.has(seat)) return seat;
  return null;
}

export async function waitlistPosition(sessionId: string, createdAt: Date): Promise<number> {
  const ahead = await prisma.booking.count({ where: { sessionId, status: "waitlist", createdAt: { lt: createdAt } } });
  return ahead + 1;
}

export async function createBooking(
  input: { sessionId: string; name: string; phone: string },
  source: BookingSource = "site",
  now: Date = new Date(),
): Promise<CreateResult> {
  const { sessionId } = input;
  const view = await getSessionView(sessionId, now);
  if (!view) return { ok: false, reason: "not-found", message: "Такого занятия нет в расписании.", sessionId };
  if (view.status === "cancelled" || (source !== "admin" && !view.bookable)) {
    return { ok: false, reason: "closed", message: closedMessage(view), sessionId };
  }

  for (let attempt = 0; attempt < 6; attempt++) {
    const existing = await prisma.booking.findUnique({ where: { sessionId_phone: { sessionId, phone: input.phone } } });
    if (existing && ACTIVE.includes(existing.status as BookingStatus)) {
      return {
        ok: false,
        reason: "duplicate",
        message: "С этим номером вы уже записаны на это занятие.",
        code: existing.code,
        sessionId,
      };
    }
    const seat = await freeSeat(sessionId, view.capacity);
    const status = seat ? "booked" : "waitlist";
    try {
      const booking = existing
        ? await prisma.booking.update({
            where: { id: existing.id },
            // A rebooking goes to the end of the waitlist, so its timestamp restarts.
            data: { name: input.name, status, seat, source, createdAt: now },
          })
        : await prisma.booking.create({
            data: { code: makeCode(), sessionId, name: input.name, phone: input.phone, status, seat, source, createdAt: now },
          });
      const position = seat ? null : await waitlistPosition(sessionId, booking.createdAt);
      return { ok: true, code: booking.code, status, position, sessionId };
    } catch (error) {
      // Someone took the same seat (or the same code) a moment earlier: look again.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") continue;
      throw error;
    }
  }
  return { ok: false, reason: "conflict", message: "Места разбирают прямо сейчас. Попробуйте ещё раз.", sessionId };
}

/** Books several sessions for one person (the program builder's "book the whole week"). */
export async function createBookings(sessionIds: string[], person: { name: string; phone: string }, source: BookingSource = "program") {
  const results: CreateResult[] = [];
  for (const sessionId of sessionIds) results.push(await createBooking({ sessionId, ...person }, source));
  return results;
}

/** Gives a freed seat to the first person on the waitlist. Returns the promoted booking code, if any. */
async function promoteWaitlist(tx: Prisma.TransactionClient, sessionId: string, seat: number): Promise<string | null> {
  const next = await tx.booking.findFirst({ where: { sessionId, status: "waitlist" }, orderBy: { createdAt: "asc" } });
  if (!next) return null;
  await tx.booking.update({ where: { id: next.id }, data: { status: "booked", seat } });
  return next.code;
}

async function releaseSeat(bookingId: string, status: "cancelled" | "no_show") {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUniqueOrThrow({ where: { id: bookingId } });
    await tx.booking.update({ where: { id: bookingId }, data: { status, seat: status === "cancelled" ? null : booking.seat } });
    if (status === "cancelled" && booking.seat) return promoteWaitlist(tx, booking.sessionId, booking.seat);
    return null;
  });
}

export type CancelResult = { ok: true; promoted: boolean } | { ok: false; message: string };

export async function cancelByGuest(code: string, phoneLast4: string, now: Date = new Date()): Promise<CancelResult> {
  const booking = await prisma.booking.findUnique({ where: { code }, include: { session: true } });
  if (!booking) return { ok: false, message: "Запись не найдена. Проверьте код." };
  if (!booking.phone.endsWith(phoneLast4)) return { ok: false, message: "Цифры не совпадают с номером в записи." };
  if (booking.status === "cancelled") return { ok: true, promoted: false };
  if (!["booked", "waitlist"].includes(booking.status)) return { ok: false, message: "Занятие уже прошло." };
  const msLeft = booking.session.startsAt.getTime() - now.getTime();
  if (msLeft <= 0) return { ok: false, message: "Занятие уже началось." };
  if (booking.status === "booked" && msLeft < BOOKING.cancelBeforeMin * 60_000) {
    return {
      ok: false,
      message: `Онлайн отменить можно не позже чем за ${BOOKING.cancelBeforeMin / 60} часа до начала. Позвоните на ресепшен: ${CLUB.phone}.`,
    };
  }
  const promoted = await releaseSeat(booking.id, "cancelled");
  return { ok: true, promoted: Boolean(promoted) };
}

export type AdminStatus = "booked" | "attended" | "no_show" | "cancelled";

/** Admin status change. Cancelling frees the seat and promotes the waitlist. */
export async function setBookingStatus(id: string, status: AdminStatus): Promise<{ ok: true } | { ok: false; message: string }> {
  const booking = await prisma.booking.findUnique({ where: { id }, include: { session: true } });
  if (!booking) return { ok: false, message: "Запись не найдена" };
  if (status === "cancelled") {
    await releaseSeat(id, "cancelled");
    return { ok: true };
  }
  if (booking.seat == null) {
    // From the waitlist or a cancelled row into the class: needs a free seat.
    const seat = await freeSeat(booking.sessionId, booking.session.capacity);
    if (!seat) return { ok: false, message: "Свободных мест нет" };
    try {
      await prisma.booking.update({ where: { id }, data: { status, seat } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return { ok: false, message: "Место только что заняли, обновите страницу" };
      }
      throw error;
    }
    return { ok: true };
  }
  await prisma.booking.update({ where: { id }, data: { status } });
  return { ok: true };
}

// ---------- Views ----------

const bookingInclude = {
  session: {
    include: {
      classType: { select: { slug: true } },
      studio: { select: { slug: true } },
      coach: { select: { slug: true } },
      substitute: { select: { slug: true } },
    },
  },
} as const;

type BookingRow = Prisma.BookingGetPayload<{ include: typeof bookingInclude }>;

async function toBookingViews(rows: BookingRow[], now: Date): Promise<BookingView[]> {
  const sessionIds = [...new Set(rows.map((r) => r.sessionId))];
  const counts = await prisma.booking.groupBy({
    by: ["sessionId", "status"],
    where: { sessionId: { in: sessionIds }, status: { in: ["booked", "attended", "waitlist"] } },
    _count: { _all: true },
  });
  const bySession = new Map<string, { taken: number; waitlist: number }>();
  for (const c of counts) {
    const v = bySession.get(c.sessionId) ?? { taken: 0, waitlist: 0 };
    if (c.status === "waitlist") v.waitlist += c._count._all;
    else v.taken += c._count._all;
    bySession.set(c.sessionId, v);
  }
  const out: BookingView[] = [];
  for (const r of rows) {
    const session = toView(r.session, bySession.get(r.sessionId), now);
    const msLeft = r.session.startsAt.getTime() - now.getTime();
    const cancellable =
      (r.status === "waitlist" && msLeft > 0) || (r.status === "booked" && msLeft >= BOOKING.cancelBeforeMin * 60_000);
    out.push({
      id: r.id,
      code: r.code,
      name: r.name,
      phoneMasked: maskPhone(r.phone),
      status: r.status as BookingStatus,
      seat: r.seat,
      waitlistPosition: r.status === "waitlist" ? await waitlistPosition(r.sessionId, r.createdAt) : null,
      source: r.source,
      createdAt: r.createdAt.toISOString(),
      cancellable,
      session,
    });
  }
  return out;
}

export async function getBookingView(code: string, now: Date = new Date()): Promise<BookingView | null> {
  const row = await prisma.booking.findUnique({ where: { code: code.toUpperCase() }, include: bookingInclude });
  if (!row) return null;
  const [view] = await toBookingViews([row], now);
  return view;
}

/** Raw booking for server-side use (e.g. the calendar file). */
export function getBookingRow(code: string) {
  return prisma.booking.findUnique({ where: { code: code.toUpperCase() }, include: bookingInclude });
}

export type LookupResult = { ok: true; bookings: BookingView[] } | { ok: false; message: string };

/**
 * «Мои записи»: a booking code plus the last 4 phone digits prove the visitor owns the phone number,
 * then every booking of that number from yesterday on is shown.
 */
export async function lookupBookings(code: string, phoneLast4: string, now: Date = new Date()): Promise<LookupResult> {
  const booking = await prisma.booking.findUnique({ where: { code: code.toUpperCase() } });
  if (!booking || !booking.phone.endsWith(phoneLast4)) {
    return { ok: false, message: "Не нашли запись с таким кодом и номером. Проверьте код из подтверждения." };
  }
  const from = clubInstant(addDays(dateKeyOf(now), -1), 0);
  const rows = await prisma.booking.findMany({
    where: { phone: booking.phone, session: { startsAt: { gte: from } } },
    include: bookingInclude,
    orderBy: { session: { startsAt: "asc" } },
  });
  return { ok: true, bookings: await toBookingViews(rows, now) };
}

/** Everyone booked into a session, with full phone numbers: admin only. */
export function getRoster(sessionId: string) {
  return prisma.booking.findMany({
    where: { sessionId },
    orderBy: [{ seat: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
  });
}
