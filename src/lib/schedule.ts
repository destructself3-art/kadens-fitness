import "server-only";
import { CLASSES, getClass } from "@/data/classes";
import { COACHES, getCoach } from "@/data/coaches";
import { SPACES, getSpace } from "@/data/spaces";
import type { ClassSlug, CoachSlug, SpaceSlug, ZoneId } from "@/data/types";
import { BOOKING } from "./club";
import { ensureDemoWeek } from "./demo";
import { prisma } from "./prisma";
import type { SessionStatus, SessionView } from "./session-types";
import { planWeek } from "./timetable";
import { addDays, clubInstant, clubParts, dateKeyOf, hoursFor, timeOf, weekStartOf } from "./time";

// ---------- Catalog: studios, classes and coaches mirrored from src/data ----------

let catalogReady: Promise<void> | null = null;

/** Upserts studios, class types and coaches from src/data. Runs once per server process. */
export function ensureCatalog(): Promise<void> {
  catalogReady ??= syncCatalog().catch((error) => {
    catalogReady = null;
    throw error;
  });
  return catalogReady;
}

export async function syncCatalog() {
  const hosting = SPACES.filter((s) => s.capacity);
  for (const [sort, s] of hosting.entries()) {
    const data = { name: s.name, capacity: s.capacity!, sort };
    await prisma.studio.upsert({ where: { slug: s.slug }, update: data, create: { slug: s.slug, ...data } });
  }
  for (const [sort, c] of CLASSES.entries()) {
    const data = { title: c.title, zone: c.zone, durationMin: c.durationMin, sort };
    await prisma.classType.upsert({ where: { slug: c.slug }, update: data, create: { slug: c.slug, ...data } });
  }
  for (const [sort, c] of COACHES.entries()) {
    const data = { name: c.name, zone: c.zone, sort };
    await prisma.coach.upsert({ where: { slug: c.slug }, update: data, create: { slug: c.slug, ...data } });
  }
}

async function catalogIds() {
  await ensureCatalog();
  const [studios, classes, coaches] = await Promise.all([
    prisma.studio.findMany({ select: { id: true, slug: true } }),
    prisma.classType.findMany({ select: { id: true, slug: true } }),
    prisma.coach.findMany({ select: { id: true, slug: true } }),
  ]);
  return {
    studio: new Map(studios.map((s) => [s.slug, s.id])),
    classType: new Map(classes.map((c) => [c.slug, c.id])),
    coach: new Map(coaches.map((c) => [c.slug, c.id])),
  };
}

// ---------- Weeks ----------

const weeksReady = new Set<string>();

/** Creates the sessions of a week from the timetable if they are missing. Idempotent. */
export async function ensureWeek(weekStart: string): Promise<void> {
  if (weeksReady.has(weekStart)) return;
  const ids = await catalogIds();
  const from = clubInstant(weekStart, 0);
  const to = clubInstant(addDays(weekStart, 7), 0);
  const existing = await prisma.session.findMany({
    where: { startsAt: { gte: from, lt: to } },
    select: { studioId: true, startsAt: true },
  });
  const have = new Set(existing.map((s) => `${s.studioId}|${s.startsAt.getTime()}`));
  const missing = planWeek(weekStart)
    .map((p) => ({
      classTypeId: ids.classType.get(p.classSlug)!,
      studioId: ids.studio.get(p.studioSlug)!,
      coachId: ids.coach.get(p.coachSlug)!,
      startsAt: clubInstant(p.dateKey, p.start),
      endsAt: clubInstant(p.dateKey, p.end),
      capacity: p.capacity,
    }))
    .filter((s) => !have.has(`${s.studioId}|${s.startsAt.getTime()}`));
  if (missing.length) {
    try {
      await prisma.session.createMany({ data: missing });
    } catch {
      // Another request created part of the week at the same moment: insert one by one and skip duplicates.
      for (const s of missing) {
        await prisma.session.create({ data: s }).catch(() => undefined);
      }
    }
  }
  weeksReady.add(weekStart);
  await ensureDemoWeek(weekStart);
}

/** Makes sure every week touching [fromKey, toKey] exists. */
export async function ensureRange(fromKey: string, toKey: string) {
  for (let w = weekStartOf(fromKey); w <= toKey; w = addDays(w, 7)) await ensureWeek(w);
}

// ---------- Views ----------

const sessionInclude = {
  classType: { select: { slug: true } },
  studio: { select: { slug: true } },
  coach: { select: { slug: true } },
  substitute: { select: { slug: true } },
} as const;

type SessionRow = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  status: string;
  note: string | null;
  classType: { slug: string };
  studio: { slug: string };
  coach: { slug: string };
  substitute: { slug: string } | null;
};

async function countsFor(sessionIds: string[]) {
  if (!sessionIds.length) return new Map<string, { taken: number; waitlist: number }>();
  const rows = await prisma.booking.groupBy({
    by: ["sessionId", "status"],
    where: { sessionId: { in: sessionIds }, status: { in: ["booked", "attended", "waitlist"] } },
    _count: { _all: true },
  });
  const out = new Map<string, { taken: number; waitlist: number }>();
  for (const r of rows) {
    const c = out.get(r.sessionId) ?? { taken: 0, waitlist: 0 };
    if (r.status === "waitlist") c.waitlist += r._count._all;
    else c.taken += r._count._all;
    out.set(r.sessionId, c);
  }
  return out;
}

