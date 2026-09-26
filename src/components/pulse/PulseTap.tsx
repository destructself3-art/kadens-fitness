"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { HeartPulse } from "lucide-react";
import { plural } from "@/lib/format";
import { bpmFromTaps, restingVerdict } from "@/lib/zones";
import { usePulse } from "./PulseProvider";

type Props = {
  className?: string;
  /** hero: large; compact: for panels and forms */
  size?: "hero" | "compact";
  onMeasured?: (bpm: number) => void;
};

const RESET_AFTER_MS = 2200;
const FINISH_AFTER_TAPS = 12;
const MIN_TAPS = 5;

/**
 * Tap along to your pulse. The site beats with every tap; after a pause (or 12 taps) the median interval
 * becomes the resting heart rate for the whole site.
 */
export function PulseTap({ className, size = "hero", onMeasured }: Props) {
  const { kick, setRest, rest, measured, hydrated } = usePulse();
  const [taps, setTaps] = useState<number[]>([]);
  const [live, setLive] = useState<number | null>(null);
  const [done, setDone] = useState<number | null>(null);
  const [ripple, setRipple] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function finish(list: number[]) {
    const bpm = bpmFromTaps(list);
    setTaps([]);
    setLive(null);
    if (bpm) {
      setRest(bpm, "tap");
      setDone(bpm);
      onMeasured?.(bpm);
    }
  }

  function tap() {
    const t = performance.now();
    kick();
    setRipple((r) => r + 1);
    setDone(null);
    const next = taps.length && t - taps[taps.length - 1] > RESET_AFTER_MS ? [t] : [...taps, t].slice(-FINISH_AFTER_TAPS);
    setTaps(next);
    setLive(bpmFromTaps(next));
    if (timer.current) clearTimeout(timer.current);
    if (next.length >= FINISH_AFTER_TAPS) {
      finish(next);
      return;
    }
    timer.current = setTimeout(() => {
      if (next.length >= MIN_TAPS) finish(next);
      else {
        setTaps([]);
        setLive(null);
      }
    }, RESET_AFTER_MS);
  }

  const shown = live ?? done ?? (hydrated ? rest : null);
  const left = Math.max(0, MIN_TAPS - taps.length);
  let hint: React.ReactNode;
  if (done) hint = <><strong className="text-chalk">Готово: {done} уд/мин.</strong> {restingVerdict(done)}. Сайт бьётся в вашем ритме, зоны пересчитаны.</>;
  else if (taps.length === 0)
    hint = measured ? (
      <>Ваш пульс покоя сохранён. Чтобы перемерить, снова тапайте в такт.</>
    ) : (
      <>Приложите два пальца к шее, под челюстью, и нажимайте в такт ударам 10 секунд.</>
    );
  else if (left > 0) hint = <>Хорошо, продолжайте. Ещё {left} {plural(left, "удар", "удара", "ударов")}.</>;
  else hint = <>Держите ритм. Остановитесь, и мы зафиксируем результат.</>;

  const big = size === "hero";
  return (
    <div className={clsx("flex flex-col", className)}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{live ? "Считаем" : measured || done ? "Ваш пульс покоя" : "Пульс покоя, пока средний"}</p>
          <p className={clsx("digits leading-[0.8] text-pulse", big ? "mt-3 text-[104px] sm:text-[120px]" : "mt-2 text-[72px]")} aria-hidden>
            {shown ?? "··"}
            <span className={clsx("ml-2 text-dust", big ? "text-[30px]" : "text-[22px]")} style={{ fontWeight: 500 }}>
              уд/мин
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={tap}
          className={clsx(
            "relative grid flex-none place-items-center rounded-full border-2 border-pulse text-chalk transition-transform duration-100 active:scale-95",
            big ? "h-28 w-28" : "h-20 w-20",
          )}
          aria-label="Тап в такт пульсу"
        >
          <span key={ripple} className={clsx("absolute inset-0 rounded-full bg-pulse/25", ripple > 0 && "motion-safe:animate-live-ping")} aria-hidden />
          <span className="relative flex flex-col items-center gap-1">
            <HeartPulse className={big ? "h-7 w-7" : "h-5 w-5"} aria-hidden />
            <span className="font-display text-[15px] uppercase" style={{ fontVariationSettings: '"wdth" 120', fontWeight: 800 }}>
              Тап
            </span>
          </span>
        </button>
      </div>
      <p className={clsx("text-dust", big ? "mt-5 min-h-[48px] text-[15px]" : "mt-3 min-h-[44px] text-[14px]")} aria-live="polite">
        {hint}
      </p>
    </div>
  );
}
