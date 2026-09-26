"use client";

import Link from "next/link";
import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { getSpace } from "@/data/spaces";
import { PersonalRange } from "@/components/pulse/Zones";
import { ZoneBadge } from "@/components/ui/Kit";
import { placesLabel } from "@/lib/format";
import type { ProgramItem } from "@/lib/program";
import type { SessionView } from "@/lib/session-types";
import { addDays, formatDay } from "@/lib/time";
import { zoneMeta } from "@/lib/zones";

const TRAINING_WEIGHT = 2.3;
const BASE_Y = 80;

export const studioLabel = (s: SessionView) => (getSpace(s.studioSlug).kind === "studio" ? `«${s.studioName}»` : s.studioName);

/**
 * The "why" line from lib/program repeats the zone name when the reason starts with it
 * ("Z4 Порог: порог: учимся…"). Drop the repeat.
 */
const cleanWhy = (why: string) => why.replace(/^(Z\d )([^:]+): \2:\s*/i, "$1$2: ");

export function dayLabel(dateKey: string, today: string): string {
  if (dateKey === today) return "сегодня";
  if (dateKey === addDays(today, 1)) return "завтра";
  return formatDay(dateKey).weekday;
}

/** One cardiogram complex centred at x (viewBox units): P wave, QRS spike as tall as the zone, T wave. */
function spikePath(x: number, zone: number) {
  const h = 16 + zone * 11;
  return [
    `M ${x - 62} ${BASE_Y}`,
    `Q ${x - 47} ${BASE_Y - 9} ${x - 32} ${BASE_Y}`,
    `L ${x - 12} ${BASE_Y}`,
    `L ${x - 6} ${BASE_Y + 6}`,
    `L ${x} ${BASE_Y - h}`,
    `L ${x + 7} ${BASE_Y + 10}`,
    `L ${x + 13} ${BASE_Y}`,
    `Q ${x + 34} ${BASE_Y - 13} ${x + 56} ${BASE_Y}`,
  ].join(" ");
}

/**
 * Seven days from today. Training days are wider than rest days, and a cardiogram above the strip
 * spikes on every class, as high as its zone.
 */
