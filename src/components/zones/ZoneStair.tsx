"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DEFAULT_AGE, DEFAULT_REST, ZONES } from "@/lib/zones";
import { usePulse } from "@/components/pulse/PulseProvider";

const EASE = [0.16, 1, 0.3, 1] as const;
// Column heights in %: the stair climbs with the heart-rate reserve.
const HEIGHTS = [44, 57, 70, 84, 100];

/**
 * The hero graphic: five zone columns rising like a stair, each with the visitor's range.
 * Every column links to its band further down the page.
 */
export function ZoneStair() {
  const { zones, measured, hydrated } = usePulse();
  const reduce = useReducedMotion();

  return (
    <div>
      <ol aria-label="Ваши пять зон пульса" className="flex h-[260px] items-end gap-1.5 sm:h-[320px] sm:gap-2 md:h-[340px]">
        {ZONES.map((z, i) => (
          <motion.li
            key={z.id}
            className="min-w-0 flex-1"
            style={{ height: `${HEIGHTS[i]}%`, transformOrigin: "bottom" }}
            initial={reduce ? false : { scaleY: 0 }}
            whileInView={reduce ? undefined : { scaleY: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.15 + i * 0.09 }}
          >
            <a
              href={`#zone-${z.id}`}
              className="flex h-full flex-col justify-between rounded-t-[14px] p-2 transition-[filter] duration-300 hover:brightness-110 sm:p-4"
              style={{ background: z.color, color: z.ink }}
            >
              <span className="digits flex flex-col text-[22px] leading-[0.95] md:text-[28px] lg:flex-row lg:items-baseline lg:text-[40px] xl:text-[46px]">
                <span>{zones[i].lo}</span>
                <span>–{zones[i].hi}</span>
                <span className="sr-only"> ударов в минуту</span>
              </span>
              <span className="flex flex-col">
                <span className="font-display text-[24px] uppercase leading-none sm:text-[32px] lg:text-[40px]" style={{ fontWeight: 850, fontVariationSettings: '"wdth" 80' }}>
                  Z{z.id}
                </span>
                <span className="sr-only mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] sm:not-sr-only sm:truncate lg:text-[13px]">{z.name}</span>
              </span>
            </a>
          </motion.li>
        ))}
      </ol>
      <p className="mt-4 text-[13.5px] text-dust">
        {hydrated && measured
          ? "Цифры посчитаны по вашему пульсу покоя и возрасту. Нажмите на зону, чтобы узнать о ней больше."
          : `Пока цифры по средним данным: пульс покоя ${DEFAULT_REST}, возраст ${DEFAULT_AGE}. Измерьте свой пульс ниже, и они станут вашими.`}
      </p>
    </div>
  );
}
