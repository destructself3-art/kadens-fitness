// State of the schedule board: filters, the chosen day and the view, as they live in the URL.
// Pure and import-light (types only from data and lib), so it runs on the server page and in the client board.
import type { ClassSlug, CoachSlug, SpaceSlug, ZoneId } from "@/data/types";
import type { SessionView } from "@/lib/session-types";
import { hhmmToMinutes } from "@/lib/time";

/** Same boundaries as the program builder (src/lib/program.ts): morning < 12:00 ≤ day < 17:00 ≤ evening. */
export type DayPart = "morning" | "day" | "evening";
export const DAY_PARTS: DayPart[] = ["morning", "day", "evening"];
export const DAY_PART_LABELS: Record<DayPart, { short: string; range: string }> = {
  morning: { short: "Утро", range: "до 12:00" },
  day: { short: "День", range: "12:00–17:00" },
  evening: { short: "Вечер", range: "после 17:00" },
};

export function dayPartOf(time: string): DayPart {
  const m = hhmmToMinutes(time);
  if (m < 12 * 60) return "morning";
  if (m < 17 * 60) return "day";
  return "evening";
}

export type BoardView = "list" | "grid";

export type BoardFilters = {
  studios: SpaceSlug[];
  zones: ZoneId[];
  cls: ClassSlug | null;
  coach: CoachSlug | null;
  parts: DayPart[];
  /** Only classes with places left that can still be joined */
  free: boolean;
};

export type BoardState = BoardFilters & {
  /** Zone to highlight: matching classes get a ring, the rest dim */
  highlight: ZoneId | null;
  day: string;
  view: BoardView;
};

export const EMPTY_FILTERS: BoardFilters = { studios: [], zones: [], cls: null, coach: null, parts: [], free: false };

/** How many filters are on: every chip counts, a select or the toggle counts once. */
export const activeFilterCount = (f: BoardFilters) =>
  f.studios.length + f.zones.length + (f.cls ? 1 : 0) + (f.coach ? 1 : 0) + f.parts.length + (f.free ? 1 : 0);

export const hasFreePlaces = (s: SessionView) => s.status === "scheduled" && !s.started && s.left > 0;

export function matchesFilters(s: SessionView, f: BoardFilters): boolean {
  if (f.studios.length && !f.studios.includes(s.studioSlug)) return false;
  if (f.zones.length && !f.zones.includes(s.zone)) return false;
  if (f.cls && s.classSlug !== f.cls) return false;
  if (f.coach && s.coachSlug !== f.coach) return false;
  if (f.parts.length && !f.parts.includes(dayPartOf(s.time))) return false;
  if (f.free && !hasFreePlaces(s)) return false;
  return true;
}

type Getter = (key: string) => string | null | undefined;
const list = (value: string | null | undefined) => (value ? value.split(",").map((v) => v.trim()).filter(Boolean) : []);
const zoneList = (value: string | null | undefined) =>
  [...new Set(list(value).map(Number))].filter((n): n is ZoneId => Number.isInteger(n) && n >= 1 && n <= 5).sort();

/**
 * Reads the board state from URL parameters. Values are checked against what the week actually has,
 * so a stale link (a coach who is not on this week, a day from another week) quietly falls back.
 */
export function parseBoardState(get: Getter, sessions: SessionView[], days: string[], defaultDay: string): BoardState {
  const studios = new Set(sessions.map((s) => s.studioSlug));
  const classes = new Set(sessions.map((s) => s.classSlug));
  const coaches = new Set(sessions.map((s) => s.coachSlug));
  const cls = get("class");
  const coach = get("coach");
  const day = get("day");
  const hl = Number(get("hl"));
  return {
    studios: list(get("studio")).filter((v): v is SpaceSlug => studios.has(v as SpaceSlug)),
    zones: zoneList(get("zone")),
    cls: cls && classes.has(cls as ClassSlug) ? (cls as ClassSlug) : null,
    coach: coach && coaches.has(coach as CoachSlug) ? (coach as CoachSlug) : null,
    parts: list(get("time")).filter((v): v is DayPart => (DAY_PARTS as string[]).includes(v)),
    free: get("free") === "1",
    highlight: Number.isInteger(hl) && hl >= 1 && hl <= 5 ? (hl as ZoneId) : null,
    day: day && days.includes(day) ? day : defaultDay,
    view: get("view") === "grid" ? "grid" : "list",
  };
}

/** URL query for a board state. The default day and the list view are left out to keep links short. */
export function boardQuery(state: Partial<BoardState>, week: string | null, defaultDay?: string): string {
  const p = new URLSearchParams();
  if (week) p.set("week", week);
  if (state.day && state.day !== defaultDay) p.set("day", state.day);
  if (state.studios?.length) p.set("studio", state.studios.join(","));
  if (state.zones?.length) p.set("zone", state.zones.join(","));
  if (state.cls) p.set("class", state.cls);
  if (state.coach) p.set("coach", state.coach);
  if (state.parts?.length) p.set("time", state.parts.join(","));
  if (state.free) p.set("free", "1");
  if (state.highlight) p.set("hl", String(state.highlight));
  if (state.view === "grid") p.set("view", "grid");
  // URLSearchParams encodes commas; they are safe in a query and read better.
  return p.toString().replace(/%2C/g, ",");
}
