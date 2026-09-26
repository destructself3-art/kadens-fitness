"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { Heading } from "./lib";

/**
 * Sticky side rail of an article: reading progress through the text and the table of contents
 * with the current section highlighted.
 */
export function ArticleRail({ headings, targetId }: { headings: Heading[]; targetId: string }) {
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState<string | null>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const view = window.innerHeight;
      // 0 when the text starts at the middle of the screen, 1 when its end reaches the bottom edge.
      const total = rect.height - view / 2;
      const p = total > 0 ? Math.min(1, Math.max(0, (view / 2 - rect.top) / total)) : 1;
      if (bar.current) bar.current.style.transform = `scaleY(${p.toFixed(4)})`;
      setProgress(Math.round(p * 100));
      let active: string | null = null;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top < view * 0.35) active = h.id;
      }
      setCurrent(active);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [headings, targetId]);

  return (
    <nav aria-label="Содержание статьи" className="grid grid-cols-[3px_minmax(0,1fr)] gap-5">
      <span className="relative block overflow-hidden rounded-full bg-line/10" aria-hidden>
        <span ref={bar} className="absolute inset-0 origin-top bg-pulse" style={{ transform: "scaleY(0)" }} />
      </span>
      <div>
        <p className="eyebrow">
          Прочитано <span className="digits ml-1 text-[18px] tracking-normal text-chalk">{progress}</span>
          <span className="tracking-normal"> %</span>
        </p>
        {headings.length > 0 && (
          <ol className="mt-5 grid gap-1">
            {headings.map((h) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  aria-current={current === h.id ? "location" : undefined}
                  className={clsx(
                    "block py-1.5 text-[14px] leading-snug transition-colors duration-300",
                    current === h.id ? "text-chalk" : "text-dust hover:text-chalk",
                  )}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ol>
        )}
      </div>
    </nav>
  );
}
