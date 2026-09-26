"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { SpaceSlug } from "@/data/types";
import { ArrowLink } from "@/components/ui/Kit";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { plural } from "@/lib/format";
import { FloorMap } from "./FloorMap";
import { FLOORS, spaceTitle, type Floor, type PlanSpace } from "./plan";

const EASE = [0.16, 1, 0.3, 1] as const;

/** 1100 -> "1 100" without locale APIs, so the server and the browser print the same thing. */
const thousands = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

type Props = {
  spaces: PlanSpace[];
  initialFloor: Floor;
  taglines: Record<Floor, string>;
  /** Server-rendered card grid for each floor */
  grids: Record<Floor, ReactNode>;
  /** Small print under the plan */
  note?: string;
};

/**
 * The club tour: an elevator panel with three floors, the floor plan and a preview card.
 * Hover, focus or tap a room to preview it; click it (or tap again) to open its page.
 */
export function FloorTour({ spaces, initialFloor, taglines, grids, note }: Props) {
  const reduce = useReducedMotion();
  const byFloor = useMemo(() => {
    const map: Record<Floor, PlanSpace[]> = { 1: [], 2: [], 3: [] };
    for (const s of spaces) map[s.floor].push(s);
    return map;
  }, [spaces]);

  const [floor, setFloor] = useState<Floor>(initialFloor);
  const [active, setActive] = useState<SpaceSlug>(byFloor[initialFloor][0].slug);
  const tabs = useRef<Record<number, HTMLButtonElement | null>>({});

  const current = byFloor[floor].find((s) => s.slug === active) ?? byFloor[floor][0];

  function choose(next: Floor, focus = false) {
    if (focus) tabs.current[next]?.focus();
    if (next === floor) return;
    setFloor(next);
    setActive(byFloor[next][0].slug);
    try {
      window.history.replaceState(null, "", `?floor=${next}`);
    } catch {
      // Some embedded browsers forbid history changes: the tour still works.
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const step: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    let next: number | null = null;
    if (e.key in step) next = floor + step[e.key];
    if (e.key === "Home") next = 1;
    if (e.key === "End") next = 3;
    if (next === null) return;
    e.preventDefault();
    choose(Math.min(3, Math.max(1, next)) as Floor, true);
  }

  const fade = reduce
    ? {}
    : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.45, ease: EASE } };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[118px_minmax(0,1fr)] lg:gap-10">
      {/* Elevator panel: 3 on top, like the building */}
      <div role="tablist" aria-label="Этажи клуба" className="grid grid-cols-3 gap-2 self-start lg:sticky lg:top-28 lg:flex lg:flex-col-reverse">
        {FLOORS.map((f) => {
          const selected = f === floor;
          const n = byFloor[f].length;
          return (
            <button
              key={f}
              ref={(el) => {
                tabs.current[f] = el;
              }}
              type="button"
              role="tab"
              id={`floor-tab-${f}`}
              aria-selected={selected}
              aria-controls="floor-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => choose(f)}
              onKeyDown={onKeyDown}
              className={clsx(
                "group relative flex min-h-[88px] flex-col items-start justify-between rounded-2xl border px-4 py-3 text-left transition-colors duration-300 lg:min-h-[118px]",
                selected ? "border-pulse bg-pulse/10" : "border-line/15 bg-graphite hover:border-line/40",
              )}
            >
              <span
                className={clsx("digits text-[52px] leading-[0.8] transition-colors lg:text-[64px]", selected ? "text-pulse" : "text-chalk/70 group-hover:text-chalk")}
                style={selected ? { textShadow: "0 0 22px rgb(255 58 36 / 0.55)" } : undefined}
              >
                {f}
              </span>
              <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-chalk">этаж</span>
              <span className="text-[12px] text-dust">
                <span className="digits text-[16px] text-chalk/80">{n}</span> {plural(n, "пространство", "пространства", "пространств")}
              </span>
              <span className={clsx("absolute right-3 top-3 h-2 w-2 rounded-full transition-colors", selected ? "bg-pulse" : "bg-line/15")} aria-hidden />
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id="floor-panel" aria-labelledby={`floor-tab-${floor}`} className="min-w-0">
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* Preview card: above the plan and sticky on phones, beside it on desktop */}
          <aside aria-label="Выбранное помещение" className="sticky top-[80px] z-10 lg:order-last lg:top-28">
            <div className="rounded-card border border-line/15 bg-graphite p-3 shadow-[0_20px_40px_-20px_rgb(0_0_0_/_0.9)] lg:p-4">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={current.slug} {...fade} className="flex gap-4 lg:block">
                  <MediaFrame
                    shot={current.photo}
                    alt={`${current.label} ${spaceTitle(current)}`}
                    sizes="(min-width: 1360px) 350px, (min-width: 1100px) 290px, 96px"
                    quiet
                    className="h-[96px] w-[96px] flex-none rounded-xl lg:aspect-[4/3] lg:h-auto lg:w-full lg:rounded-2xl"
                  />
                  <div className="min-w-0 flex-1 lg:mt-5 lg:px-1 lg:pb-1">
                    <p className="eyebrow truncate">{current.label}</p>
                    <p className="mt-1 font-display text-[24px] uppercase leading-[0.95] text-chalk lg:mt-2 lg:text-[40px]" style={{ fontVariationSettings: '"wdth" 66', fontWeight: 850 }}>
                      {spaceTitle(current)}
                    </p>
                    <p className="mt-3 hidden text-[15px] leading-relaxed text-dust lg:block">{current.mood}</p>
                    <dl className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-dust lg:mt-5 lg:border-t lg:border-line/10 lg:pt-4">
                      <div className="flex items-baseline gap-1.5">
                        <dt className="sr-only">Площадь</dt>
                        <dd>
                          <span className="digits text-[20px] text-chalk lg:text-[28px]">{current.area}</span> м²
                        </dd>
                      </div>
                      {current.capacity ? (
                        <div className="flex items-baseline gap-1.5">
                          <dt className="sr-only">Мест на занятии</dt>
                          <dd>
                            <span className="digits text-[20px] text-chalk lg:text-[28px]">{current.capacity}</span> {plural(current.capacity, "место", "места", "мест")}
                          </dd>
                        </div>
                      ) : null}
                      {current.hours && (
                        <div className="hidden items-baseline gap-1.5 lg:flex">
                          <dt className="sr-only">Часы</dt>
                          <dd>{current.hours}</dd>
                        </div>
                      )}
                    </dl>
                    <ArrowLink href={`/studios/${current.slug}`} className="min-h-[44px] text-[14px] lg:mt-3 lg:text-[15px]">
                      Открыть страницу
                    </ArrowLink>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </aside>

          <div className="min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={floor} {...fade}>
                <p className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <span className="font-display text-[22px] uppercase leading-none text-chalk md:text-[28px]" style={{ fontVariationSettings: '"wdth" 90', fontWeight: 800 }}>
                    {taglines[floor]}
                  </span>
                  <span className="text-[13px] text-dust">
                    <span className="digits text-[18px] text-chalk">{thousands(byFloor[floor].reduce((sum, x) => sum + x.area, 0))}</span> м² в помещениях
                  </span>
                </p>
                <div className="ecg-grid rounded-card border border-line/10 bg-asphalt p-2 sm:p-4">
                  <FloorMap floor={floor} spaces={byFloor[floor]} active={current.slug} variant="tall" onPreview={setActive} className="md:hidden" />
                  <FloorMap floor={floor} spaces={byFloor[floor]} active={current.slug} variant="wide" onPreview={setActive} className="hidden md:block" />
                </div>
                {note && <p className="mt-3 max-w-xl text-[13px] text-dust">{note}</p>}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-20 md:mt-28">{grids[floor]}</div>
      </div>
    </div>
  );
}
