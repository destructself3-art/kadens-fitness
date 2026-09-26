// Program builder: turns a goal, a level, the number of days and preferred times into a week of real classes
// from the schedule. Pure: works on SessionView[] so it runs the same on the server and in tests.
import { getClass } from "@/data/classes";
import { getGoal } from "@/data/goals";
import type { GoalSlug, ZoneId } from "@/data/types";
import type { SessionView } from "./session-types";
import { daysBetween, hhmmToMinutes } from "./time";
import { zoneMeta } from "./zones";

export type TimeOfDay = "morning" | "day" | "evening";
export type ProgramLevel = "new" | "regular" | "advanced";

export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  morning: "Утро, до 12:00",
  day: "День, 12:00–17:00",
  evening: "Вечер, после 17:00",
};

export const LEVEL_LABELS: Record<ProgramLevel, string> = {
  new: "Только начинаю",
  regular: "Тренируюсь время от времени",
  advanced: "Тренируюсь регулярно",
};

export type ProgramInput = {
  goal: GoalSlug;
  level: ProgramLevel;
  /** Sessions per week, 2..5 */
  days: number;
  /** Empty = any time */
  times: TimeOfDay[];
};

export type ProgramItem = {
  session: SessionView;
  /** The zone this slot of the week is meant to train */
  targetZone: ZoneId;
  /** One line: why this class is in the plan */
  why: string;
};

export type Program = {
  items: ProgramItem[];
  /** Planned zones, one per session, before matching */
  targetZones: ZoneId[];
  /** Minutes per zone across the picked classes (from class structures) */
  minutesByZone: Record<ZoneId, number>;
  /** Set when fewer classes matched than requested */
  shortfall: string | null;
};

export function timeOfDay(time: string): TimeOfDay {
  const m = hhmmToMinutes(time);
  if (m < 12 * 60) return "morning";
  if (m < 17 * 60) return "day";
  return "evening";
}

/** Splits the week's sessions between zones by the goal's mix (largest remainder). */
export function targetZones(goal: GoalSlug, level: ProgramLevel, days: number): ZoneId[] {
  const mix = getGoal(goal).zoneMix;
  const cap: ZoneId = level === "new" ? 3 : level === "regular" ? 4 : 5;
  const raw = ([1, 2, 3, 4, 5] as ZoneId[]).map((z) => ({ z, share: mix[z] * days }));
  const counts = new Map(raw.map((r) => [r.z, Math.floor(r.share)]));
  let left = days - [...counts.values()].reduce((a, b) => a + b, 0);
  for (const r of [...raw].sort((a, b) => (b.share % 1) - (a.share % 1) || b.z - a.z)) {
    if (left <= 0) break;
    counts.set(r.z, (counts.get(r.z) ?? 0) + 1);
    left--;
  }
  const out: ZoneId[] = [];
  for (const z of [1, 2, 3, 4, 5] as ZoneId[]) for (let i = 0; i < (counts.get(z) ?? 0); i++) out.push(Math.min(z, cap) as ZoneId);
  // Zone 1 alone is too little as a whole class unless the goal is health: fold it into zone 2.
  return out.map((z) => (z === 1 && goal !== "health" ? 2 : z)) as ZoneId[];
}

function allowed(session: SessionView, level: ProgramLevel): boolean {
  const cls = getClass(session.classSlug);
  if (level === "new") return cls.level !== "advanced" && cls.zone <= 3;
  if (level === "regular") return cls.level !== "advanced";
  return true;
}

export function buildProgram(sessions: SessionView[], input: ProgramInput, today: string): Program {
  const goal = getGoal(input.goal);
  const days = Math.min(5, Math.max(2, Math.round(input.days)));
  const zones = targetZones(input.goal, input.level, days);
  const pool = sessions.filter(
    (s) => s.bookable && s.left > 0 && allowed(s, input.level) && (input.times.length === 0 || input.times.includes(timeOfDay(s.time))),
  );

  const chosen: ProgramItem[] = [];
  const usedDays = new Map<number, ZoneId>();
  // Hard sessions first: they have the fewest options and need rest days around them.
  for (const target of [...zones].sort((a, b) => b - a)) {
    let best: { s: SessionView; score: number } | null = null;
    for (const s of pool) {
      const day = daysBetween(today, s.dateKey);
      if (usedDays.has(day) || chosen.some((c) => c.session.id === s.id)) continue;
      const diff = Math.abs(s.zone - target);
      if (diff > 2) continue;
      let score = diff === 0 ? 0 : diff === 1 ? 3 : 8;
      const rank = goal.classes.indexOf(s.classSlug);
      score += rank === -1 ? 7 : rank * 0.8;
      for (const [d, z] of usedDays) {
        const gap = Math.abs(d - day);
        if (gap === 1) score += z >= 4 && s.zone >= 4 ? 6 : 2;
      }
      if (chosen.some((c) => c.session.classSlug === s.classSlug)) score += 3;
      if (s.left <= 2) score += 1;
      score += day * 0.05;
      if (!best || score < best.score) best = { s, score };
    }
    if (!best) continue;
    usedDays.set(daysBetween(today, best.s.dateKey), best.s.zone);
    chosen.push({ session: best.s, targetZone: target, why: whyLine(best.s, target, input.goal) });
  }
  chosen.sort((a, b) => a.session.startsAt.localeCompare(b.session.startsAt));

  const minutesByZone: Record<ZoneId, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const item of chosen) for (const phase of getClass(item.session.classSlug).structure) minutesByZone[phase.zone] += phase.minutes;

  const shortfall =
    chosen.length < days
      ? `Под выбранное время нашлось ${chosen.length} из ${days} занятий. Добавьте ещё одно время дня, и неделя соберётся целиком.`
      : null;
  return { items: chosen, targetZones: zones, minutesByZone, shortfall };
}

function whyLine(s: SessionView, target: ZoneId, goal: GoalSlug): string {
  const z = zoneMeta(target);
  const reason: Record<GoalSlug, Partial<Record<ZoneId, string>>> = {
    lean: { 2: "длинная работа в базе, жир как топливо", 3: "темп, который сжигает больше всего за час", 4: "интервалы, после которых обмен веществ разогнан ещё несколько часов", 5: "короткие рывки на максимум" },
    endurance: { 2: "сердце учится качать больше крови за удар", 3: "темповая работа на экономичность", 4: "учимся держать высокий темп дольше", 5: "рывки для запаса скорости" },
    strength: { 1: "подвижность, без которой сила не растёт", 2: "техника и объём под контролем пульса", 3: "силовая выносливость", 4: "мощность и взрывная работа", 5: "максимальные усилия" },
    health: { 1: "мягкое восстановление и подвижность суставов", 2: "лёгкая аэробная работа для сердца и сосудов", 3: "немного темпа, чтобы тренировать сердце" },
  };
  return `Z${z.id} ${z.name}: ${reason[goal][target] ?? z.effect.toLowerCase()}`;
}
