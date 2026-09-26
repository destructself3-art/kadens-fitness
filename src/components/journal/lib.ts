// Journal helpers for server components. They import the articles, so keep them out of client components
// (client code takes category helpers from ./categories).
import { ARTICLES } from "@/data/journal";
import type { Article } from "@/data/types";
import { formatDay } from "@/lib/time";
import { plural } from "@/lib/format";

/** "2026-09-18" -> "18 сентября 2026". No Intl: identical on the server and in the browser. */
export function articleDate(iso: string): string {
  return `${formatDay(iso).dayMonth} ${iso.slice(0, 4)}`;
}

/** The words after the number: 5 -> "минут чтения". */
export const readUnit = (minutes: number) => `${plural(minutes, "минута", "минуты", "минут")} чтения`;

/** Newest first, whatever order the data file has. */
export function sortedArticles(): Article[] {
  return [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
}

/** Two articles to read next: the same category first, then the newest of the rest. */
export function relatedArticles(article: Article, count = 2): Article[] {
  const others = sortedArticles().filter((a) => a.slug !== article.slug);
  const same = others.filter((a) => a.category === article.category);
  const rest = others.filter((a) => a.category !== article.category);
  return [...same, ...rest].slice(0, count);
}

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p",
  р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

/** "Откуда берутся цифры" -> "otkuda-berutsya-tsifry": readable anchors for h2 blocks. */
export function headingSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .split("")
      .map((ch) => TRANSLIT[ch] ?? ch)
      .join("")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "section"
  );
}

export type Heading = { id: string; text: string };

/** The h2 blocks of an article with unique anchor ids, in order. */
export function articleHeadings(article: Article): Heading[] {
  const seen = new Map<string, number>();
  const out: Heading[] = [];
  for (const block of article.body) {
    if (block.type !== "h2") continue;
    const base = headingSlug(block.text);
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    out.push({ id: n > 1 ? `${base}-${n}` : base, text: block.text });
  }
  return out;
}
