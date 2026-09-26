"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { BeatDot } from "./Beat";
import { PulseTap } from "./PulseTap";
import { usePulse } from "./PulseProvider";
import { PulseControls, ZoneScale } from "./Zones";

/** Header chip "♥ 64" that opens a panel to measure the pulse from any page. */
export function PulseChip() {
  const { rest, measured, hydrated } = usePulse();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !button.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    panel.current?.querySelector<HTMLElement>("button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="pulse-panel"
        className="flex h-11 items-center gap-2 whitespace-nowrap rounded-full border border-line/15 px-3 text-[14px] text-chalk transition-colors hover:border-line/40 sm:gap-2.5 sm:px-3.5"
      >
        <BeatDot className="h-2.5 w-2.5 text-pulse" />
        {hydrated && measured ? (
          <span className="digits text-[22px] leading-none">
            {rest}
            <span className="ml-1 font-sans text-[11px] font-medium text-dust">уд/мин</span>
          </span>
        ) : (
          <span>
            <span className="sm:hidden">Пульс</span>
            <span className="hidden sm:inline">Ваш пульс</span>
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panel}
            id="pulse-panel"
            role="dialog"
            aria-label="Ваш пульс и зоны"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-3 top-[80px] z-[70] max-h-[calc(100svh-96px)] overflow-y-auto rounded-card border border-line/15 bg-graphite p-5 shadow-2xl shadow-black/60 sm:absolute sm:inset-x-auto sm:right-0 sm:top-[56px] sm:w-[400px]"
            data-lenis-prevent
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <p className="display text-[22px] stretch-wide">Ваш ритм</p>
              <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full text-dust hover:text-chalk" aria-label="Закрыть">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <PulseTap size="compact" />
            <PulseControls className="mt-4 border-t border-line/10 pt-4" />
            <ZoneScale className="mt-4" />
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/program" className="btn-primary !min-h-[42px] flex-1" onClick={() => setOpen(false)}>
                Собрать программу
              </Link>
              <Link href="/zones" className="btn-ghost !min-h-[42px]" onClick={() => setOpen(false)}>
                О зонах
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
