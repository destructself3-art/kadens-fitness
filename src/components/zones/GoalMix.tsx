"use client";

import { useState } from "react";
import type { Goal } from "@/data/types";
import { ZONES } from "@/lib/zones";

const WEEK_HOURS = [3, 4, 5, 6] as const;

/** 95 -> "1 ч 35 мин", rounded to 5 minutes. */
function duration(minutes: number): string {
  const m = Math.round(minutes / 5) * 5;
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h} ч ${rest} мин` : `${h} ч`;
}

/**
 * Weekly zone mix per goal: shares from GOALS as bars, and the same shares in minutes
 * for the number of hours the visitor trains.
 */
export function GoalMix({ goals }: { goals: Pick<Goal, "slug" | "title" | "short" | "zoneMix">[] }) {
  const [hours, setHours] = useState<(typeof WEEK_HOURS)[number]>(4);
  const top = Math.max(...goals.flatMap((g) => ZONES.map((z) => g.zoneMix[z.id])));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <p id="goal-mix-hours" className="text-[14.5px] text-dust">
          Тренируюсь в неделю
        </p>
        <div role="group" aria-labelledby="goal-mix-hours" className="flex flex-wrap gap-1.5">
          {WEEK_HOURS.map((h) => (
            <button key={h} type="button" aria-pressed={h === hours} onClick={() => setHours(h)} className="chip min-h-[44px] px-4">
              <span className="digits text-[20px] leading-none">{h}</span> ч
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-8 overflow-x-auto rounded-card border border-line/10 bg-graphite" role="region" aria-label="Таблица: сколько времени в каждой зоне" tabIndex={0}>
        <table className="w-full min-w-[820px] border-collapse text-left">
          <caption className="sr-only">
            Доля недельного времени в каждой пульсовой зоне для четырёх целей и сколько это минут при {hours} часах тренировок в неделю
          </caption>
          <thead>
            <tr className="border-b border-line/10">
              <th scope="col" className="w-[30%] px-6 py-4 text-[13px] font-medium text-dust">
                Цель
              </th>
              {ZONES.map((z) => (
                <th key={z.id} scope="col" className="px-4 py-4 text-[13px] font-medium text-dust">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: z.color }} aria-hidden />
                    <span>
                      Z{z.id} <span className="hidden xl:inline">{z.name}</span>
                    </span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {goals.map((g) => (
              <tr key={g.slug} className="border-b border-line/10 last:border-b-0">
                <th scope="row" className="px-6 py-6 align-top font-normal">
                  <span className="block font-display text-[24px] uppercase leading-none text-chalk" style={{ fontWeight: 820, fontVariationSettings: '"wdth" 72' }}>
                    {g.title}
                  </span>
                  {/* The goal's fingerprint: the whole week as one stacked bar */}
                  <span className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-raised" aria-hidden>
                    {ZONES.map((z) => (
                      <span key={z.id} style={{ width: `${g.zoneMix[z.id] * 100}%`, background: z.color }} />
                    ))}
                  </span>
                  <span className="mt-3 block max-w-[34ch] text-[13px] leading-snug text-dust">{g.short}</span>
                </th>
                {ZONES.map((z) => {
                  const share = g.zoneMix[z.id];
                  return (
                    <td key={z.id} className="px-4 py-6 align-top">
                      {share > 0 ? (
                        <>
                          <span className="digits block text-[36px] leading-none text-chalk">
                            {Math.round(share * 100)}
                            <span className="ml-0.5 text-[18px] text-dust">%</span>
                          </span>
                          <span className="mt-3 block h-1.5 rounded-full bg-raised" aria-hidden>
                            <span className="block h-full rounded-full" style={{ width: `${(share / top) * 100}%`, background: z.color }} />
                          </span>
                          <span className="mt-2 block text-[13px] text-dust">{duration(share * hours * 60)}</span>
                        </>
                      ) : (
                        <span className="digits block text-[36px] leading-none text-dust/50">
                          0<span className="sr-only"> %, эта зона не нужна</span>
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
