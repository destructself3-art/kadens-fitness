"use client";

import { useDeferredValue, useId, useMemo, useState } from "react";
import clsx from "clsx";
import { Search, X } from "lucide-react";
import type { FaqCategory, FaqItem } from "@/data/types";
import { ArrowLink, EmptyState } from "@/components/ui/Kit";
import { plural } from "@/lib/format";
import { FaqAccordion, normalizeText, type AccordionItem } from "./FaqAccordion";

type Props = {
  items: FaqItem[];
  categories: Record<FaqCategory, string>;
};

type Filter = FaqCategory | "all";

/** /faq: category chips + search over questions and answers, grouped accordion, live result count. */
export function FaqExplorer({ items, categories }: Props) {
  const [cat, setCat] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const searchId = useId();

  const indexed = useMemo(
    () => items.map((item, i) => ({ ...item, id: `faq-${i + 1}`, hay: normalizeText(`${item.q} ${item.a}`) })),
    [items],
  );
  const order = Object.keys(categories) as FaqCategory[];

  const q = normalizeText(deferred.trim());
  const byQuery = q ? indexed.filter((it) => it.hay.includes(q)) : indexed;
  const results = cat === "all" ? byQuery : byQuery.filter((it) => it.category === cat);
  const countIn = (c: Filter) => (c === "all" ? byQuery.length : byQuery.filter((it) => it.category === c).length);

  // Grouped by category when browsing, one flat list when searching.
  const groups: { key: string; title: string | null; items: AccordionItem[] }[] = q
    ? [{ key: "search", title: null, items: results }]
    : order
        .filter((c) => cat === "all" || c === cat)
        .map((c) => ({ key: c, title: categories[c], items: results.filter((it) => it.category === c) }))
        .filter((g) => g.items.length > 0);

  // When a search narrows things down, open the answers right away.
  const openOnMount = q && results.length <= 3 ? results.map((r) => r.id) : [];

  const n = results.length;
  const countLabel = q
    ? n
      ? `Нашли ${n} ${plural(n, "ответ", "ответа", "ответов")}`
      : "Ничего не нашли"
    : `${n} ${plural(n, "вопрос", "вопроса", "вопросов")}${cat === "all" ? "" : ` в разделе «${categories[cat]}»`}`;

  return (
    <div className="grid gap-12 lg:grid-cols-[320px_1fr] lg:gap-16">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <label htmlFor={searchId} className="field-label">
          Поиск по вопросам
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dust" aria-hidden />
          <input
            id={searchId}
            type="search"
            className="field pl-11 pr-12 [&::-webkit-search-cancel-button]:hidden"
            placeholder="Например, заморозка"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            enterKeyHint="search"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-1.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-dust hover:text-chalk"
              aria-label="Очистить поиск"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>

        <div role="group" aria-label="Разделы" className="-mx-1 mt-6 flex flex-wrap gap-2 px-1 lg:flex-col lg:items-stretch">
          {(["all", ...order] as Filter[]).map((c) => {
            const active = cat === c;
            const count = countIn(c);
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                onClick={() => setCat(c)}
                className={clsx("chip min-h-[44px] justify-between gap-3 px-4 text-[14px] lg:w-full", !active && count === 0 && "opacity-50")}
              >
                <span>{c === "all" ? "Все вопросы" : categories[c]}</span>
                <span className={clsx("digits text-[18px] leading-none", active ? "text-asphalt" : "text-dust")}>{count}</span>
              </button>
            );
          })}
        </div>

        <p role="status" aria-live="polite" className="mt-6 text-[14px] text-dust">
          {countLabel}
        </p>

        <div className="mt-10 hidden border-t border-line/10 pt-6 lg:block">
          <p className="text-[15px] text-dust">Не нашли ответ? Позвоните на ресепшен или напишите нам.</p>
          <ArrowLink href="/contacts" className="mt-3">
            Контакты клуба
          </ArrowLink>
        </div>
      </aside>

      <div className="min-w-0">
        {n === 0 ? (
          <EmptyState
            title="Такого вопроса ещё не было"
            text="Спросите нас напрямую: ответим и, может быть, добавим вопрос на эту страницу."
            action={
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                <button type="button" className="btn-ghost" onClick={() => { setQuery(""); setCat("all"); }}>
                  Показать все вопросы
                </button>
                <ArrowLink href="/contacts" className="self-center">
                  Контакты
                </ArrowLink>
              </div>
            }
          />
        ) : (
          <div className="grid gap-14">
            {groups.map((g) => (
              <section key={g.key} aria-labelledby={g.title ? `group-${g.key}` : undefined} aria-label={g.title ? undefined : "Результаты поиска"}>
                {g.title && (
                  <h2 id={`group-${g.key}`} className="display stretch-normal mb-6 flex items-baseline gap-4 text-d-4">
                    {g.title}
                    <span className="digits text-[22px] text-dust" aria-hidden>
                      {String(g.items.length).padStart(2, "0")}
                    </span>
                  </h2>
                )}
                <FaqAccordion key={`${cat}|${q}`} items={g.items} headingLevel={g.title ? "h3" : "h2"} highlight={q ? deferred : undefined} defaultOpen={openOnMount} />
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
