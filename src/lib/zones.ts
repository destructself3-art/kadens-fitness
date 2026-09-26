// Heart-rate model of the club. Pure functions: safe on the server and in the browser.
//   HRmax  = 208 − 0.7 × age                       (Tanaka, Monahan, Seals, 2001)
//   zone k = rest + (HRmax − rest) × [lo, hi]       (Karvonen heart-rate reserve)
//   Ruffier index = (P1 + P2 + P3 − 200) / 10       (per-minute values)
import type { ZoneId } from "@/data/types";

export type ZoneMeta = {
  id: ZoneId;
  /** "Разминка" */
  name: string;
  /** Share of heart-rate reserve, e.g. [0.5, 0.6] */
  reserve: [number, number];
  /** CSS color */
  color: string;
  /** Tailwind color key: z1..z5 */
  key: `z${ZoneId}`;
  /** Text color that reads on the zone color */
  ink: string;
  /** What it feels like, one line */
  feel: string;
  /** What it trains, one line */
  effect: string;
};

export const ZONES: ZoneMeta[] = [
  { id: 1, name: "Разминка", reserve: [0.5, 0.6], color: "#6E6862", key: "z1", ink: "#F2EFEA", feel: "Легко говорить, дыхание почти не сбивается", effect: "Восстановление, кровоток, подготовка суставов" },
  { id: 2, name: "База", reserve: [0.6, 0.7], color: "#D39A3A", key: "z2", ink: "#0C0B0A", feel: "Можно разговаривать полными фразами", effect: "Аэробная база, жир как основное топливо" },
  { id: 3, name: "Темп", reserve: [0.7, 0.8], color: "#FF7A1A", key: "z3", ink: "#0C0B0A", feel: "Говорить можно короткими фразами", effect: "Выносливость и экономичность сердца" },
  { id: 4, name: "Порог", reserve: [0.8, 0.9], color: "#FF3A24", key: "z4", ink: "#0C0B0A", feel: "Два-три слова, потом вдох", effect: "Скорость на пороге, устойчивость к лактату" },
  { id: 5, name: "Максимум", reserve: [0.9, 1.0], color: "#FFE6D2", key: "z5", ink: "#0C0B0A", feel: "Говорить не получается", effect: "Мощность и короткие рывки" },
];

export const zoneMeta = (id: number): ZoneMeta => ZONES[Math.min(5, Math.max(1, Math.round(id))) - 1];
export const zoneColor = (id: number) => zoneMeta(id).color;

/** Defaults before the visitor measures anything. */
export const DEFAULT_REST = 68;
export const DEFAULT_AGE = 30;

export const REST_MIN = 38;
export const REST_MAX = 110;
export const AGE_MIN = 14;
export const AGE_MAX = 80;

export function heartRateMax(age: number): number {
  return Math.round(208 - 0.7 * age);
}

export type ZoneRange = { id: ZoneId; lo: number; hi: number };

export function zoneRanges(rest: number, age: number): ZoneRange[] {
  const max = heartRateMax(age);
  const reserve = Math.max(0, max - rest);
  return ZONES.map((z) => ({
    id: z.id,
    lo: Math.round(rest + reserve * z.reserve[0]),
    hi: Math.round(rest + reserve * z.reserve[1]),
  }));
}

export function zoneRange(rest: number, age: number, id: number): ZoneRange {
  return zoneRanges(rest, age)[zoneMeta(id).id - 1];
}

/** Which zone a heart rate falls into (0 = below zone 1). */
export function zoneOfBpm(bpm: number, rest: number, age: number): 0 | ZoneId {
  const ranges = zoneRanges(rest, age);
  if (bpm < ranges[0].lo) return 0;
  for (const r of ranges) if (bpm < r.hi) return r.id;
  return 5;
}

/** Plain-language read of a resting heart rate. */
export function restingVerdict(rest: number): string {
  if (rest < 50) return "Пульс спортсмена на выносливость";
  if (rest < 60) return "Хорошо тренированное сердце";
  if (rest < 70) return "Норма для активного человека";
  if (rest < 80) return "Норма, есть куда расти";
  if (rest <= 90) return "Высоковато: начнём со второй зоны";
  return "Высокий пульс покоя: сначала к врачу, потом к нам";
}

// ---------- Ruffier test ----------

export type RuffierGrade = { max: number; label: string; note: string };

export const RUFFIER_GRADES: RuffierGrade[] = [
  { max: 0, label: "Отлично", note: "Сердце восстанавливается как у тренированного спортсмена." },
  { max: 5, label: "Хорошо", note: "Нагрузку держите уверенно. Можно работать в третьей и четвёртой зоне." },
  { max: 10, label: "Удовлетворительно", note: "Основа есть. Два месяца во второй зоне заметно улучшат результат." },
  { max: 15, label: "Слабо", note: "Начнём с базы: вторая зона, йога, плавание. Интервалы позже." },
  { max: Infinity, label: "Плохо", note: "Прежде чем тренироваться, покажите результат врачу." },
];

export function ruffierIndex(p1: number, p2: number, p3: number): number {
  return Math.round(((p1 + p2 + p3 - 200) / 10) * 10) / 10;
}

export function ruffierGrade(index: number): RuffierGrade {
  return RUFFIER_GRADES.find((g) => index <= g.max) ?? RUFFIER_GRADES[RUFFIER_GRADES.length - 1];
}

/** Tap-tempo: BPM from tap timestamps (ms), median of intervals. Null until 4 taps. */
export function bpmFromTaps(taps: number[]): number | null {
  if (taps.length < 4) return null;
  const intervals: number[] = [];
  for (let i = 1; i < taps.length; i++) intervals.push(taps[i] - taps[i - 1]);
  intervals.sort((a, b) => a - b);
  const median = intervals[Math.floor(intervals.length / 2)];
  const bpm = Math.round(60000 / median);
  return bpm >= REST_MIN && bpm <= 200 ? bpm : null;
}
