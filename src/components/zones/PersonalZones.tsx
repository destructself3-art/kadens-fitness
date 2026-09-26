"use client";

import { usePulse } from "@/components/pulse/PulseProvider";
import { PulseTap } from "@/components/pulse/PulseTap";
import { PulseControls, ZoneBar, ZoneScale } from "@/components/pulse/Zones";
import { DEFAULT_AGE, DEFAULT_REST } from "@/lib/zones";

/** The personal block on cardiogram paper: measure, adjust, see all five ranges. */
export function PersonalZones() {
  const { measured, hydrated, rest, age, reset } = usePulse();
  const own = hydrated && measured;

  return (
    <div className="ecg-grid grid gap-10 rounded-card border border-line/10 bg-graphite p-5 sm:p-8 md:grid-cols-2 lg:grid-cols-1 lg:p-10 xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] xl:gap-14 xl:p-12">
      <div className="flex flex-col">
        <PulseTap size="hero" />
        <div className="mt-8 border-t border-line/10 pt-6">
          <PulseControls />
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-8 text-[13.5px] text-dust">
          <p className="max-w-[40ch]">
            {own
              ? `Считаем по вашим данным: пульс покоя ${rest}, возраст ${age}. Цифры хранятся только в этом браузере.`
              : `Сейчас расчёт по средним данным: пульс покоя ${DEFAULT_REST}, возраст ${DEFAULT_AGE}.`}
          </p>
          {own && (
            <button type="button" onClick={reset} className="btn-quiet min-h-[44px] px-0 text-[13.5px]">
              Сбросить
            </button>
          )}
        </div>
      </div>
      <div>
        <p className="eyebrow">От пульса покоя до максимума</p>
        <ZoneBar className="mt-5" />
        <ZoneScale showFeel className="mt-8" />
      </div>
    </div>
  );
}
