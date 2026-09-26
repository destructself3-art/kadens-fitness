"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Scroll box of the day board. On today's board it opens at the current time instead of 06:00. */
export function BoardScroller({ children, nowOffset, label }: { children: ReactNode; nowOffset: number | null; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || nowOffset === null) return;
    el.scrollTop = Math.max(0, nowOffset - el.clientHeight * 0.3);
  }, [nowOffset]);
  return (
    <div
      ref={ref}
      role="region"
      aria-label={label}
      tabIndex={0}
      className="relative max-h-[min(78vh,860px)] overflow-auto overscroll-contain rounded-card border border-line/10 bg-graphite"
    >
      {children}
    </div>
  );
}
