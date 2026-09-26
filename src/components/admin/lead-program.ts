// Reads the program JSON a visitor attaches to a lead (the program builder, the Ruffier test) into lines a coach can read.
// Tolerant on purpose: the JSON comes from the browser, so unknown keys are shown as they are and broken JSON as text.
import { GOALS } from "@/data/goals";
import { LEVEL_LABELS, TIME_OF_DAY_LABELS, type ProgramLevel, type TimeOfDay } from "@/lib/program";

export type ProgramFact = { label: string; value: string };

export type ProgramLine = {
  sessionId: string | null;
  title: string;
  /** "YYYY-MM-DD" when the JSON has a valid date */
  date: string | null;
  time: string | null;
  zone: number | null;
};

export type ParsedProgram = { kind: "program"; facts: ProgramFact[]; items: ProgramLine[] } | { kind: "raw"; text: string };

const LABELS: Record<string, string> = {
  goal: "Цель",
  level: "Опыт",
  days: "Тренировок в неделю",
  times: "Время",
  rest: "Пульс покоя",
  restingHr: "Пульс покоя",
  age: "Возраст",
  hrMax: "ЧСС макс.",
  ruffier: "Проба Руфье",
  index: "индекс",
  grade: "оценка",
  label: "оценка",
  p1: "пульс до приседаний",
  p2: "пульс сразу после",
  p3: "пульс через минуту",
  note: "заметка",
  comment: "комментарий",
};

const MAX_FACTS = 16;
const MAX_ITEMS = 14;

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

const isObject = (v: unknown): v is Record<string, Json> => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown) => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");

function goalTitle(value: string) {
  return GOALS.find((g) => g.slug === value)?.title ?? value;
}

/** Human value for one known key; null when the value says nothing. */
function knownValue(key: string, value: Json): string | null {
  if (key === "goal" && typeof value === "string") return goalTitle(value);
  if (key === "level" && typeof value === "string") return LEVEL_LABELS[value as ProgramLevel] ?? value;
  if (key === "times" && Array.isArray(value)) {
    const labels = value.map((t) => TIME_OF_DAY_LABELS[t as TimeOfDay] ?? str(t)).filter(Boolean);
    return labels.length ? labels.join("; ") : "любое";
  }
  return plain(value);
}

function plain(value: Json): string | null {
  if (value === null || value === "") return null;
  if (typeof value === "boolean") return value ? "да" : "нет";
  if (typeof value === "number") return Number.isFinite(value) ? String(Math.round(value * 10) / 10) : null;
  if (typeof value === "string") return value.slice(0, 200);
  if (Array.isArray(value) && value.every((v) => typeof v !== "object" || v === null)) {
    const parts = value.map((v) => plain(v)).filter(Boolean);
    return parts.length ? parts.join(", ") : null;
  }
  return null;
}

function line(raw: Json): ProgramLine | null {
  if (!isObject(raw)) return null;
  const title = str(raw.class) || str(raw.classTitle) || str(raw.title);
  if (!title) return null;
  const date = str(raw.date) || str(raw.dateKey);
  const time = str(raw.time);
  const zone = Number(raw.zone);
  return {
    sessionId: str(raw.sessionId) || str(raw.id) || null,
    title: title.slice(0, 80),
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
    time: /^\d{1,2}:\d{2}$/.test(time) ? time : null,
    zone: Number.isInteger(zone) && zone >= 1 && zone <= 5 ? zone : null,
  };
}

export function parseProgram(raw: string | null): ParsedProgram | null {
  const text = raw?.trim();
  if (!text) return null;
  let data: Json;
  try {
    data = JSON.parse(text) as Json;
  } catch {
    return { kind: "raw", text: text.slice(0, 1200) };
  }
  if (!isObject(data)) {
    const value = plain(data);
    return value ? { kind: "raw", text: value } : null;
  }

  const facts: ProgramFact[] = [];
  let items: ProgramLine[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (facts.length >= MAX_FACTS) break;
    if ((key === "items" || key === "sessions") && Array.isArray(value)) {
      items = value.map(line).filter((l): l is ProgramLine => l !== null).slice(0, MAX_ITEMS);
      continue;
    }
    const label = LABELS[key] ?? key;
    if (isObject(value)) {
      // One level deep: {"ruffier": {"index": 7.2, "grade": "средне"}} -> "Проба Руфье, индекс: 7.2"
      for (const [sub, subValue] of Object.entries(value)) {
        const v = knownValue(sub, subValue);
        if (v && facts.length < MAX_FACTS) facts.push({ label: `${label}, ${LABELS[sub] ?? sub}`, value: v });
      }
      continue;
    }
    const v = knownValue(key, value);
    if (v) facts.push({ label, value: v });
  }
  if (!facts.length && !items.length) return null;
  return { kind: "program", facts, items };
}

/** Goal slug from the program builder, or the visitor's own words. */
export function leadGoal(value: string | null): string | null {
  return value ? goalTitle(value) : null;
}
