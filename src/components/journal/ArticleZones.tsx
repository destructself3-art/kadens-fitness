"use client";

import Link from "next/link";
import { usePulse } from "@/components/pulse/PulseProvider";
import { PulseTap } from "@/components/pulse/PulseTap";
import { ZoneScale } from "@/components/pulse/Zones";

/** The personal zones widget inside an article: tap your pulse, see your five ranges. */
export function ArticleZones() {
  const { age, hydrated, measured } = usePulse();
  return (
    <aside aria-label="Ваши пульсовые зоны" className="ecg-grid my-12 rounded-card border border-line/10 bg-graphite p-5 sm:p-7 lg:-mx-10 lg:p-10">
      <div className="grid gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] md:gap-10">
        <div className="flex flex-col">
          <PulseTap size="compact" />
          <p className="mt-auto pt-4 text-[13.5px] leading-relaxed text-dust">
            {hydrated && measured ? `Зоны посчитаны по вашему пульсу покоя и возрасту ${age}. ` : "Пока зоны по средним данным. "}
            <Link href="/zones" className="link-underline text-chalk">
              Поправить возраст и узнать больше о зонах
            </Link>
          </p>
        </div>
        <ZoneScale />
      </div>
    </aside>
  );
}
