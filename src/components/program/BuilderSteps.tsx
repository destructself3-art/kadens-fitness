"use client";

import Link from "next/link";
import clsx from "clsx";
import { Check } from "lucide-react";
import { GOALS, getGoal } from "@/data/goals";
import type { GoalSlug, ZoneId } from "@/data/types";
import { usePulse } from "@/components/pulse/PulseProvider";
import { PulseTap } from "@/components/pulse/PulseTap";
import { PulseControls, ZoneBar } from "@/components/pulse/Zones";
import { ZoneBadge } from "@/components/ui/Kit";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { HOURS_LABEL } from "@/lib/club";
import { plural } from "@/lib/format";
import { LEVEL_LABELS, TIME_OF_DAY_LABELS, targetZones, type ProgramLevel, type TimeOfDay } from "@/lib/program";
import { ZONES } from "@/lib/zones";
import { DAYS_ADVICE, LEVEL_DETAILS, TIME_HINTS } from "./copy";
import { ZoneMixBar, pct } from "./ZoneMix";

// Shared look of a selectable tile built on a visually hidden native input:
// arrow keys, Space and screen readers work as with any radio group or checkbox list.
const tile =
  "relative cursor-pointer rounded-2xl border transition-[border-color,background-color] duration-300 ease-silk " +
  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-chalk";
const tileState = (on: boolean) => (on ? "border-pulse bg-pulse/[0.07]" : "border-line/15 bg-asphalt/40 hover:border-line/35");

function Tick({ on, className }: { on: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={clsx(
        "grid h-6 w-6 flex-none place-items-center rounded-full border transition-colors",
        on ? "border-pulse bg-pulse text-asphalt" : "border-line/30 text-transparent",
        className,
      )}
    >
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </span>
  );
}

// ---------- 1. Pulse ----------

export function StepPulse() {
  const { measured, hydrated, rest, hrMax } = usePulse();
  return (
    <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
      {/* The hero tap does not fit a phone next to its button: a compact one there. */}
      <PulseTap size="compact" className="sm:hidden" />
      <PulseTap size="hero" className="hidden sm:flex" />
      <div>
        <PulseControls />
        <ZoneBar className="mt-8" />
        <p className="mt-6 text-[14.5px] leading-relaxed text-dust" aria-live="polite">
          {hydrated && measured ? (
            <>
              Зоны посчитаны от вашего пульса покоя <span className="digits text-[18px] text-chalk">{rest}</span> и максимума{" "}
              <span className="digits text-[18px] text-chalk">{hrMax}</span>. Можно идти дальше.
            </>
          ) : (
            <>
              Пока цифры средние: пульс покоя <span className="digits text-[18px] text-chalk">{rest}</span>. Идти дальше можно и так, но пульсовые
              коридоры в программе будут примерными. Десять секунд тапа сделают их вашими.
            </>
          )}
        </p>
        <p className="mt-3 text-[14.5px] leading-relaxed text-dust">
          Нужна точность?{" "}
          <Link href="/program/ruffier" className="text-chalk underline decoration-line/40 underline-offset-4 hover:decoration-chalk">
            Проба Руфье
          </Link>{" "}
          (30 приседаний и три замера) покажет ещё и то, как сердце восстанавливается после нагрузки.
        </p>
      </div>
    </div>
  );
}

// ---------- 2. Goal ----------

