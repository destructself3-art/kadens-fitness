"use client";

import { createElement, Fragment, useState, type ReactNode } from "react";
import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";

export type AccordionItem = { id: string; q: string; a: string };

const EASE = [0.16, 1, 0.3, 1] as const;

/** Lowercase and ё → е, so «ещё» matches «еще». */
export const normalizeText = (s: string) => s.toLocaleLowerCase("ru-RU").replace(/ё/g, "е");

/** Wraps every match of `query` in <mark>. Matching ignores case and ё/е. */
export function Highlight({ text, query }: { text: string; query?: string }) {
  const q = query ? normalizeText(query.trim()) : "";
  if (!q) return <>{text}</>;
  const hay = normalizeText(text);
  const parts: ReactNode[] = [];
  let from = 0;
  let at = hay.indexOf(q);
  while (at !== -1) {
    if (at > from) parts.push(<Fragment key={`t${from}`}>{text.slice(from, at)}</Fragment>);
    parts.push(
      <mark key={`m${at}`} className="rounded-[4px] bg-pulse/30 px-0.5 text-chalk">
        {text.slice(at, at + q.length)}
      </mark>,
    );
    from = at + q.length;
    at = hay.indexOf(q, from);
  }
  if (from < text.length) parts.push(<Fragment key={`t${from}`}>{text.slice(from)}</Fragment>);
  return <>{parts}</>;
}

type Props = {
  items: AccordionItem[];
  /** Heading level of each question, to fit the page outline */
  headingLevel?: "h2" | "h3" | "h4";
  /** Ids open on mount */
  defaultOpen?: string[];
  highlight?: string;
  className?: string;
};

/**
 * Disclosure list: each question is a heading with a button (aria-expanded, aria-controls),
 * each answer a labelled region. Closed answers stay in the DOM but are inert.
 */
export function FaqAccordion({ items, headingLevel = "h3", defaultOpen = [], highlight, className }: Props) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(defaultOpen));
  const reduce = useReducedMotion();

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <ul className={clsx("border-t border-line/10", className)}>
      {items.map((item) => {
        const isOpen = open.has(item.id);
        const btnId = `${item.id}-q`;
        const panelId = `${item.id}-a`;
        return (
          <li key={item.id} className="border-b border-line/10">
            {createElement(
              headingLevel,
              { className: "m-0" },
              <button
                type="button"
                id={btnId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="group flex min-h-[68px] w-full items-center justify-between gap-6 py-5 text-left text-[17px] font-semibold leading-snug text-chalk transition-colors hover:text-chalk md:text-[19px]"
              >
                <span className="max-w-[60ch]">
                  <Highlight text={item.q} query={highlight} />
                </span>
                <span
                  aria-hidden
                  className={clsx(
                    "grid h-10 w-10 flex-none place-items-center rounded-full border transition-[transform,background-color,border-color,color] duration-500 ease-silk",
                    isOpen ? "rotate-45 border-pulse bg-pulse text-asphalt" : "border-line/20 text-chalk group-hover:border-chalk",
                  )}
                >
                  <Plus className="h-4 w-4" />
                </span>
              </button>,
            )}
            <motion.div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              inert={!isOpen}
              initial={false}
              animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
              className="overflow-hidden"
            >
              <p className="max-w-[68ch] pb-7 pr-12 text-[16px] leading-relaxed text-dust md:text-[17px]">
                <Highlight text={item.a} query={highlight} />
              </p>
            </motion.div>
          </li>
        );
      })}
    </ul>
  );
}
