// Filters of the /classes catalogue. Pure and data-free: the server passes the options in,
// so the client bundle never pulls the content files.
import type { GoalSlug, Level, SpaceSlug, ZoneId } from "@/data/types";

/** The visitor's experience, the same three steps as in the program builder. */
export type Experience = "new" | "regular" | "advanced";

export type ClassFilters = {
  zone: ZoneId | null;
  goal: GoalSlug | null;
  studio: SpaceSlug | null;
  level: Experience | null;
};

export type FilterKey = keyof ClassFilters;

/** What the explorer needs to know about a class to filter it. */
export type FilterableClass = {
  slug: string;
  zone: ZoneId;
  goals: GoalSlug[];
  studio: SpaceSlug;
  level: Level;
};

export type FilterOption<V extends string | number> = { value: V; label: string };

export type FilterOptions = {
  goals: FilterOption<GoalSlug>[];
  studios: FilterOption<SpaceSlug>[];
  levels: FilterOption<Experience>[];
};

export const NO_FILTERS: ClassFilters = { zone: null, goal: null, studio: null, level: null };

/** Class levels that suit each experience step. */
const FITS: Record<Experience, Level[]> = {
  new: ["any", "beginner"],
  regular: ["any", "beginner", "intermediate"],
  advanced: ["any", "beginner", "intermediate", "advanced"],
};

type Params = { get(name: string): string | null };

/**
 * Reads filters from URL search params, keeping only values the options know about.
 * `known` lists valid goals and studios; zones and levels are fixed.
 */
export function parseFilters(params: Params, known: { goals: string[]; studios: string[] }): ClassFilters {
  const zone = Number(params.get("zone"));
  const goal = params.get("goal");
  const studio = params.get("studio");
  const level = params.get("level");
  return {
    zone: Number.isInteger(zone) && zone >= 1 && zone <= 5 ? (zone as ZoneId) : null,
    goal: goal && known.goals.includes(goal) ? (goal as GoalSlug) : null,
    studio: studio && known.studios.includes(studio) ? (studio as SpaceSlug) : null,
    level: level && level in FITS ? (level as Experience) : null,
  };
}

/** "?zone=3&goal=lean" or "" when nothing is chosen. Order is stable so URLs stay shareable. */
export function filtersToQuery(f: ClassFilters): string {
  const q = new URLSearchParams();
  if (f.zone) q.set("zone", String(f.zone));
  if (f.goal) q.set("goal", f.goal);
  if (f.studio) q.set("studio", f.studio);
  if (f.level) q.set("level", f.level);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function matches(c: FilterableClass, f: ClassFilters): boolean {
  if (f.zone && c.zone !== f.zone) return false;
  if (f.goal && !c.goals.includes(f.goal)) return false;
  if (f.studio && c.studio !== f.studio) return false;
  if (f.level && !FITS[f.level].includes(c.level)) return false;
  return true;
}

export const activeCount = (f: ClassFilters) => Object.values(f).filter((v) => v !== null).length;