export function WeekStrip({ items, today }: { items: ProgramItem[]; today: string }) {
  const reduce = useReducedMotion();
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  const byDay = new Map(items.map((item) => [item.session.dateKey, item]));
  const weights = days.map((d) => (byDay.has(d) ? TRAINING_WEIGHT : 1));
  const total = weights.reduce((a, b) => a + b, 0);
  const template = weights.map((w) => `minmax(0, ${w}fr)`).join(" ");

  let acc = 0;
  const centers = weights.map((w) => {
    const c = ((acc + w / 2) / total) * 1000;
    acc += w;
    return c;
  });
  const spikes = days.flatMap((d, i) => {
    const item = byDay.get(d);
    return item ? [{ x: centers[i], zone: item.session.zone, key: d }] : [];
  });
  let baseline = `M 0 ${BASE_Y}`;
  for (const s of spikes) baseline += ` L ${s.x - 62} ${BASE_Y} M ${s.x + 56} ${BASE_Y}`;
  baseline += ` L 1000 ${BASE_Y}`;

  const draw = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0 },
          whileInView: { pathLength: 1 },
          viewport: { once: true, amount: 0.6 },
          transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <div>
      <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="hidden h-[84px] w-full lg:block" aria-hidden>
        <motion.path d={baseline} fill="none" stroke="rgb(var(--line) / 0.22)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" {...draw(0)} />
        {spikes.map((s, i) => (
          <motion.path
            key={s.key}
            d={spikePath(s.x, s.zone)}
            fill="none"
            stroke={zoneMeta(s.zone).color}
            strokeWidth={2.25}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            {...draw(0.25 + i * 0.12)}
          />
        ))}
      </svg>

      <ol className="grid gap-2 lg:gap-3 lg:[grid-template-columns:var(--week-cols)]" style={{ "--week-cols": template } as React.CSSProperties}>
        {days.map((d, i) => {
          const item = byDay.get(d);
          const f = formatDay(d);
          const label = dayLabel(d, today);
          // Rest columns are narrow on desktop: a short weekday fits them.
          const short = i < 2 ? label : f.weekdayShort;
          const dateHead = (
            <span className="flex min-w-0 flex-col">
              <span className={clsx("eyebrow truncate", i === 0 && "text-pulse")}>
                {item ? (
                  label
                ) : (
                  <>
                    <span className="lg:hidden">{label}</span>
                    <span className="hidden lg:inline">{short}</span>
                  </>
                )}
              </span>
              <span className="mt-1 flex items-baseline gap-1.5">
                <span className="digits text-[30px] leading-none text-chalk">{f.day}</span>
                <span className="text-[12.5px] text-dust">{f.month}</span>
              </span>
            </span>
          );
          if (!item) {
            return (
              <li
                key={d}
                className="grid grid-cols-[112px_1fr] items-center gap-3 rounded-2xl border border-dashed border-line/10 px-4 py-3 lg:flex lg:flex-col lg:items-start lg:justify-between lg:px-3 lg:py-4"
              >
                {dateHead}
                <span className="font-display text-[15px] uppercase text-dust/80 lg:text-[17px]" style={{ fontVariationSettings: '"wdth" 110', fontWeight: 700 }}>
                  Отдых
                </span>
              </li>
            );
          }
          const s = item.session;
          const z = zoneMeta(s.zone);
          return (
            <li key={d} className="min-w-0">
              <Link
                href={`/schedule/${s.id}`}
                className="group relative flex h-full flex-col rounded-2xl border border-line/10 bg-raised/60 p-4 transition-colors duration-300 hover:border-line/30 hover:bg-raised sm:p-5"
              >
                <span className="absolute inset-x-4 top-0 h-[3px] rounded-b-full" style={{ background: z.color }} aria-hidden />
                <span className="flex items-start justify-between gap-3">
                  {dateHead}
                  <ArrowUpRight className="h-5 w-5 flex-none text-dust transition-[transform,color] duration-300 ease-silk group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-chalk" aria-hidden />
                </span>
                <span className="mt-5 flex items-baseline gap-2">
                  <span className="digits text-[44px] leading-[0.8] text-chalk">{s.time}</span>
                  <span className="digits text-[17px] text-dust">–{s.endTime}</span>
                </span>
                <span
                  className="mt-3 block font-display text-[24px] uppercase leading-[0.92] text-chalk"
                  style={{ fontVariationSettings: '"wdth" 62', fontWeight: 850 }}
                >
                  {s.classTitle}
                </span>
                <span className="mt-2 block text-[13.5px] text-dust">
                  {studioLabel(s)} · {s.coachName}
                </span>
                <span className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <ZoneBadge zone={s.zone} />
                  <PersonalRange zone={s.zone} withUnit className="text-[22px] leading-none text-chalk" />
                </span>
                <span className="mt-3 block text-[13px] leading-snug text-dust">{cleanWhy(item.why)}</span>
                {item.targetZone !== s.zone && s.zone > 1 && (
                  <span className="mt-2 block text-[13px] leading-snug text-chalk/85">
                    {item.targetZone < s.zone ? `В плане это день Z${item.targetZone}: держите ` : `В рабочих отрезках поднимайтесь к Z${item.targetZone}: `}
                    <PersonalRange zone={item.targetZone} withUnit className="whitespace-nowrap text-[16px] text-chalk" />
                    {item.targetZone < s.zone ? ", даже если группа идёт быстрее." : "."}
                  </span>
                )}
                <span className={clsx("mt-auto block pt-4 text-[12.5px]", s.left <= 3 ? "font-semibold text-pulse" : "text-dust")}>
                  {s.left <= 3 ? `Осталось ${placesLabel(s.left)}` : `Свободно ${s.left} из ${s.capacity}`}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
