"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { plural } from "@/lib/format";
import { CATEGORIES, type CategorySlug } from "./categories";

export type JournalEntry = {
  slug: string;
  category: CategorySlug;
  /** Server-rendered large variant, used when the entry leads the list */
  featured: ReactNode;
  /** Server-rendered card */
  card: ReactNode;
};

const EASE = [0.16, 1, 0.3, 1] as const;

const articlesWord = (n: number) => plural(n, "статья", "статьи", "статей");

/**
 * Category filter for the journal. The cards are rendered on the server; this component only picks which to show
 * and keeps the choice in the URL (?category=) so a filtered list can be shared.
 */
export function JournalBrowser({ entries, initial }: { entries: JournalEntry[]; initial: CategorySlug | null }) {
  const [active, setActive] = useState<CategorySlug | null>(initial);
  const reduce = useReducedMotion();

  const shown = active ? entries.filter((e) => e.category === active) : entries;
  const [lead, ...rest] = shown;
  const activeLabel = CATEGORIES.find((c) => c.slug === active)?.label;

  function choose(next: CategorySlug | null) {
    setActive(next);
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("category", next);
    else url.searchParams.delete("category");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}`);
  }

  const chips: { slug: CategorySlug | null; label: string; count: number }[] = [
    { slug: null, label: "Все", count: entries.length },
    ...CATEGORIES.map((c) => ({ slug: c.slug, label: c.label, count: entries.filter((e) => e.category === c.slug).length })),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-y border-line/10 py-4">
        <div role="group" aria-label="Рубрики журнала" className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button key={c.slug ?? "all"} type="button" aria-pressed={active === c.slug} onClick={() => choose(c.slug)} className="chip min-h-[44px] px-4 text-[14px]">
              {c.label}
              <span className="digits text-[17px] leading-none opacity-60">{c.count}</span>
            </button>
          ))}
        </div>
        <p className="text-[13.5px] text-dust" aria-live="polite">
          {activeLabel ? `«${activeLabel}»: ` : "Всего "}
          <span className="digits text-[18px] text-chalk">{shown.length}</span> {articlesWord(shown.length)}
        </p>
      </div>

      <motion.div
        key={active ?? "all"}
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mt-12 md:mt-16"
      >
        {lead ? (
          <>
            {lead.featured}
            {rest.length > 0 && (
              <ul className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 md:mt-24 lg:grid-cols-3">
                {rest.map((e) => (
                  <li key={e.slug}>{e.card}</li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <div className="card grid place-items-center gap-4 px-6 py-16 text-center">
            <p className="display stretch-normal text-d-4">Здесь пока пусто</p>
            <p className="max-w-md text-dust">В этой рубрике статей ещё нет. Тренеры пишут новые каждые две-три недели.</p>
            <button type="button" className="btn-ghost" onClick={() => choose(null)}>
              Показать все статьи
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
