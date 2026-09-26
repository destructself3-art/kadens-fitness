"use client";

import clsx from "clsx";
import type { ZoneId } from "@/data/types";
import { AGE_MAX, AGE_MIN, REST_MAX, REST_MIN, ZONES, zoneMeta } from "@/lib/zones";
import { usePulse } from "./PulseProvider";

/** "140–152": the visitor's personal range for a zone. Renders the default-based range before hydration. */
export function PersonalRange({ zone, className, withUnit = false }: { zone: number; className?: string; withUnit?: boolean }) {
  const { zones, measured, rest, age } = usePulse();
  const r = zones[zoneMeta(zone).id - 1];
  return (
    <span
      className={clsx("digits", className)}
      title={measured ? `По вашему пульсу покоя ${rest} и возрасту ${age}` : "По средним данным. Измерьте пульс, и цифры станут вашими."}
    >
      {r.lo}–{r.hi}
      {withUnit && <span className="ml-1 inline-block whitespace-nowrap text-[0.6em] text-dust">уд/мин</span>}
    </span>
  );
}

/** The five zones with the visitor's ranges. */
export function ZoneScale({ className, highlight, showFeel = false }: { className?: string; highlight?: ZoneId; showFeel?: boolean }) {
  const { zones } = usePulse();
  return (
    <ul className={clsx("grid gap-1.5", className)}>
      {ZONES.map((z, i) => (
        <li
          key={z.id}
          className={clsx(
            "grid grid-cols-[40px_1fr_auto] items-center gap-3 rounded-xl px-3 py-2 transition-colors",
            highlight === z.id ? "bg-raised ring-1 ring-line/20" : "bg-raised/60",
          )}
        >
          <span className="rounded-md py-1 text-center font-display text-[13px] uppercase" style={{ background: z.color, color: z.ink, fontWeight: 800, fontVariationSettings: '"wdth" 110' }}>
            Z{z.id}
          </span>
          <span className="min-w-0">
            <span className="block text-[14.5px] font-medium text-chalk">
              {z.name}
              <span className="ml-2 text-[12px] text-dust">
                {Math.round(z.reserve[0] * 100)}–{Math.round(z.reserve[1] * 100)}%
              </span>
            </span>
            {showFeel && <span className="block text-[13px] text-dust">{z.feel}</span>}
          </span>
          <span className="digits text-[26px] leading-none text-chalk">
            {zones[i].lo}–{zones[i].hi}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Horizontal zone bar from HRrest to HRmax with the visitor's numbers. */
export function ZoneBar({ className }: { className?: string }) {
  const { zones, rest, hrMax } = usePulse();
  return (
    <div className={className}>
      <div className="flex h-3 overflow-hidden rounded-full">
        {ZONES.map((z) => (
          <span key={z.id} className="flex-1" style={{ background: z.color }} />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[12px] text-dust">
        <span className="digits text-[18px] text-chalk">{rest}</span>
        {zones.slice(1).map((r) => (
          <span key={r.id} className="digits text-[18px]">
            {r.lo}
          </span>
        ))}
        <span className="digits text-[18px] text-chalk">{hrMax}</span>
      </div>
    </div>
  );
}

/** Age slider and a resting-pulse stepper for people who know their numbers. */
export function PulseControls({ className }: { className?: string }) {
  const { age, setAge, rest, setRest } = usePulse();
  return (
    <div className={clsx("grid gap-4", className)}>
      <label className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-[14px] text-dust">
        <span>Возраст</span>
        <input
          type="range"
          min={AGE_MIN}
          max={AGE_MAX}
          step={1}
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          className="w-full accent-[rgb(var(--pulse))]"
        />
        <span className="digits min-w-[3ch] text-right text-[24px] text-chalk">{age}</span>
      </label>
      <div className="flex items-center justify-between gap-3 text-[14px] text-dust">
        <span>Пульс покоя, если знаете</span>
        <span className="flex items-center gap-2">
          <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-line/20 text-chalk hover:border-chalk disabled:opacity-40" onClick={() => setRest(rest - 1)} aria-label="Меньше на один удар" disabled={rest <= REST_MIN}>
            −
          </button>
          <span className="digits min-w-[3ch] text-center text-[24px] text-chalk" aria-live="polite">
            {rest}
          </span>
          <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-line/20 text-chalk hover:border-chalk disabled:opacity-40" onClick={() => setRest(rest + 1)} aria-label="Больше на один удар" disabled={rest >= REST_MAX}>
            +
          </button>
        </span>
      </div>
    </div>
  );
}
