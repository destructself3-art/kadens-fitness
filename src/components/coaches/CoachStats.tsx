"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Coach } from "@/data/types";
import { ZoneBadge } from "@/components/ui/Kit";
import { PersonalRange } from "@/components/pulse/Zones";
import { zoneMeta } from "@/lib/zones";
import { coachRating } from "./HoloCard";

const EASE = [0.16, 1, 0.3, 1] as const;
// Treadmill-display segments
const SEGMENTS = "repeating-linear-gradient(90deg, #000 0 7px, transparent 7px 9px)";

/**
 * The back of the trading card: rating, usual zone with the visitor's range and the five stats as
 * segmented bars in the zone color. A chalk tick marks the team average.
 * Client component because coachRating lives in the client module of HoloCard.
 */
export function CoachStats({ coach, averages }: { coach: Coach; averages: number[] }) {
  const reduce = useReducedMotion();
  const z = zoneMeta(coach.zone);
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div>
          <p className="eyebrow">Рейтинг карточки</p>
          <p className="digits mt-1 text-[104px] leading-[0.78] text-chalk" style={{ textShadow: `0 0 34px ${z.color}80` }}>
            {coachRating(coach)}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="eyebrow mb-2">Обычная зона</p>
          <ZoneBadge zone={coach.zone} className="text-[15px]" />
          <p className="mt-2 text-[13px] text-dust">
            для вас <PersonalRange zone={coach.zone} className="text-[22px] text-chalk" withUnit />
          </p>
        </div>
      </div>

      <ul className="mt-8 grid gap-4">
        {coach.stats.map((s, i) => (
          <li key={s.label} className="grid grid-cols-[104px_minmax(0,1fr)_36px] items-center gap-3 sm:grid-cols-[120px_minmax(0,1fr)_40px]">
            <span className="text-[14px] text-dust">{s.label}</span>
            <span className="relative block h-3.5" aria-hidden>
              <span className="absolute inset-0 bg-line/10" style={{ maskImage: SEGMENTS, WebkitMaskImage: SEGMENTS }} />
              <motion.span
                className="absolute inset-y-0 left-0 origin-left"
                style={{ width: `${s.value}%`, background: z.color, maskImage: SEGMENTS, WebkitMaskImage: SEGMENTS, boxShadow: `0 0 16px ${z.color}66` }}
                initial={reduce ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.1 + i * 0.08 }}
              />
              <span className="absolute -inset-y-1.5 w-[2px] rounded-full bg-chalk" style={{ left: `calc(${averages[i]}% - 1px)` }} />
            </span>
            <span className="digits text-right text-[28px] leading-none text-chalk">
              {s.value}
              <span className="sr-only">, в среднем по команде {averages[i]}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-5 flex items-center gap-2 text-[12.5px] text-dust">
        <span className="inline-block h-3 w-[2px] rounded-full bg-chalk" aria-hidden />
        среднее по команде из двенадцати тренеров
      </p>
    </div>
  );
}
