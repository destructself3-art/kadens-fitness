"use client";

import { useId, useState, type ReactNode } from "react";
import clsx from "clsx";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import type { ClassSlug, CoachSlug, SpaceSlug, ZoneId } from "@/data/types";
import { PersonalRange } from "@/components/pulse/Zones";
import { usePulse } from "@/components/pulse/PulseProvider";
import { ZONES } from "@/lib/zones";
import { DAY_PARTS, DAY_PART_LABELS, type BoardState, type DayPart } from "./board-state";

export type Option<T extends string> = { value: T; label: string };

type Props = {
  state: BoardState;
  onChange: (patch: Partial<BoardState>) => void;
  onReset: () => void;
  studios: Option<SpaceSlug>[];
  classes: Option<ClassSlug>[];
  coaches: Option<CoachSlug>[];
  /** Number of active filters, for the mobile toggle */
  activeCount: number;
};

const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

function Group({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={id} className={clsx("min-w-0", className)}>
      <p id={id} className="eyebrow mb-3">
        {label}
      </p>
      {children}
    </div>
  );
}

const chip = "chip min-h-[44px] px-4 text-[14px] hover:border-line/40";

function Select<T extends string>({ label, value, options, onChange, all }: { label: string; value: T | null; options: Option<T>[]; onChange: (v: T | null) => void; all: string }) {
  const id = useId();
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="eyebrow mb-3 block">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange((e.target.value || null) as T | null)}
          className={clsx(
            "h-11 w-full cursor-pointer appearance-none truncate rounded-full border bg-asphalt pl-4 pr-10 text-[14px] font-medium transition-colors focus:border-chalk focus:outline-none",
            value ? "border-chalk text-chalk" : "border-line/15 text-dust hover:border-line/40",
          )}
        >
          <option value="">{all}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dust" aria-hidden />
      </div>
    </div>
  );
}

/** Filters of the schedule. Collapsed behind a button on phones, always open from 1100 px. */
export function FilterDeck({ state, onChange, onReset, studios, classes, coaches, activeCount }: Props) {
  const [open, setOpen] = useState(false);
  const { measured } = usePulse();
  const panelId = useId();

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex min-h-[44px] items-center gap-2.5 rounded-full text-[15px] font-semibold text-chalk"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Фильтры
          {activeCount > 0 && <span className="digits grid h-6 min-w-6 place-items-center rounded-full bg-pulse px-1.5 text-[16px] leading-none text-asphalt">{activeCount}</span>}
          <ChevronDown className={clsx("h-4 w-4 text-dust transition-transform duration-300", open && "rotate-180")} aria-hidden />
        </button>
        {activeCount > 0 && (
          <button type="button" onClick={onReset} className="btn-quiet !min-h-[44px] !px-2 text-[14px]">
            Сбросить
          </button>
        )}
      </div>

      <div id={panelId} className={clsx("gap-7 border-t border-line/10 p-4 sm:p-6 lg:grid lg:border-t-0", open ? "grid" : "hidden")}>
        <Group label="Студия">
          <div className="-mx-1 flex flex-wrap gap-2 px-1">
            {studios.map((s) => (
              <button key={s.value} type="button" aria-pressed={state.studios.includes(s.value)} onClick={() => onChange({ studios: toggle(state.studios, s.value) })} className={chip}>
                {s.label}
              </button>
            ))}
          </div>
        </Group>

        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-[auto_auto_minmax(0,1fr)_minmax(0,1fr)]">
          <Group label="Зона пульса">
            <div className="flex flex-wrap gap-2">
              {ZONES.map((z) => {
                const on = state.zones.includes(z.id);
                return (
                  <button
                    key={z.id}
                    type="button"
                    aria-pressed={on}
                    aria-label={`Зона ${z.id}, ${z.name}`}
                    title={z.name}
                    onClick={() => onChange({ zones: toggle(state.zones, z.id).sort() as ZoneId[] })}
                    className={clsx(chip, "!px-3")}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: z.color, boxShadow: on ? "0 0 0 1.5px rgb(var(--asphalt))" : undefined }} aria-hidden />
                    Z{z.id}
                  </button>
                );
              })}
            </div>
          </Group>

          <Group label="Время">
            <div className="flex flex-wrap gap-2">
              {DAY_PARTS.map((p: DayPart) => (
                <button key={p} type="button" aria-pressed={state.parts.includes(p)} onClick={() => onChange({ parts: toggle(state.parts, p) })} className={chip} title={DAY_PART_LABELS[p].range}>
                  {DAY_PART_LABELS[p].short}
                  <span className="sr-only">, {DAY_PART_LABELS[p].range}</span>
                </button>
              ))}
            </div>
          </Group>

          <Select label="Направление" value={state.cls} options={classes} onChange={(cls) => onChange({ cls })} all="Все направления" />
          <Select label="Тренер" value={state.coach} options={coaches} onChange={(coach) => onChange({ coach })} all="Все тренеры" />
        </div>

        <div className="grid gap-6 border-t border-line/10 pt-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <Group label="Подсветить мою зону">
            <div className="flex flex-wrap gap-2">
              {ZONES.map((z) => {
                const on = state.highlight === z.id;
                return (
                  <button
                    key={z.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onChange({ highlight: on ? null : z.id })}
                    className={clsx(
                      "inline-flex min-h-[44px] items-center gap-2.5 rounded-full border py-1 pl-1.5 pr-4 text-[13px] transition-colors",
                      on ? "border-transparent text-asphalt" : "border-line/15 text-chalk hover:border-line/40",
                    )}
                    style={on ? { background: z.color, color: z.ink } : undefined}
                  >
                    <span
                      className="rounded-full px-2 py-1 font-display text-[12px] uppercase leading-none"
                      style={{ background: on ? "rgb(var(--asphalt) / 0.18)" : z.color, color: z.ink, fontWeight: 800, fontVariationSettings: '"wdth" 110' }}
                    >
                      Z{z.id}
                    </span>
                    <span className="hidden sm:inline">{z.name}</span>
                    <PersonalRange zone={z.id} className="text-[19px] leading-none" />
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[13px] text-dust">
              {measured
                ? "Цифры посчитаны по вашему пульсу покоя и возрасту."
                : "Цифры пока по средним данным. Измерьте пульс кнопкой в шапке сайта, и диапазоны станут вашими."}
            </p>
          </Group>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <button
              type="button"
              role="switch"
              aria-checked={state.free}
              onClick={() => onChange({ free: !state.free })}
              className="inline-flex min-h-[44px] items-center gap-3 rounded-full text-[14.5px] font-medium text-chalk"
            >
              <span className={clsx("relative h-7 w-12 flex-none rounded-full border transition-colors duration-300", state.free ? "border-pulse bg-pulse" : "border-line/25 bg-asphalt")} aria-hidden>
                <span className={clsx("absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full transition-[left,background-color] duration-300 ease-silk", state.free ? "left-[24px] bg-asphalt" : "left-[3px] bg-dust")} />
              </span>
              Только со свободными местами
            </button>
            {activeCount > 0 && (
              <button type="button" onClick={onReset} className="btn-ghost hidden !min-h-[44px] text-[14px] lg:inline-flex">
                <X className="h-4 w-4" aria-hidden />
                Сбросить фильтры
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