export function StepGoal({ value, onChange }: { value: GoalSlug | null; onChange: (goal: GoalSlug) => void }) {
  const selected = value ? getGoal(value) : null;
  return (
    <div>
      <fieldset>
        <legend className="sr-only">Цель тренировок</legend>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {GOALS.map((g, i) => {
            const on = value === g.slug;
            return (
              <label
                key={g.slug}
                className={clsx(tile, tileState(on), "group flex items-center gap-4 overflow-hidden p-2.5 pr-4 xl:block xl:p-0")}
              >
                <input type="radio" name="goal" value={g.slug} checked={on} onChange={() => onChange(g.slug)} className="sr-only" />
                <MediaFrame
                  shot={g.photo}
                  alt=""
                  quiet
                  sizes="(min-width: 1360px) 210px, 88px"
                  className="aspect-square w-16 flex-none rounded-xl sm:w-[88px] xl:aspect-[5/6] xl:w-auto xl:rounded-none"
                  imgClassName={clsx("transition-[transform,opacity] duration-700 ease-silk group-hover:scale-[1.04]", on ? "opacity-95" : "opacity-60")}
                />
                <span className="absolute inset-0 hidden bg-gradient-to-t from-asphalt via-asphalt/55 to-transparent xl:block" aria-hidden />
                <span className="digits absolute left-3 top-2 hidden text-[22px] text-chalk/70 xl:block" aria-hidden>
                  0{i + 1}
                </span>
                <span className="min-w-0 flex-1 pr-8 xl:absolute xl:inset-x-0 xl:bottom-0 xl:p-4">
                  <span
                    className="block font-display text-[18px] uppercase leading-[0.92] text-chalk sm:text-[20px] xl:text-[22px]"
                    style={{ fontVariationSettings: '"wdth" 56', fontWeight: 850 }}
                  >
                    {g.title}
                  </span>
                  <span className="mt-1.5 line-clamp-2 block text-[13px] leading-snug text-dust xl:line-clamp-3 xl:text-chalk/75">{g.short}</span>
                </span>
                <Tick on={on} className="absolute right-3 top-3" />
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 min-h-[140px] rounded-2xl border border-line/10 p-5 sm:p-6" aria-live="polite">
        {selected ? (
          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:gap-10">
            <div>
              <p className="eyebrow">{selected.title}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-dust">{selected.description}</p>
            </div>
            <div>
              <p className="text-[13.5px] text-dust">Время недели по зонам</p>
              <ZoneMixBar shares={selected.zoneMix} className="mt-3" label={`Цель «${selected.title}»: доли зон`} />
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-dust">
                {ZONES.filter((z) => selected.zoneMix[z.id] > 0).map((z) => (
                  <li key={z.id}>
                    Z{z.id} <span className="digits text-[17px] text-chalk">{pct(selected.zoneMix[z.id])}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-[15px] text-dust">Выберите цель: от неё зависит, сколько времени недели уйдёт на каждую пульсовую зону.</p>
        )}
      </div>
    </div>
  );
}

// ---------- 3. Level ----------

const LEVELS: ProgramLevel[] = ["new", "regular", "advanced"];

export function StepLevel({ value, onChange }: { value: ProgramLevel | null; onChange: (level: ProgramLevel) => void }) {
  return (
    <fieldset>
      <legend className="sr-only">Уровень подготовки</legend>
      <div className="grid gap-3">
        {LEVELS.map((level) => {
          const on = value === level;
          const { cap, text } = LEVEL_DETAILS[level];
          return (
            <label key={level} className={clsx(tile, tileState(on), "grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6")}>
              <input type="radio" name="level" value={level} checked={on} onChange={() => onChange(level)} className="sr-only" />
              <span className="flex items-start gap-4">
                <Tick on={on} className="mt-1" />
                <span>
                  <span className="block text-[18px] font-semibold text-chalk sm:text-[20px]">{LEVEL_LABELS[level]}</span>
                  <span className="mt-1.5 block max-w-xl text-[14.5px] leading-relaxed text-dust">{text}</span>
                </span>
              </span>
              <span className="flex items-center gap-3 pl-10 sm:pl-0">
                <span className="flex items-end gap-1" aria-hidden>
                  {ZONES.map((z) => (
                    <span
                      key={z.id}
                      className="w-3 rounded-[3px] transition-opacity"
                      style={{ height: 8 + z.id * 6, background: z.color, opacity: z.id <= cap ? 1 : 0.14 }}
                    />
                  ))}
                </span>
                <span className="text-[13px] text-dust">
                  до <span className="font-semibold text-chalk">Z{cap}</span>
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

// ---------- 4. Days ----------

export const timesWord = (n: number) => plural(n, "раз", "раза", "раз");

export function StepDays({
  value,
  goal,
  level,
  onChange,
}: {
  value: number;
  goal: GoalSlug | null;
  level: ProgramLevel | null;
  onChange: (days: number) => void;
}) {
  const advice = goal ? DAYS_ADVICE[goal] : null;
  const zones: ZoneId[] = goal ? targetZones(goal, level ?? "regular", value) : [];
  return (
    <div>
      <fieldset>
        <legend className="sr-only">Занятий в неделю</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[2, 3, 4, 5].map((n) => {
            const on = value === n;
            const best = advice?.best === n;
            return (
              <label key={n} className={clsx(tile, tileState(on), "flex min-h-[132px] flex-col justify-between p-4 sm:p-5")}>
                <input type="radio" name="days" value={n} checked={on} onChange={() => onChange(n)} className="sr-only" />
                <span className="flex flex-wrap items-start justify-between gap-2">
                  <span className={clsx("digits text-[72px] leading-[0.8]", on ? "text-pulse" : "text-chalk")}>{n}</span>
                  {best && <span className="rounded-full border border-line/25 px-2 py-0.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-chalk">Советуем</span>}
                </span>
                <span className="text-[14px] text-dust">{timesWord(n)} в неделю</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="mt-6 grid gap-6 rounded-2xl border border-line/10 p-5 sm:p-6 md:grid-cols-[1.2fr_1fr] md:gap-10">
        <p className="text-[15px] leading-relaxed text-dust">{advice?.text ?? "Выберите цель на втором шаге, и мы подскажем, сколько раз в неделю ей нужно."}</p>
        {zones.length > 0 && (
          <div aria-live="polite">
            <p className="text-[13.5px] text-dust">Так разложим занятия по зонам</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {[...zones].sort((a, b) => a - b).map((z, i) => (
                <li key={`${z}-${i}`} className="rounded-full border border-line/15 px-2.5 py-1.5">
                  <ZoneBadge zone={z} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- 5. Times ----------

const TIMES: TimeOfDay[] = ["morning", "day", "evening"];

export function StepTimes({ value, onChange }: { value: TimeOfDay[]; onChange: (times: TimeOfDay[]) => void }) {
  const toggle = (t: TimeOfDay) => onChange(value.includes(t) ? value.filter((v) => v !== t) : TIMES.filter((v) => v === t || value.includes(v)));
  return (
    <div>
      <fieldset>
        <legend className="sr-only">Удобное время, можно несколько</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {TIMES.map((t) => {
            const on = value.includes(t);
            const [title, range] = TIME_OF_DAY_LABELS[t].split(", ");
            return (
              <label key={t} className={clsx(tile, tileState(on), "flex min-h-[150px] flex-col justify-between gap-6 p-5")}>
                <input type="checkbox" name="times" value={t} checked={on} onChange={() => toggle(t)} className="sr-only" />
                <span className="flex items-start justify-between gap-3">
                  <span className="display text-[34px] leading-none stretch-narrow">{title}</span>
                  <Tick on={on} />
                </span>
                <span>
                  <span className="digits block text-[24px] leading-none text-chalk">{range}</span>
                  <span className="mt-2 block text-[13.5px] text-dust">{TIME_HINTS[t]}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <p className="mt-5 text-[14.5px] text-dust" aria-live="polite">
        {value.length === 0
          ? "Ничего не выбрано: подберём занятия в любое время дня."
          : `Клуб открыт ${HOURS_LABEL.map((h) => `${h.days.toLowerCase()} ${h.time}`).join(", ")}. Можно выбрать несколько вариантов.`}
      </p>
    </div>
  );
}
