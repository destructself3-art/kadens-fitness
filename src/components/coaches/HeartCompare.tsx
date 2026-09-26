"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BeatDot } from "@/components/pulse/Beat";
import { usePulse } from "@/components/pulse/PulseProvider";
import { plural } from "@/lib/format";

/**
 * Two hearts side by side: the coach's, beating at their resting rate, and the visitor's, beating in the
 * site's rhythm (their measured pulse, or the default until they measure it).
 */
export function HeartCompare({ coachHr, color }: { coachHr: number; color: string }) {
  const { rest, measured, hydrated } = usePulse();
  const reduce = useReducedMotion();
  const known = hydrated && measured;
  const diff = rest - coachHr;

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center" aria-hidden>
              <motion.span
                className="block h-3 w-3 rounded-full"
                style={{ background: color, boxShadow: `0 0 12px ${color}` }}
                animate={reduce ? undefined : { scale: [1, 1.9, 1.1, 1.45, 1, 1] }}
                transition={reduce ? undefined : { duration: 60 / coachHr, times: [0, 0.1, 0.24, 0.34, 0.6, 1], repeat: Infinity, ease: "easeOut" }}
              />
            </span>
            <span className="digits text-[48px] leading-none text-chalk">{coachHr}</span>
          </p>
          <p className="mt-1 text-[13px] text-dust">тренер, уд/мин в покое</p>
        </div>
        <div>
          <p className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center text-chalk" aria-hidden>
              <BeatDot className="h-3 w-3" />
            </span>
            <span className="digits text-[48px] leading-none text-chalk/80">{rest}</span>
          </p>
          <p className="mt-1 text-[13px] text-dust">{known ? "вы, по вашему замеру" : "средний пульс, пока вы не измерили свой"}</p>
        </div>
      </div>
      <p className="mt-4 text-[13.5px] leading-snug text-dust" aria-live="polite">
        {!known
          ? "Нажмите «Ваш пульс» в шапке сайта и отстучите свой ритм: сравним сердца и пересчитаем зоны."
          : diff > 0
            ? `Разница ${diff} ${plural(diff, "удар", "удара", "ударов")} в минуту. Так выглядит сердце, которое годами тренируется в своих зонах.`
            : "Ваш пульс покоя не выше тренерского. Сердце в хорошей форме: остаётся правильно распределять нагрузку."}
      </p>
    </div>
  );
}
