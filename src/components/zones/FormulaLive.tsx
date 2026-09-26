"use client";

import { useState, type ReactNode } from "react";
import clsx from "clsx";
import type { ZoneId } from "@/data/types";
import { ZONES, zoneMeta } from "@/lib/zones";
import { plural } from "@/lib/format";
import { usePulse } from "@/components/pulse/PulseProvider";

/** 0.7 -> "0,7", 1 -> "1,0" */
const dec = (v: number) => v.toFixed(1).replace(".", ",");

/** A value that comes from the visitor: scarlet, with a dotted underline. */
function Input({ children }: { children: ReactNode }) {
  return <span className="text-pulse underline decoration-pulse/50 decoration-dotted decoration-2 underline-offset-[6px]">{children}</span>;
}

/** A group of formula tokens: the formula wraps between groups, never inside one. */
const G = ({ children }: { children: ReactNode }) => <span className="whitespace-nowrap">{children}</span>;

/** One step of the calculation. */
function Step({ n, title, control, note, children }: { n: string; title: string; control?: ReactNode; note: ReactNode; children: ReactNode }) {
  return (
    <li className="grid gap-4 border-t border-line/10 py-8 md:grid-cols-[120px_minmax(0,1fr)] md:gap-8 lg:py-10">
      <p className="digits text-[40px] leading-none text-dust/60 md:text-[56px]" aria-hidden>
        {n}
      </p>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="eyebrow">{title}</h3>
          {control}
        </div>
        <p className="digits mt-4 flex flex-wrap items-baseline gap-x-[0.35em] text-[34px] leading-[1.05] text-chalk sm:text-[44px] lg:text-[60px]">{children}</p>
        <p className="mt-4 max-w-[58ch] text-[15.5px] leading-relaxed text-dust">{note}</p>
      </div>
    </li>
  );
}

/** The Tanaka and Karvonen formulas with the visitor's own numbers plugged in. */
export function FormulaLive() {
  const { age, rest, hrMax, zones } = usePulse();
  const [zone, setZone] = useState<ZoneId>(3);

  const raw = 208 - 0.7 * age;
  const exact = Math.abs(raw - Math.round(raw)) < 1e-9;
  const reserve = hrMax - rest;
  const old = 220 - age;
  const diff = Math.abs(old - hrMax);
  const z = zoneMeta(zone);
  const r = zones[zone - 1];

  const oldNote =
    diff === 0
      ? `Привычная формула «220 − возраст» в ${age} ${plural(age, "год", "года", "лет")} даёт тот же максимум.`
      : `Привычная «220 − возраст» дала бы ${old}, на ${diff} ${plural(diff, "удар", "удара", "ударов")} ${old > hrMax ? "выше" : "ниже"}. Она проще, но завышает максимум у молодых и занижает у тех, кому за сорок.`;

  const switcher = (
    <div role="group" aria-label="Какую зону посчитать" className="flex gap-1.5">
      {ZONES.map((item) => {
        const active = item.id === zone;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={active}
            aria-label={`Зона ${item.id}, ${item.name}`}
            onClick={() => setZone(item.id)}
            className={clsx(
              "grid h-11 min-w-[44px] place-items-center rounded-full border px-3 font-display text-[14px] uppercase transition-colors duration-300",
              active ? "border-transparent" : "border-line/15 text-chalk hover:border-line/40",
            )}
            style={{ fontWeight: 800, fontVariationSettings: '"wdth" 110', ...(active ? { background: item.color, color: item.ink } : null) }}
          >
            Z{item.id}
          </button>
        );
      })}
    </div>
  );

  return (
    <ol className="border-b border-line/10">
      <Step n="01" title="Максимальный пульс, формула Танаки" note={oldNote}>
        <G>HRmax</G>
        <G>= 208 − 0,7 ×</G>
        <G>
          <Input>{age}</Input>
        </G>
        <G>
          {exact ? "=" : "≈"} {hrMax}
        </G>
      </Step>

      <Step n="02" title="Резерв пульса" note="Столько ударов сердце может добавить к покою под нагрузкой. Чем ниже пульс покоя, тем больше резерв и шире зоны.">
        <G>{hrMax}</G>
        <G>
          − <Input>{rest}</Input>
        </G>
        <G>= {reserve}</G>
      </Step>

      <Step
        n="03"
        title="Зона: доля резерва поверх покоя, метод Карвонена"
        control={switcher}
        note={
          <>
            {z.name}, {Math.round(z.reserve[0] * 100)}–{Math.round(z.reserve[1] * 100)} % резерва. {z.feel}. Округляем до целого удара, поэтому верхняя граница
            одной зоны совпадает с нижней границей следующей.
          </>
        }
      >
        <G>
          <span style={{ color: z.color }}>Зона {z.id}</span> =
        </G>
        <G>
          <Input>{rest}</Input> +
        </G>
        <G>
          ({hrMax} − <Input>{rest}</Input>)
        </G>
        <G>
          × {dec(z.reserve[0])}…{dec(z.reserve[1])}
        </G>
        <G>
          = {r.lo}–{r.hi}
        </G>
      </Step>
    </ol>
  );
}
