"use client";

import { useId } from "react";
import { COUNT_LIMITS } from "./copy";

export type CountKey = keyof typeof COUNT_LIMITS;
export type Counts = Record<CountKey, string>;

/** Beats counted in 15 seconds; null when the field is empty or not a whole number. */
export function parseCount(value: string): number | null {
  if (!/^\d{1,2}$/.test(value.trim())) return null;
  return Number(value);
}

export function countError(key: CountKey, value: string): string | null {
  const n = parseCount(value);
  const lim = COUNT_LIMITS[key];
  if (n === null) return "Введите, сколько ударов насчитали за 15 секунд.";
  if (n < lim.min || n > lim.max) return `Похоже, счёт сбился. ${lim.hint}`;
  return null;
}

/** Where the − and + buttons start from when the field is empty: typical counts. */
const START: Record<CountKey, number> = { p1: 17, p2: 30, p3: 22 };

/** A 15-second beat count with − / + buttons and the per-minute value next to it. */
export function CountInput({
  countKey,
  label,
  value,
  onChange,
  error,
}: {
  countKey: CountKey;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}) {
  const id = useId();
  const n = parseCount(value);
  const step = (delta: number) => onChange(String(Math.min(99, Math.max(1, n === null ? START[countKey] : n + delta))));
  const stepper =
    "grid h-12 w-12 flex-none place-items-center rounded-full border border-line/20 text-[22px] leading-none text-chalk transition-colors hover:border-chalk focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk";
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
        <button type="button" className={stepper} onClick={() => step(-1)} aria-label={`${label}: на один удар меньше`}>
          −
        </button>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          maxLength={2}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 2))}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-bpm${error ? ` ${id}-error` : ""}`}
          className="field digits w-[88px] text-center text-[34px] leading-none"
        />
        <button type="button" className={stepper} onClick={() => step(1)} aria-label={`${label}: на один удар больше`}>
          +
        </button>
        <span id={`${id}-bpm`} className="flex basis-full items-baseline gap-2 text-[14px] text-dust sm:basis-auto sm:pl-2">
          ×4 =<span className="digits text-[30px] leading-none text-chalk">{n ? n * 4 : "—"}</span>уд/мин
        </span>
      </div>
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
