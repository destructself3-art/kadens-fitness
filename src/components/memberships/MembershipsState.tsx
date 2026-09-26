"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { useLenis } from "@/components/layout/SmoothScroll";
import type { Membership } from "@/data/types";

type PlanSlug = Membership["slug"];

type State = {
  plan: PlanSlug;
  setPlan: (slug: PlanSlug) => void;
  yearly: boolean;
  setYearly: (v: boolean) => void;
  /** Pick a plan on a card and bring the visitor to the request form */
  choose: (slug: PlanSlug) => void;
};

const Ctx = createContext<State | null>(null);

export const REQUEST_ID = "request";
export const PLAN_SELECT_ID = "request-plan";

/** Shared state of /memberships: the billing period and the plan picked on a card, read by the request form. */
export function MembershipsState({ children, initialPlan }: { children: ReactNode; initialPlan: PlanSlug }) {
  const [plan, setPlan] = useState<PlanSlug>(initialPlan);
  const [yearly, setYearly] = useState(false);
  const lenis = useLenis();
  const reduce = useReducedMotion();

  const choose = useCallback(
    (slug: PlanSlug) => {
      setPlan(slug);
      const target = document.getElementById(REQUEST_ID);
      const focusSelect = () => document.getElementById(PLAN_SELECT_ID)?.focus({ preventScroll: true });
      if (!target) return;
      if (lenis) lenis.scrollTo(target, { offset: -96, immediate: !!reduce, onComplete: focusSelect });
      else {
        target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        focusSelect();
      }
    },
    [lenis, reduce],
  );

  const value = useMemo(() => ({ plan, setPlan, yearly, setYearly, choose }), [plan, yearly, choose]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMemberships(): State {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMemberships must be used inside <MembershipsState>");
  return ctx;
}
