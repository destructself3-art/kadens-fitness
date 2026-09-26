"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

type Section = { id: string; title: string };

/** The section whose top is closest above this line (px from the viewport top) is the current one. */
const READ_LINE = 160;

function useCurrentSection(ids: string[]) {
  const [current, setCurrent] = useState<string | null>(null);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      let active = els[0].id;
      for (const el of els) if (el.getBoundingClientRect().top - READ_LINE <= 0) active = el.id;
      // At the very bottom the last section wins even if it is short.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) active = els[els.length - 1].id;
      setCurrent(active);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids]);
  return current;
}

/**
 * Table of contents for long documents (rules, privacy). Sticky on desktop with the current section marked,
 * a native disclosure on phones. Links are plain anchors: Lenis scrolls to them with the header offset.
 */
export function DocNav({ sections, label = "Содержание", numbered = true }: { sections: Section[]; label?: string; numbered?: boolean }) {
  const [ids] = useState(() => sections.map((s) => s.id));
  const current = useCurrentSection(ids);

  const list = (compact: boolean) => (
    <ol className={clsx("grid", compact ? "gap-1" : "gap-0.5")}>
      {sections.map((s, i) => {
        const active = current === s.id;
        return (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={active ? "location" : undefined}
              className={clsx(
                "group flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-[15px] transition-colors duration-300",
                active ? "bg-raised text-chalk" : "text-dust hover:text-chalk",
              )}
            >
              {numbered && (
                <span className={clsx("digits w-6 flex-none text-[18px] leading-none", active ? "text-pulse" : "text-dust/70")}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              )}
              <span className="leading-snug">{s.title}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );

  return (
    <>
      <details className="card group/toc px-2 py-1 lg:hidden">
        <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between px-3 text-[15px] font-semibold text-chalk [&::-webkit-details-marker]:hidden">
          {label}
          <ChevronDown className="h-4 w-4 transition-transform duration-300 group-open/toc:rotate-180" aria-hidden />
        </summary>
        <nav aria-label={label} className="pb-3">
          {list(true)}
        </nav>
      </details>
      <nav aria-label={label} className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
        <p className="eyebrow mb-4 px-3">{label}</p>
        {list(false)}
      </nav>
    </>
  );
}
