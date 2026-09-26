"use client";

import { Children, useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Left padding that lines the first card up with .container-page (max 1360 px, gutter clamp(16px, 4vw, 48px)).
const GUTTER = "clamp(16px, 4vw, 48px)";
const EDGE = `max(${GUTTER}, calc(50% - 680px + ${GUTTER}))`;

/** Distance between the starts of two neighbouring items. */
function stepOf(scroller: HTMLElement) {
  const list = scroller.firstElementChild as HTMLElement | null;
  const first = list?.firstElementChild as HTMLElement | null;
  if (!list || !first) return scroller.clientWidth;
  return first.getBoundingClientRect().width + (parseFloat(getComputedStyle(list).columnGap) || 0);
}

type Props = {
  /** Accessible name of the scrolling region */
  label: string;
  children: ReactNode;
  /** Width of one item, Tailwind classes */
  itemClassName?: string;
  /** Rendered next to the arrows, e.g. a heading */
  header?: ReactNode;
};

/**
 * A horizontal snap row that bleeds to the right edge of the screen. Scrolls with a trackpad, touch, the keyboard
 * (focus the row and use the arrow keys) or the prev/next buttons. Shows "03 / 07".
 */
export function SnapRail({ label, children, itemClassName, header }: Props) {
  const id = useId();
  const rail = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const items = Children.toArray(children);
  const [state, setState] = useState({ index: 0, atStart: true, atEnd: false });

  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const step = stepOf(el);
    const max = el.scrollWidth - el.clientWidth;
    const atEnd = el.scrollLeft >= max - 4;
    setState({
      index: atEnd ? items.length - 1 : Math.min(items.length - 1, Math.round(el.scrollLeft / Math.max(1, step))),
      atStart: el.scrollLeft <= 4,
      atEnd,
    });
  }, [items.length]);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    measure();
    let frame = 0;
    const onScroll = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          measure();
        });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [measure]);

  const go = (dir: -1 | 1) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: dir * stepOf(el), behavior: reduce ? "auto" : "smooth" });
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div>
      <div className="container-page flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
        {header}
        <div className="flex items-center gap-4">
          <p className="digits text-[26px] leading-none text-dust" aria-hidden>
            <span className="text-chalk">{pad(state.index + 1)}</span> / {pad(items.length)}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={state.atStart}
              aria-controls={id}
              aria-label="Прокрутить назад"
              className="grid h-12 w-12 place-items-center rounded-full border border-line/25 text-chalk transition-colors hover:border-chalk disabled:cursor-default disabled:opacity-30 disabled:hover:border-line/25"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={state.atEnd}
              aria-controls={id}
              aria-label="Прокрутить вперёд"
              className="grid h-12 w-12 place-items-center rounded-full border border-line/25 text-chalk transition-colors hover:border-chalk disabled:cursor-default disabled:opacity-30 disabled:hover:border-line/25"
            >
              <ArrowRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={rail}
        id={id}
        role="region"
        aria-label={label}
        tabIndex={0}
        data-lenis-prevent-horizontal
        className="mt-10 snap-x snap-mandatory overflow-x-auto pb-4 outline-offset-[-2px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollPaddingInline: EDGE }}
      >
        <ul className="flex w-max gap-4 md:gap-5" style={{ paddingInline: EDGE }}>
          {items.map((child, i) => (
            <li key={i} className={clsx("flex-none snap-start", itemClassName)}>
              {child}
            </li>
          ))}
        </ul>
      </div>

      <div className="container-page mt-4" aria-hidden>
        <div className="h-px bg-line/10">
          <div
            className="h-px bg-pulse transition-[width] duration-500 ease-silk"
            style={{ width: `${((state.index + 1) / Math.max(1, items.length)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
