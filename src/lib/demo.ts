import "server-only";
import { getClass } from "@/data/classes";
import type { ClassSlug, CoachSlug } from "@/data/types";
import { prisma } from "./prisma";
import { addDays, clubInstant, clubParts, isoDayOf } from "./time";

// Portfolio demo mode (DEMO_BOOKINGS=true): every generated week gets believable bookings, a couple of
// coach substitutions and one cancelled class, and the admin panel gets a stream of leads.
// Everything is deterministic per week and stored like real data, so real bookings mix in naturally.

const FIRST = [
  "Алсу", "Тимур", "Анна", "Ильдар", "Мария", "Дмитрий", "Гузель", "Артём", "Ксения", "Руслан", "Екатерина", "Айрат",
  "Софья", "Никита", "Лилия", "Павел", "Динара", "Олег", "Юлия", "Марат", "Полина", "Азат", "Вера", "Кирилл",
  "Эльмира", "Сергей", "Карина", "Булат", "Ольга", "Роман", "Лейсан", "Глеб", "Регина", "Ильнур", "Дарья", "Игорь",
];
const LAST_INITIAL = "АБВГДЕЗИКЛМНОПРСТФХШЮЯ";

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

const demoOn = () => process.env.DEMO_BOOKINGS === "true";

/** How full a class usually is, by time of day and format. */
function popularity(minutes: number, weekend: boolean, cls: ClassSlug): number {
  let base: number;
  if (weekend) base = minutes < 12 * 60 + 30 ? 0.82 : 0.55;
  else if (minutes < 9 * 60) base = 0.62;
  else if (minutes < 12 * 60) base = 0.38;
  else if (minutes < 15 * 60) base = 0.5;
  else if (minutes < 21 * 60) base = 0.9;
  else base = 0.62;
  const format: Partial<Record<ClassSlug, number>> = { reformer: 1.12, cycle: 1.05, yoga: 0.95, swim: 0.7, strength: 0.85, trx: 0.8 };
  return base * (format[cls] ?? 1);
}

const weeksDone = new Set<string>();

export async function ensureDemoWeek(weekStart: string, now: Date = new Date()) {
  if (!demoOn() || weeksDone.has(weekStart)) return;
  weeksDone.add(weekStart);
  const from = clubInstant(weekStart, 0);
  const to = clubInstant(addDays(weekStart, 7), 0);
  const already = await prisma.booking.count({ where: { source: "demo", session: { startsAt: { gte: from, lt: to } } } });
  if (already > 0) return;

  const sessions = await prisma.session.findMany({
    where: { startsAt: { gte: from, lt: to } },
    include: { classType: { select: { slug: true } }, coach: { select: { slug: true } } },
    orderBy: { startsAt: "asc" },
  });
  if (!sessions.length) return;
  const random = rng(hash(`kadens:${weekStart}`));
  const coaches = await prisma.coach.findMany({ select: { id: true, slug: true } });
  const coachId = new Map(coaches.map((c) => [c.slug, c.id]));

  // Two substitutions and one cancelled class in the future part of the week.
  const future = sessions.filter((s) => s.startsAt.getTime() > now.getTime() + 3 * 3600_000);
  const cancelled = new Set<string>();
  if (future.length > 20) {
    const pick = (salt: number) => future[Math.floor(rng(hash(`${weekStart}:${salt}`))() * future.length)];
    for (const salt of [1, 2]) {
      const s = pick(salt);
      const alt = getClass(s.classType.slug as ClassSlug).coaches.find((c: CoachSlug) => c !== s.coach.slug);
      if (alt && !s.substituteId) {
        await prisma.session.update({ where: { id: s.id }, data: { substituteId: coachId.get(alt), note: "Замена тренера" } });
      }
    }
    const c = pick(3);
    if (!cancelled.has(c.id)) {
      cancelled.add(c.id);
      await prisma.session.update({
        where: { id: c.id },
        data: { status: "cancelled", note: "Отменено: студию готовят к турниру. Приходите в соседний слот." },
      });
    }
  }

  const rows: { code: string; sessionId: string; name: string; phone: string; status: string; seat: number | null; source: string; createdAt: Date }[] = [];
  for (const s of sessions) {
    if (cancelled.has(s.id) || s.status === "cancelled") continue;
    const { minutes, isoDay } = clubParts(s.startsAt);
    const weekend = isoDay >= 6;
    const ratio = Math.min(1.18, Math.max(0.12, popularity(minutes, weekend, s.classType.slug as ClassSlug) * (0.72 + random() * 0.56)));
    let people = Math.round(s.capacity * ratio);
    const soon = s.startsAt.getTime() - now.getTime();
    // Classes in the next two days keep a few places open more often, so booking always has something to show.
    if (soon > 0 && soon < 48 * 3600_000 && people >= s.capacity && random() < 0.45) people = s.capacity - 1 - Math.floor(random() * 3);
    const ended = s.endsAt.getTime() <= now.getTime();
    const salt = hash(s.id) % 1000;
    for (let i = 1; i <= people; i++) {
      const onWaitlist = i > s.capacity;
      const status = onWaitlist ? (ended ? "cancelled" : "waitlist") : ended ? (random() < 0.11 ? "no_show" : "attended") : "booked";
      rows.push({
        code: `DM-${hash(`${s.id}:${i}`).toString(36).toUpperCase().padStart(7, "0").slice(0, 7)}`,
        sessionId: s.id,
        name: `${FIRST[Math.floor(random() * FIRST.length)]} ${LAST_INITIAL[Math.floor(random() * LAST_INITIAL.length)]}.`,
        phone: `7000${String(salt).padStart(3, "0")}${String(i).padStart(4, "0")}`,
        status,
        seat: onWaitlist ? null : i,
        source: "demo",
        createdAt: new Date(s.startsAt.getTime() - (2 + random() * 120) * 3600_000),
      });
    }
  }
  for (let i = 0; i < rows.length; i += 500) {
    await prisma.booking.createMany({ data: rows.slice(i, i + 500) }).catch(async () => {
      for (const r of rows.slice(i, i + 500)) await prisma.booking.create({ data: r }).catch(() => undefined);
    });
  }
}

