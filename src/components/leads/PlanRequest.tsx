"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Membership } from "@/data/types";
import { LeadForm } from "@/components/ui/LeadForm";
import { PLAN_SELECT_ID, useMemberships } from "@/components/memberships/MembershipsState";
import { rub } from "@/lib/format";

/** Plan select feeding the membership request. The plan picked on a card arrives here through MembershipsState. */
export function PlanRequest({ plans }: { plans: Membership[] }) {
  const { plan, setPlan, yearly } = useMemberships();
  const reduce = useReducedMotion();
  const current = plans.find((p) => p.slug === plan) ?? plans[0];
  const price = yearly && current.priceYearly ? current.priceYearly : current.price;

  return (
    <div className="grid gap-6">
      <div>
        <label htmlFor={PLAN_SELECT_ID} className="field-label">
          Абонемент
        </label>
        <select id={PLAN_SELECT_ID} className="field" value={current.slug} onChange={(e) => setPlan(e.target.value as Membership["slug"])}>
          {plans.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name} — {rub(p.price)} {p.unit}
            </option>
          ))}
        </select>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-line/10 bg-asphalt/60 p-5" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${current.slug}-${yearly}`}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2"
          >
            <div>
              <p className="font-display text-[26px] uppercase leading-none" style={{ fontVariationSettings: '"wdth" 70', fontWeight: 850 }}>
                {current.name}
              </p>
              <p className="mt-2 text-[13.5px] text-dust">{current.hours}</p>
            </div>
            <p className="flex items-baseline gap-2">
              <span className="digits text-[44px] leading-none text-chalk">{rub(price).replace(" ₽", "")}</span>
              <span className="text-[13.5px] text-dust">
                ₽ {current.unit}
                {yearly && current.priceYearly ? ", при оплате за год" : ""}
              </span>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <LeadForm
        kind="membership"
        plan={current.slug}
        fields={["comment"]}
        commentPlaceholder="Удобное время для звонка, вопросы о карте"
        submitLabel="Отправить заявку"
        successTitle="Заявка у нас"
        successText={`Администратор перезвонит в течение часа в рабочее время клуба и расскажет, как оформить «${current.name}». Оплата — на ресепшене.`}
      />
    </div>
  );
}
