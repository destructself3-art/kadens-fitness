"use client";

import { useCallback, useMemo, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { plural } from "@/lib/format";
import { ZONES } from "@/lib/zones";
import { activeCount, filtersToQuery, matches, NO_FILTERS, parseFilters, type ClassFilters, type FilterableClass, type FilterKey, type FilterOptions } from "./filters";

export type ExplorerItem = FilterableClass & {
  /** The card, rendered on the server */
  card: ReactNode;
};

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Filters and the class grid. The URL is the only state: chips write it with history.replaceState
 * (no server round trip), links like /classes?zone=3 set it from outside, and a shared link opens the same view.
 */
export function ClassExplorer({ items, options }: { items: ExplorerItem[]; options: FilterOptions }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const reduce = useReducedMotion();

  const known = useMemo(() => ({ goals: options.goals.map((o) => o.value), studios: options.studios.map((o) => o.value) }), [options]);
  const filters = useMemo(() => parseFilters(params, known), [params, known]);
  const shown = items.filter((c) => matches(c, filters));
  const active = activeCount(filters);

  const apply = useCallback(
    (next: ClassFilters) => {
      window.history.replaceState(null, "", `${pathname}${filtersToQuery(next)}`);
    },
    [pathname],
  );

  /** Toggle one value: choosing the active chip again clears the group. */
  const set = <K extends FilterKey>(key: K, value: ClassFilters[K]) => apply({ ...filters, [key]: filters[key] === value ? null : value });

  /** How many classes a chip would leave, given the other groups. */
  const countWith = <K extends FilterKey>(key: K, value: ClassFilters[K]) => items.filter((c) => matches(c, { ...filters, [key]: value })).length;

  const zoneOptions = ZONES.map((z) => ({ value: z.id, label: `Z${z.id} ${z.name}`, color: z.color }));

  return (
    <div>
      <div className="grid gap-5 border-y border-line/10 py-6 lg:grid-cols-2 lg:gap-x-10">
        <ChipGroup label="Зона пульса" allCount={countWith("zone", null)} activeValue={filters.zone} onAll={() => apply({ ...filters, zone: null })}>
          {zoneOptions.map((o) => (
            <Chip key={o.value} pressed={filters.zone === o.value} count={countWith("zone", o.value)} onClick={() => set("zone", o.value)}>
              <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: o.color }} aria-hidden />
              {o.label}
            </Chip>
          ))}
        </ChipGroup>
        <ChipGroup label="Цель" allCount={countWith("goal", null)} activeValue={filters.goal} onAll={() => apply({ ...filters, goal: null })}>
          {options.goals.map((o) => (
            <Chip key={o.value} pressed={filters.goal === o.value} count={countWith("goal", o.value)} onClick={() => set("goal", o.value)}>
              {o.label}
            </Chip>
          ))}
        </ChipGroup>
        <ChipGroup label="Зал" allCount={countWith("studio", null)} activeValue={filters.studio} onAll={() => apply({ ...filters, studio: null })}>
          {options.studios.map((o) => (
            <Chip key={o.value} pressed={filters.studio === o.value} count={countWith("studio", o.value)} onClick={() => set("studio", o.value)}>
              {o.label}
            </Chip>
          ))}
        </ChipGroup>
        <ChipGroup label="Ваш опыт" allCount={countWith("level", null)} activeValue={filters.level} onAll={() => apply({ ...filters, level: null })}>
          {options.levels.map((o) => (
            <Chip key={o.value} pressed={filters.level === o.value} count={countWith("level", o.value)} onClick={() => set("level", o.value)}>
              {o.label}
            </Chip>
          ))}
        </ChipGroup>
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <p className="text-[15px] text-dust" aria-live="polite" aria-atomic="true">
          {active === 0 ? "Все направления: " : "Подходит: "}
          <span className="digits text-[32px] leading-none text-chalk">{shown.length}</span>{" "}
          {active === 0 ? plural(shown.length, "класс", "класса", "классов") : `из ${items.length}`}
        </p>
        {active > 0 && (
          <button type="button" onClick={() => apply(NO_FILTERS)} className="btn-quiet !min-h-[44px] !px-0 text-[14px]">
            <span className="link-underline">Сбросить фильтры</span>
            <span className="digits text-[18px] text-chalk">{active}</span>
          </button>
        )}
      </div>

      {shown.length === 0 ? (
        <div className="card mt-6 grid place-items-center gap-3 px-6 py-16 text-center">
          <p className="display text-d-4 stretch-normal">Такого класса пока нет</p>
          <p className="max-w-md text-dust">
            Под это сочетание в расписании ничего не нашлось. Уберите один из фильтров или начните с пробной тренировки: тренер поможет выбрать.
          </p>
          <button type="button" onClick={() => apply(NO_FILTERS)} className="btn-ghost mt-2">
            Показать все классы
          </button>
        </div>
      ) : (
        // Two columns from md and three from xl: ClassCard's 26 px title needs about 270 px for «Функциональный».
        <ul className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((c) => (
              <motion.li
                key={c.slug}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, scale: 0.97, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.97, filter: "blur(6px)", transition: { duration: 0.2 } }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                {c.card}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

function ChipGroup({ label, allCount, activeValue, onAll, children }: { label: string; allCount: number; activeValue: unknown; onAll: () => void; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="min-w-0">
      <p className="eyebrow mb-3">{label}</p>
      {/* Phones: one scrolling row per group, inside its own container. Wider screens: chips wrap.
          `relative` keeps the chips' absolutely positioned sr-only labels inside the scroller, so they do not widen the page. */}
      <div className="relative -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
        <Chip pressed={activeValue === null} count={allCount} onClick={onAll}>
          Все
        </Chip>
        {children}
      </div>
    </div>
  );
}

function Chip({ pressed, count, onClick, children }: { pressed: boolean; count: number; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={clsx("chip min-h-[44px] flex-none whitespace-nowrap px-4 text-[14px] hover:border-line/40", count === 0 && !pressed && "text-dust opacity-60")}
    >
      {children}
      <span className={clsx("digits text-[16px] leading-none", pressed ? "text-asphalt/60" : "text-dust")}>
        <span className="sr-only">, классов: </span>
        {count}
      </span>
    </button>
  );
}