const LEAD_SAMPLES = [
  { kind: "trial", name: "Алсу Гарипова", goal: "lean", age: 34, restingHr: 76, comment: "После родов, хочу аккуратно вернуться" },
  { kind: "program", name: "Тимур Ахметов", goal: "endurance", age: 29, restingHr: 58, comment: "Готовлюсь к полумарафону в мае" },
  { kind: "corporate", name: "Ольга Сергеева", company: "ИТ-компания, 120 сотрудников", comment: "Интересуют корпоративные карты и занятия в обед" },
  { kind: "trial", name: "Ильдар Юсупов", goal: "strength", age: 41, restingHr: 71, comment: null },
  { kind: "kids", name: "Гузель Хасанова", comment: "Двое детей, 5 и 8 лет, будни вечером" },
  { kind: "membership", name: "Дмитрий Орлов", plan: "rhythm", comment: "Годовой, можно ли в рассрочку" },
  { kind: "program", name: "Ксения Миронова", goal: "health", age: 52, restingHr: 69, comment: "Болит поясница, врач разрешил плавание" },
  { kind: "callback", name: "Руслан Идрисов", comment: "Перезвонить после 18:00" },
  { kind: "trial", name: "Мария Павлова", goal: "endurance", age: 26, restingHr: 64, comment: null },
  { kind: "membership", name: "Айрат Сафин", plan: "family", comment: "Семейный на двоих, ребёнку 6 лет" },
  { kind: "program", name: "Екатерина Белова", goal: "lean", age: 38, restingHr: 81, comment: "Хочу вечерние занятия, 3 раза в неделю" },
  { kind: "corporate", name: "Марат Нуриев", company: "Логистический центр", comment: "Нужен договор на 40 карт" },
  { kind: "trial", name: "Лилия Каримова", goal: "health", age: 45, restingHr: 66, comment: "Интересует пилатес на реформерах" },
  { kind: "membership", name: "Павел Лебедев", plan: "pro", comment: null },
] as const;

let leadsDone = false;

export async function ensureDemoLeads(now: Date = new Date()) {
  if (!demoOn() || leadsDone) return;
  leadsDone = true;
  if ((await prisma.lead.count({ where: { source: "demo" } })) > 0) return;
  const random = rng(hash("kadens:leads"));
  const statuses = ["new", "new", "new", "contacted", "contacted", "converted", "lost"];
  await prisma.lead.createMany({
    data: LEAD_SAMPLES.map((l, i) => {
      const created = new Date(now.getTime() - (i * 19 + Math.floor(random() * 14)) * 3600_000);
      return {
        kind: l.kind,
        name: l.name,
        phone: `7917${String(hash(l.name) % 10_000_000).padStart(7, "0")}`,
        company: "company" in l ? l.company : null,
        goal: "goal" in l ? l.goal : null,
        age: "age" in l ? l.age : null,
        restingHr: "restingHr" in l ? l.restingHr : null,
        plan: "plan" in l ? l.plan : null,
        comment: l.comment,
        status: i < 4 ? "new" : statuses[Math.floor(random() * statuses.length)],
        source: "demo",
        createdAt: created,
      };
    }),
  });
}

/** For weekday-dependent copy in demo notes. */
export const isWeekend = (dateKey: string) => isoDayOf(dateKey) >= 6;
