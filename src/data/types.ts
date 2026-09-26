// Content types for src/data. Components only render these; texts never live in components.

/** Heart-rate zone, 1 (warm-up) .. 5 (max). Colors and names live in src/lib/zones.ts. */
export type ZoneId = 1 | 2 | 3 | 4 | 5;

/** Goal slugs used by the program builder, classes and reviews. */
export type GoalSlug = "lean" | "endurance" | "strength" | "health";

export type SpaceSlug =
  | "cycle"
  | "ring"
  | "forge"
  | "dance"
  | "yoga"
  | "reformer"
  | "pool"
  | "gym"
  | "functional"
  | "cardio"
  | "spa"
  | "kids"
  | "lobby"
  | "lockers"
  | "fitbar";

export type ClassSlug =
  | "cycle"
  | "boxing"
  | "hiit"
  | "functional"
  | "dance"
  | "yoga"
  | "stretching"
  | "reformer"
  | "aqua"
  | "swim"
  | "strength"
  | "run"
  | "row"
  | "trx";

export type CoachSlug =
  | "timur-galiev"
  | "marina-kim"
  | "aidar-khasanov"
  | "dina-sabirova"
  | "artem-lebedev"
  | "alina-safina"
  | "oleg-vorontsov"
  | "polina-orlova"
  | "ruslan-mukhametov"
  | "evelina-sharipova"
  | "kseniya-belova"
  | "igor-semenov";

export type Fact = { value: string; label: string };

export interface Space {
  slug: SpaceSlug;
  /** Proper name, e.g. "Вираж". Zones without a proper name use a plain one, e.g. "Тренажёрный зал". */
  name: string;
  /** studio: group classes are booked here; zone: open space or service area */
  kind: "studio" | "zone";
  /** What it is, e.g. "Сайкл-студия" */
  label: string;
  floor: 1 | 2 | 3;
  /** Square metres */
  area: number;
  /** Places per class (studios only) */
  capacity?: number;
  /** Shot id of the room photo */
  photo: string;
  /** One line under the name */
  mood: string;
  /** 2–3 paragraphs */
  description: string[];
  /** Equipment and features, 4–8 short items */
  features: string[];
  /** Opening hours if they differ from the club, e.g. "ежедневно 07:00–22:00" */
  hours?: string;
  /** 3 facts in numbers */
  facts: Fact[];
}

export type Level = "any" | "beginner" | "intermediate" | "advanced";

/** One phase of a class; the phases draw the class heart-rate curve. */
export interface ClassPhase {
  title: string;
  minutes: number;
  zone: ZoneId;
}

export interface ClassType {
  slug: ClassSlug;
  title: string;
  /** One line for cards */
  short: string;
  studio: SpaceSlug;
  /** The zone the class is built around */
  zone: ZoneId;
  durationMin: number;
  level: Level;
  /** Estimated kcal per class, [min, max] */
  kcal: [number, number];
  /** Shot id, class-* */
  photo: string;
  /** 2–3 paragraphs */
  description: string[];
  /** Phases in order; minutes add up to durationMin */
  structure: ClassPhase[];
  benefits: string[];
  /** What to bring, 2–4 items */
  bring: string[];
  coaches: CoachSlug[];
  goals: GoalSlug[];
}

export interface CoachStat {
  /** e.g. "Сила", "Выносливость", "Техника" */
  label: string;
  /** 40..99, like a sports trading card */
  value: number;
}

export interface Coach {
  slug: CoachSlug;
  name: string;
  /** e.g. "Тренер по боксу" */
  role: string;
  /** The coach's usual heart-rate zone; tints the card and the rim light on the photo */
  zone: ZoneId;
  /** Shot id, coach-* */
  photo: string;
  /** Year the coach joined the club */
  since: number;
  experienceYears: number;
  /** Resting heart rate, a fun fact for the card */
  restingHr: number;
  classes: ClassSlug[];
  specialties: string[];
  certifications: string[];
  /** 2–3 paragraphs */
  bio: string[];
  quote: string;
  /** Exactly 5 stats */
  stats: CoachStat[];
  /** Personal training price per session in rubles; null if the coach does not take personal clients */
  personalPrice: number | null;
}

export interface Goal {
  slug: GoalSlug;
  title: string;
  short: string;
  /** Shot id, goal-* */
  photo: string;
  /** Share of weekly training time per zone, sums to 1 */
  zoneMix: Record<ZoneId, number>;
  /** Classes the program builder prefers for this goal, in order */
  classes: ClassSlug[];
  description: string;
}

export interface Membership {
  slug: "morning" | "rhythm" | "pro" | "family" | "day-pass" | "trial-week";
  name: string;
  tagline: string;
  /** Rubles per month when paying monthly; for one-off passes the full price */
  price: number;
  /** Rubles per month when paying for a year; null if not offered */
  priceYearly: number | null;
  /** e.g. "в месяц", "разово", "7 дней" */
  unit: string;
  hours: string;
  includes: string[];
  excludes: string[];
  freezeDays: number;
  guestVisits: number;
  personalSessions: number;
  spa: boolean;
  reformer: boolean;
  kidsClub: boolean;
  highlight?: boolean;
}

export interface ReviewMetric {
  label: string;
  before: number;
  after: number;
  unit: string;
}

export interface Review {
  id: string;
  /** First name and age, e.g. "Алсу, 34" */
  name: string;
  goal: GoalSlug;
  months: number;
  text: string;
  metric: ReviewMetric;
  classes: ClassSlug[];
  coach?: CoachSlug;
}

export type FaqCategory = "start" | "booking" | "pulse" | "memberships" | "club";

export interface FaqItem {
  category: FaqCategory;
  q: string;
  a: string;
}

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string; author?: string }
  | { type: "tip"; text: string }
  /** Embeds the personal zones widget */
  | { type: "zones" };

export interface Article {
  slug: string;
  title: string;
  lead: string;
  category: "Пульс" | "Тренировки" | "Восстановление" | "Питание";
  readMinutes: number;
  /** ISO date */
  date: string;
  /** Shot id for the cover */
  cover: string;
  author: CoachSlug;
  body: ArticleBlock[];
}
