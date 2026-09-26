"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { Coach } from "@/data/types";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { zoneMeta } from "@/lib/zones";

// A coach as a holographic trading card. The foil and the glare follow the cursor (or the phone's tilt),
// tinted with the coach's heart-rate zone; the rating is the average of five stats.

const SHORT: Record<string, string> = { Сила: "СИЛ", Выносливость: "ВЫН", Гибкость: "ГИБ", Техника: "ТЕХ", Темп: "ТМП" };

export function coachRating(coach: Coach) {
  return Math.round(coach.stats.reduce((s, x) => s + x.value, 0) / Math.max(1, coach.stats.length));
}

export function HoloCard({ coach, className, sizes = "(min-width: 1100px) 22vw, (min-width: 560px) 40vw, 80vw", href }: { coach: Coach; className?: string; sizes?: string; href?: string }) {
  const card = useRef<HTMLAnchorElement>(null);
  const [active, setActive] = useState(false);
  const z = zoneMeta(coach.zone);

  // Phone tilt where the browser allows it without a permission prompt (Android Chrome).
  useEffect(() => {
    const el = card.current;
    if (!el || window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const needsPermission = typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === "function";
    if (needsPermission) return;
    const onTilt = (e: DeviceOrientationEvent) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const x = Math.max(-1, Math.min(1, (e.gamma ?? 0) / 30));
      const y = Math.max(-1, Math.min(1, ((e.beta ?? 45) - 45) / 30));
      apply(el, (x + 1) / 2, (y + 1) / 2);
    };
    window.addEventListener("deviceorientation", onTilt);
    return () => window.removeEventListener("deviceorientation", onTilt);
  }, []);

  function apply(el: HTMLElement, px: number, py: number) {
    el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    el.style.setProperty("--rx", `${((0.5 - py) * 14).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((px - 0.5) * 16).toFixed(2)}deg`);
    el.style.setProperty("--foil", "1");
  }

  function onMove(e: React.PointerEvent<HTMLAnchorElement>) {
    if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    apply(e.currentTarget, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    setActive(true);
  }

  function onLeave(e: React.PointerEvent<HTMLAnchorElement>) {
    const el = e.currentTarget;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--foil", "0");
    setActive(false);
  }

  return (
    <div className={clsx("[perspective:900px]", className)}>
      <Link
        ref={card}
        href={href ?? `/coaches/${coach.slug}`}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={clsx(
          "holo group relative block aspect-[5/7] overflow-hidden rounded-[18px] border bg-asphalt outline-offset-4 transition-transform duration-500 ease-silk",
          active ? "duration-100" : "",
        )}
        style={
          {
            "--zone": z.color,
            borderColor: `${z.color}66`,
            transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
            transformStyle: "preserve-3d",
          } as React.CSSProperties
        }
        aria-label={`${coach.name}, ${coach.role.toLowerCase()}`}
      >
        <MediaFrame shot={coach.photo} alt={`${coach.name}: силуэт в контровом свете`} sizes={sizes} className="absolute inset-0" imgClassName="transition-transform duration-700 ease-silk group-hover:scale-[1.04]" />
        {/* Foil: a zone-tinted spectrum that shows up where the light hits */}
        <span className="holo-foil pointer-events-none absolute inset-0" aria-hidden />
        <span className="holo-glare pointer-events-none absolute inset-0" aria-hidden />
        <span className="absolute inset-0 bg-gradient-to-t from-asphalt via-asphalt/10 to-transparent" aria-hidden />

        <span className="absolute left-4 top-4 flex flex-col items-center leading-none">
          <span className="digits text-[46px] text-chalk" style={{ textShadow: `0 0 18px ${z.color}` }}>
            {coachRating(coach)}
          </span>
          <span className="mt-1 rounded px-1.5 py-0.5 font-display text-[11px] uppercase" style={{ background: z.color, color: z.ink, fontWeight: 800, fontVariationSettings: '"wdth" 110' }}>
            Z{z.id}
          </span>
        </span>
        <span className="absolute right-4 top-4 text-right text-[11px] uppercase tracking-[0.14em] text-chalk/70">
          пульс
          <br />
          покоя <span className="digits text-[20px] tracking-normal text-chalk">{coach.restingHr}</span>
        </span>

        <span className="absolute inset-x-0 bottom-0 p-4">
          <span className="block font-display text-[26px] uppercase leading-[0.9] text-chalk" style={{ fontVariationSettings: '"wdth" 64', fontWeight: 850 }}>
            {coach.name}
          </span>
          <span className="mt-1 block text-[13px] text-dust">{coach.role}</span>
          <span className="mt-3 grid grid-cols-5 gap-1 border-t border-line/15 pt-2.5 text-center">
            {coach.stats.map((s) => (
              <span key={s.label} className="flex flex-col">
                <span className="digits text-[20px] leading-none text-chalk">{s.value}</span>
                <span className="mt-0.5 text-[9.5px] font-semibold tracking-[0.08em] text-dust">{SHORT[s.label] ?? s.label.slice(0, 3).toUpperCase()}</span>
              </span>
            ))}
          </span>
        </span>
      </Link>
    </div>
  );
}
