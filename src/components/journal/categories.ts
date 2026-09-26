// Journal categories and their URL slugs. No article data here: safe to import from client components.
import type { Article } from "@/data/types";

export type Category = Article["category"];

/** URL slugs for the ?category= filter. */
export const CATEGORY_SLUGS = {
  Пульс: "pulse",
  Тренировки: "training",
  Восстановление: "recovery",
  Питание: "food",
} as const satisfies Record<Category, string>;

export type CategorySlug = (typeof CATEGORY_SLUGS)[Category];

export const CATEGORIES = Object.entries(CATEGORY_SLUGS).map(([label, slug]) => ({ label: label as Category, slug }));

export function categorySlug(category: Category): CategorySlug {
  return CATEGORY_SLUGS[category];
}

export function categoryFromParam(value: string | string[] | undefined): CategorySlug | null {
  const v = Array.isArray(value) ? value[0] : value;
  return CATEGORIES.find((c) => c.slug === v)?.slug ?? null;
}