export function toView(row: SessionRow, counts: { taken: number; waitlist: number } | undefined, now: Date): SessionView {
  const cls = getClass(row.classType.slug as ClassSlug);
  const lead = row.substitute ? row.substitute.slug : row.coach.slug;
  const regular = row.substitute ? getCoach(row.coach.slug as CoachSlug) : null;
  const taken = counts?.taken ?? 0;
  const t = now.getTime();
  const start = row.startsAt.getTime();
  const started = start <= t;
  const live = started && row.endsAt.getTime() > t;
  const dateKey = dateKeyOf(row.startsAt);
  const lastDay = addDays(dateKeyOf(now), BOOKING.daysAhead - 1);
  const closedReason: SessionView["closedReason"] =
    row.status === "cancelled"
      ? "cancelled"
      : started
        ? "started"
        : start - t < BOOKING.closesBeforeMin * 60_000
          ? "closing"
          : dateKey > lastDay
            ? "not-open-yet"
            : null;
  return {
    id: row.id,
    classSlug: cls.slug,
    classTitle: cls.title,
    zone: cls.zone as ZoneId,
    studioSlug: row.studio.slug as SpaceSlug,
    studioName: getSpace(row.studio.slug as SpaceSlug).name,
    coachSlug: lead as CoachSlug,
    coachName: getCoach(lead as CoachSlug).name,
    regularCoachSlug: regular?.slug ?? null,
    regularCoachName: regular?.name ?? null,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    dateKey,
    time: timeOf(row.startsAt),
    endTime: timeOf(row.endsAt),
    durationMin: Math.round((row.endsAt.getTime() - start) / 60_000),
    capacity: row.capacity,
    taken,
    left: Math.max(0, row.capacity - taken),
    waitlist: counts?.waitlist ?? 0,
    status: row.status as SessionStatus,
    note: row.note,
    started,
    live,
    bookable: closedReason === null,
    closedReason,
  };
}

async function viewsOf(rows: SessionRow[], now: Date) {
  const counts = await countsFor(rows.map((r) => r.id));
  return rows.map((r) => toView(r, counts.get(r.id), now));
}

export type SessionFilter = {
  classSlug?: ClassSlug;
  coachSlug?: CoachSlug;
  studioSlug?: SpaceSlug;
  zone?: ZoneId;
};

function whereFor(filter: SessionFilter) {
  return {
    ...(filter.classSlug ? { classType: { slug: filter.classSlug } } : {}),
    ...(filter.studioSlug ? { studio: { slug: filter.studioSlug } } : {}),
    ...(filter.zone ? { classType: { zone: filter.zone, ...(filter.classSlug ? { slug: filter.classSlug } : {}) } } : {}),
    ...(filter.coachSlug
      ? { OR: [{ substitute: { slug: filter.coachSlug } }, { coach: { slug: filter.coachSlug }, substituteId: null }] }
      : {}),
  };
}

/** All sessions between two club days (inclusive), ordered by time. */
export async function getSessionsBetween(fromKey: string, toKey: string, filter: SessionFilter = {}, now: Date = new Date()) {
  await ensureRange(fromKey, toKey);
  const rows = await prisma.session.findMany({
    where: { startsAt: { gte: clubInstant(fromKey, 0), lt: clubInstant(addDays(toKey, 1), 0) }, ...whereFor(filter) },
    include: sessionInclude,
    orderBy: [{ startsAt: "asc" }],
  });
  return viewsOf(rows, now);
}

export function getWeekSessions(weekStart: string, filter: SessionFilter = {}, now: Date = new Date()) {
  return getSessionsBetween(weekStart, addDays(weekStart, 6), filter, now);
}

export function getDaySessions(dateKey: string, filter: SessionFilter = {}, now: Date = new Date()) {
  return getSessionsBetween(dateKey, dateKey, filter, now);
}

/** Upcoming sessions (not started yet) in the next `days` days. */
export async function getUpcoming(filter: SessionFilter = {}, limit = 8, days: number = BOOKING.daysAhead, now: Date = new Date()) {
  const today = dateKeyOf(now);
  const all = await getSessionsBetween(today, addDays(today, days - 1), filter, now);
  return all.filter((s) => !s.started && s.status === "scheduled").slice(0, limit);
}

/** What runs right now and what starts next today. */
export async function getLiveNow(now: Date = new Date()) {
  const today = dateKeyOf(now);
  const all = await getDaySessions(today, {}, now);
  const live = all.filter((s) => s.live && s.status === "scheduled");
  const next = all.filter((s) => !s.started && s.status === "scheduled").slice(0, 6);
  return { live, next };
}

export async function getSessionView(id: string, now: Date = new Date()): Promise<SessionView | null> {
  const row = await prisma.session.findUnique({ where: { id }, include: sessionInclude });
  if (!row) return null;
  const [view] = await viewsOf([row], now);
  return view;
}

/** People in the club right now, for the header counter: members in live classes plus a steady gym load. */
export async function peopleInClub(now: Date = new Date()): Promise<number> {
  const { minutes } = clubParts(now);
  const hours = hoursFor(dateKeyOf(now));
  if (minutes < hours.open || minutes >= hours.close) return 0;
  const { live } = await getLiveNow(now);
  const inClasses = live.reduce((sum, s) => sum + s.taken, 0);
  // Open floor: quiet before 7:00, a morning bump, a lunch bump and the evening peak.
  const curve = (m: number) =>
    18 + 70 * Math.exp(-(((m - 8 * 60) / 70) ** 2)) + 45 * Math.exp(-(((m - 13 * 60) / 60) ** 2)) + 150 * Math.exp(-(((m - 19.5 * 60) / 110) ** 2));
  return Math.max(0, Math.round(inClasses + curve(minutes)));
}
