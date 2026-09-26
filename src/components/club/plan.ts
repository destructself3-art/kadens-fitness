// Floor plans of the club: a stylized schematic, not an architect's drawing.
// Inside one floor every room's drawn area is proportional to its real area in m².
// Pure functions: safe on the server and in the browser.
import type { Space, SpaceSlug } from "@/data/types";

export type Floor = 1 | 2 | 3;
export const FLOORS: Floor[] = [1, 2, 3];

/** The part of a space the plan and the preview card need (no long texts in the client bundle). */
export type PlanSpace = Pick<Space, "slug" | "name" | "kind" | "label" | "floor" | "area" | "capacity" | "photo" | "mood" | "hours">;

export function toPlanSpace(s: Space): PlanSpace {
  return { slug: s.slug, name: s.name, kind: s.kind, label: s.label, floor: s.floor, area: s.area, capacity: s.capacity, photo: s.photo, mood: s.mood, hours: s.hours };
}

/** «Вираж» for studios, plain names for zones, the same rule as SpaceCard. */
export function spaceTitle(s: Pick<Space, "kind" | "name">): string {
  return s.kind === "studio" ? `«${s.name}»` : s.name;
}

export function parseFloor(value: unknown): Floor {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return n === 2 || n === 3 ? n : 1;
}

// ---------- Blueprints ----------

/** A hall or staircase: drawn hatched, not clickable. */
type Hall = { hall: string; area: number };
type Cell = SpaceSlug | Hall;

type Blueprint = {
  width: number;
  height: number;
  /** Rows from the back of the building (top) to the street (bottom) */
  rows: Cell[][];
  /** A corridor band is drawn after these row indexes */
  corridorAfter: number[];
  /** The room with the street entrance under it */
  entrance?: SpaceSlug;
  /** The room whose top wall is a panoramic window */
  windows?: SpaceSlug;
};

export type Variant = "wide" | "tall";

const BLUEPRINTS: Record<Floor, Record<Variant, Blueprint>> = {
  1: {
    wide: {
      width: 1000,
      height: 600,
      rows: [
        ["gym", "pool", "spa"],
        ["functional", "forge", "ring", "lobby", "lockers"],
      ],
      corridorAfter: [0],
      entrance: "lobby",
    },
    tall: {
      width: 600,
      height: 860,
      rows: [["gym"], ["pool", "spa"], ["functional", "lockers"], ["forge", "ring", "lobby"]],
      corridorAfter: [1],
      entrance: "lobby",
    },
  },
  2: {
    wide: {
      width: 1000,
      height: 600,
      rows: [
        ["cycle", "dance"],
        [{ hall: "Холл", area: 180 }, "kids"],
      ],
      corridorAfter: [0],
    },
    tall: {
      width: 600,
      height: 640,
      rows: [
        ["cycle", "dance"],
        [{ hall: "Холл", area: 180 }, "kids"],
      ],
      corridorAfter: [0],
    },
  },
  3: {
    wide: {
      width: 1000,
      height: 600,
      rows: [["cardio"], ["yoga", "reformer", "fitbar"]],
      corridorAfter: [0],
      windows: "cardio",
    },
    tall: {
      width: 600,
      height: 680,
      rows: [["cardio"], ["yoga", "reformer", "fitbar"]],
      corridorAfter: [0],
      windows: "cardio",
    },
  },
};

// ---------- Layout ----------

export type Box = { x: number; y: number; w: number; h: number };
export type PlanRoom = Box & { slug: SpaceSlug };
export type PlanHall = Box & { label: string };

export type PlanLayout = {
  width: number;
  height: number;
  /** Outer wall */
  outline: Box;
  rooms: PlanRoom[];
  halls: PlanHall[];
  corridors: Box[];
  /** Point on the outer wall under the entrance room */
  entrance: { x: number; y: number } | null;
  /** Top wall segment of the panoramic room */
  windows: { x1: number; x2: number; y: number } | null;
};

const PAD = 18;
const GAP = 7;
const CORRIDOR = 44;

const isHall = (c: Cell): c is Hall => typeof c !== "string";

/**
 * Rows share the height in proportion to their total area, cells share the row width in proportion to their area,
 * so every cell ends up with (almost exactly, walls aside) the same m² per drawn unit.
 */
