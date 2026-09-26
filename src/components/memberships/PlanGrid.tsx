"use client";

import { useRef, type ReactNode } from "react";
import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import type { Membership } from "@/data/types";
import { MembershipCard } from "@/components/ui/Cards";
import { useBeat } from "@/components/pulse/PulseProvider";
import { rub } from "@/lib/format";
import { useMemberships } from "./MembershipsState";

/** The popular plan breathes with the visitor's pulse: a scarlet glow swells on every beat. */
function BeatGlow({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useBeat(ref, (el, beat) => {
    el.style.boxShadow = `0 0 ${Math.round(beat * 44)}px rgb(255 58 36 / ${(beat * 0.32).toFixed(3)})`;
  });
  return (
    <div ref={ref} className="h-full rounded-card">
      {children}
    </div>
  );
}

/** Monthly / yearly segmented switch. */
export function BillingToggle({ saving, labels }: { saving: number; labels: { monthly: string; yearly: string } }) {
  const { yearly, setYearly } = useMemberships();
  const reduce = useReducedMotion();
  const options = [
    { value: false, label: labels.monthly },
    { value: true, label: labels.yearly },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <div role="group" aria-label="Период оплаты" className="relative inline-grid grid-cols-2 rounded-full border border-line/15 bg-graphite p-1">
        {options.map((o) => {
          const active = yearly === o.value;
          return (
            <button
              key={o.label}
              type="button"
              aria-pressed={active}
              onClick={() => setYearly(o.value)}
              className={clsx(
                "relative z-10 flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 text-[14.5px] font-semibold transition-colors duration-300",
                active ? "text-asphalt" : "text-dust hover:text-chalk",
              )}
            >
              {active && (
                <motion.span
                  layoutId="billing-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-chalk"
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }}
                  aria-hidden
                />
              )}
              {o.label}
              {o.value && saving > 0 && <span className={clsx("digits text-[17px] leading-none", active ? "text-pulse" : "text-pulse/80")}>−{saving}%</span>}
            </button>
          );
        })}
      </div>
      <p className="text-[13.5px] text-dust" aria-live="polite">
        {yearly ? "Цена за месяц при оплате года одной суммой" : "Цена за месяц при помесячной оплате"}
      </p>
    </div>
  );
}

/** The six plans. The yearly switch changes the price on every card that has a yearly option. */
export function PlanGrid({ plans }: { plans: Membership[] }) {
  const { yearly, choose } = useMemberships();
  return (
    <ul className="grid gap-x-5 gap-y-10 pt-3 sm:grid-cols-2 xl:grid-cols-3">
      {plans.map((plan) => {
        const yearTotal = yearly && plan.priceYearly ? plan.priceYearly * 12 : null;
        const cta = (
          <div className="grid gap-3">
            <p className="min-h-[20px] text-[13px] text-dust">
              {yearTotal ? (
                <>
                  <span className="digits text-[17px] text-chalk">{rub(yearTotal)}</span> одной суммой за 12 месяцев
                </>
              ) : yearly && !plan.priceYearly ? (
                "Годового варианта нет"
              ) : null}
            </p>
            <button type="button" onClick={() => choose(plan.slug)} className={clsx("w-full", plan.highlight ? "btn-primary" : "btn-ghost")}>
              Оставить заявку
              <span className="sr-only"> на абонемент «{plan.name}»</span>
            </button>
          </div>
        );
        const card = <MembershipCard plan={plan} yearly={yearly} cta={cta} />;
        return (
          <li key={plan.slug} className={clsx("h-full", plan.highlight && "xl:-mt-3")}>
            {plan.highlight ? <BeatGlow>{card}</BeatGlow> : card}
          </li>
        );
      })}
    </ul>
  );
}
