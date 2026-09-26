// Pure helpers for the class pages: phase timeline, minutes per zone, related classes, room names, title sizes.
import type { CSSProperties } from "react";
import type { ClassPhase, ClassType, Space, ZoneId } from "@/data/types";
import { formatDay, relativeDayLabel } from "@/lib/time";

export type TimedPhase = ClassPhase & { start: number; end: number };

/** Phases with their start and end minute from the beginning of the class. */
export function timeline(structure: ClassPhase[]): TimedPhase[] {
  let t = 0;
  return structure.map((p) => {
    const start = t;
    t += p.minutes;
    return { ...p, start, end: t };
  });
}

/** Minutes spent in each zone, Z1..Z5 (zero where the class never goes). */
export function minutesByZone(structure: ClassPhase[]): Record<ZoneId, number> {
  const out: Record<ZoneId, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const p of structure) out[p.zone] += p.minutes;
  return out;
}

/** Axis ticks every 10 minutes (15 for long classes), always ending on the last minute. */
export function minuteTicks(total: number): number[] {
  const step = total > 60 ? 15 : 10;
  const ticks: number[] = [];
  for (let t = 0; t < total; t += step) ticks.push(t);
  // Drop a regular tick that would crowd the final one.
  if (ticks.length > 1 && total - ticks[ticks.length - 1] < step * 0.6) ticks.pop();
  ticks.push(total);
  return ticks;
}

/** Classes that share a goal with `cls`: most shared goals first, then the closest zone. */
export function relatedClasses(cls: ClassType, all: ClassType[], limit = 3): ClassType[] {
  return all
    .filter((c) => c.slug !== cls.slug)
    .map((c, order) => ({ c, order, shared: c.goals.filter((g) => cls.goals.includes(g)).length, gap: Math.abs(c.zone - cls.zone) }))
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared || a.gap - b.gap || a.order - b.order)
    .slice(0, limit)
    .map((x) => x.c);
}

/** Width of one uppercase Science Gothic letter at the narrow stretch, in em, with a little margin. */
const LETTER_EM = 0.74;

/** Longest unbreakable run of letters: lines may break at spaces and after a hyphen («Бокс-/интервалы»). */
export const longestWord = (text: string) => Math.max(...text.split(/[\s-]+/).map((w) => w.length));

/** The value of the --fit variable: how many em the longest word of `text` takes at the narrow stretch. */
export const fitVar = (text: string) => ({ "--fit": (LETTER_EM * longestWord(text)).toFixed(2) }) as CSSProperties;

/**
 * Hero title that always fits and is as large as the longest word allows: «Йога» fills a phone screen,
 * «Функциональные петли» shrinks to fit. Phones and tablets use the page width; from lg the hero shares
 * the row with a 360 px card.
 */
export function heroTitleFit(title: string): { className: string; style: CSSProperties } {
  return {
    className:
      "leading-[0.84] text-[length:min(7.5rem,calc((100vw_-_2*clamp(16px,4vw,48px))/var(--fit)))] md:text-[length:min(11rem,calc((100vw_-_2*clamp(16px,4vw,48px))/var(--fit)))] lg:text-[length:min(9rem,10vw,calc((min(100vw,1360px)_-_2*clamp(16px,4vw,48px)_-_416px)/var(--fit)))]",
    style: fitVar(title),
  };
}

/** Section heading size for a room name: «Вираж» can be huge, «Функциональная зона» cannot. */
export const roomHeadingSize = (name: string) => (longestWord(name) <= 10 ? "text-d-2" : "text-d-3");

/** Short name of a room: studios and the pool have proper names in quotes, other zones a plain one. */
export function roomName(space: Space): string {
  return space.kind === "studio" || space.slug === "pool" ? `«${space.name}»` : space.name;
}

/** Full name of a room for running text: "Сайкл-студия «Вираж»", "Бассейн «Глубина»", "Кардиозона". */
export function roomTitle(space: Space): string {
  if (space.kind === "studio") return `${space.label} «${space.name}»`;
  if (space.slug === "pool") return `Бассейн «${space.name}»`;
  return space.name;
}

/**
 * Day label for a session row: "сегодня", "завтра", otherwise "вс, 27 сентября".
 * The short weekday keeps the label inside the narrow time column of SessionRow on phones.
 */
export function sessionDayLabel(dateKey: string, now: Date): string {
  const day = formatDay(dateKey);
  const label = relativeDayLabel(dateKey, now);
  return label === day.long ? `${day.weekdayShort}, ${day.dayMonth}` : label;
}
