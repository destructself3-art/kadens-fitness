// Pure helpers for the coaches pages. Server-safe and client-safe (no hooks, no server-only imports).
import type { CSSProperties } from "react";
import { fitVar } from "@/components/classes/helpers";
import { getClass } from "@/data/classes";
import { COACHES } from "@/data/coaches";
import type { ClassSlug, Coach, CoachSlug } from "@/data/types";

export const HEAD_COACH: CoachSlug = "igor-semenov";

export function findCoach(slug: string): Coach | undefined {
  return COACHES.find((c) => c.slug === slug);
}

/** The whole team, head coach first, the rest in data order. */
export function teamHeadFirst(): Coach[] {
  return [...COACHES].sort((a, b) => Number(b.slug === HEAD_COACH) - Number(a.slug === HEAD_COACH));
}

/** Position of a coach in the team list, 1-based: the number on the back of the card. */
export function cardNumber(coach: Coach): number {
  return teamHeadFirst().findIndex((c) => c.slug === coach.slug) + 1;
}

/** Class titles a coach teaches, in the coach's order. */
export const classTitles = (coach: Coach) => coach.classes.map((slug: ClassSlug) => getClass(slug).title);

/**
 * Coaches to suggest next: shared classes first, then the closest heart-rate zone, then team order.
 * Deterministic, so the server render and every reload agree.
 */
export function relatedCoaches(coach: Coach, count = 3): Coach[] {
  return teamHeadFirst()
    .filter((c) => c.slug !== coach.slug)
    .map((c, order) => ({
      c,
      order,
      shared: c.classes.filter((s) => coach.classes.includes(s)).length,
      distance: Math.abs(c.zone - coach.zone),
    }))
    .sort((a, b) => b.shared - a.shared || a.distance - b.distance || a.order - b.order)
    .slice(0, count)
    .map((x) => x.c);
}

/** Team average of each of the five card stats, in stat order. */
export function teamStatAverages(): number[] {
  const n = COACHES.length;
  return COACHES[0].stats.map((_, i) => Math.round(COACHES.reduce((sum, c) => sum + c.stats[i].value, 0) / n));
}

/**
 * Coach name in the split hero, as large as the longest name part allows: «Мухаметов» must stay inside
 * the 6/11 text column from lg (grid gap 64 px) and inside the page width on phones.
 */
export function nameFit(name: string): { className: string; style: CSSProperties } {
  return {
    className:
      "leading-[0.82] text-[length:min(8rem,calc((100vw_-_2*clamp(16px,4vw,48px))/var(--fit)))] lg:text-[length:min(8rem,calc((min(100vw,1360px)_-_2*clamp(16px,4vw,48px)_-_64px)*6/11/var(--fit)))]",
    style: fitVar(name),
  };
}

/**
 * The fields a trading card needs. Long texts are dropped so client components do not carry
 * every biography in the page payload.
 */
export function cardData(coach: Coach): Coach {
  return { ...coach, bio: [], certifications: [], specialties: [] };
}
