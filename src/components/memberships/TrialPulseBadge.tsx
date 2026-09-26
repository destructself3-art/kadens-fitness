"use client";

import { BeatDot } from "@/components/pulse/Beat";
import { usePulse } from "@/components/pulse/PulseProvider";

/** A small monitor readout in the /trial hero: the visitor's resting pulse, beating. */
export function TrialPulseBadge({ tapHref }: { tapHref: string }) {
  const { rest, measured, hydrated } = usePulse();
  return (
    <div className="inline-flex items-center gap-4 rounded-full border border-line/15 bg-asphalt/70 py-2 pl-4 pr-5 backdrop-blur">
      <BeatDot className="h-2.5 w-2.5 text-pulse" />
      <p className="flex items-baseline gap-2 text-[13.5px] text-dust">
        <span className="digits text-[30px] leading-none text-chalk">{hydrated ? rest : "··"}</span>
        <span>
          уд/мин{" "}
          {measured ? (
            "— ваш пульс покоя, тренер его увидит"
          ) : (
            <>
              — пока средний.{" "}
              <a href={tapHref} className="link-underline text-chalk">
                Отстучать свой
              </a>
            </>
          )}
        </span>
      </p>
    </div>
  );
}