export function planLayout(floor: Floor, variant: Variant, areaOf: (slug: SpaceSlug) => number): PlanLayout {
  const bp = BLUEPRINTS[floor][variant];
  const cellArea = (c: Cell) => (isHall(c) ? c.area : areaOf(c));
  const rowAreas = bp.rows.map((row) => row.reduce((s, c) => s + cellArea(c), 0));
  const total = rowAreas.reduce((s, a) => s + a, 0);

  const innerW = bp.width - PAD * 2;
  const separators = bp.rows.length - 1;
  const corridorCount = bp.corridorAfter.length;
  const rowsH = bp.height - PAD * 2 - corridorCount * CORRIDOR - (separators - corridorCount) * GAP;

  const rooms: PlanRoom[] = [];
  const halls: PlanHall[] = [];
  const corridors: Box[] = [];
  let y = PAD;

  bp.rows.forEach((row, ri) => {
    const h = (rowAreas[ri] / total) * rowsH;
    const usableW = innerW - (row.length - 1) * GAP;
    let x = PAD;
    for (const cell of row) {
      const w = (cellArea(cell) / rowAreas[ri]) * usableW;
      const box = { x: round(x), y: round(y), w: round(w), h: round(h) };
      if (isHall(cell)) halls.push({ ...box, label: cell.hall });
      else rooms.push({ ...box, slug: cell });
      x += w + GAP;
    }
    y += h;
    if (ri < bp.rows.length - 1) {
      if (bp.corridorAfter.includes(ri)) {
        corridors.push({ x: PAD, y: round(y + GAP), w: innerW, h: CORRIDOR - GAP * 2 });
        y += CORRIDOR;
      } else {
        y += GAP;
      }
    }
  });

  const entranceRoom = bp.entrance ? rooms.find((r) => r.slug === bp.entrance) : undefined;
  const windowRoom = bp.windows ? rooms.find((r) => r.slug === bp.windows) : undefined;

  return {
    width: bp.width,
    height: bp.height,
    outline: { x: PAD / 2, y: PAD / 2, w: bp.width - PAD, h: bp.height - PAD },
    rooms,
    halls,
    corridors,
    entrance: entranceRoom ? { x: round(entranceRoom.x + entranceRoom.w / 2), y: bp.height - PAD / 2 } : null,
    windows: windowRoom ? { x1: windowRoom.x + 24, x2: windowRoom.x + windowRoom.w - 24, y: PAD / 2 } : null,
  };
}

const round = (n: number) => Math.round(n * 10) / 10;

// ---------- Labels ----------

/** Width of one uppercase Science Gothic letter at the plan's width setting (wdth 70, weight 800), in font-size units: measured 0.62–0.76. */
const CHAR = 0.77;

/** Picks one or two lines and the biggest font size that fits the room. */
export function fitLabel(text: string, box: Box, base: number): { lines: string[]; size: number } {
  const options: string[][] = [[text]];
  const words = text.split(" ");
  if (words.length > 1) {
    let best: string[] = [];
    for (let i = 1; i < words.length; i++) {
      const pair = [words.slice(0, i).join(" "), words.slice(i).join(" ")];
      if (!best.length || Math.max(...pair.map((l) => l.length)) < Math.max(...best.map((l) => l.length))) best = pair;
    }
    options.push(best);
  }
  let pick = options[0];
  let size = 0;
  for (const lines of options) {
    const longest = Math.max(...lines.map((l) => l.length));
    const s = Math.min(base, (box.w - 30) / (longest * CHAR), (box.h * 0.42) / lines.length);
    if (s > size + 1) {
      size = s;
      pick = lines;
    }
  }
  return { lines: pick, size: Math.max(13, Math.floor(size)) };
}

// ---------- Hours ----------

/** "Пн–Пт 09:00–21:00, Сб–Вс 10:00–19:00" -> [{ days: "Пн–Пт", time: "09:00–21:00" }, ...] */
export function splitHours(label: string): { days: string; time: string }[] {
  return label.split(/,\s*/).map((part) => {
    const m = part.match(/^(.*?)\s*(\d{2}:\d{2}\s*[–-]\s*\d{2}:\d{2})$/);
    return m ? { days: m[1], time: m[2] } : { days: part, time: "" };
  });
}
