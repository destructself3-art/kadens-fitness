"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getGoal } from "@/data/goals";
import type { GoalSlug } from "@/data/types";
import { useLenis } from "@/components/layout/SmoothScroll";
import { usePulse } from "@/components/pulse/PulseProvider";
import { FormError } from "@/components/ui/Form";
import { LEVEL_LABELS, TIME_OF_DAY_LABELS, type Program, type ProgramLevel, type TimeOfDay } from "@/lib/program";
import { StepDays, StepGoal, StepLevel, StepPulse, StepTimes, timesWord } from "./BuilderSteps";
import { BUILDER_STEPS, DAYS_ADVICE } from "./copy";
import { ProgramResult } from "./ProgramResult";

export type ProgramAnswers = { goal: GoalSlug; level: ProgramLevel; days: number; times: TimeOfDay[] };

type Draft = { goal: GoalSlug | null; level: ProgramLevel | null; days: number | null; times: TimeOfDay[] };

const LAST = BUILDER_STEPS.length - 1;
const EASE = [0.16, 1, 0.3, 1] as const;

const timesSummary = (times: TimeOfDay[]) =>
  times.length === 0 ? "в любое время" : times.map((t) => TIME_OF_DAY_LABELS[t].split(",")[0].toLowerCase()).join(", ");

/**
 * The program builder: five questions, then a week of real classes from /api/program.
 * One <form>: Enter moves forward, native radio groups handle the arrow keys.
 */
export function ProgramBuilder({ initialGoal, today }: { initialGoal: GoalSlug | null; today: string }) {
  const pulse = usePulse();
  const lenis = useLenis();
  const reduce = useReducedMotion();
  const [draft, setDraft] = useState<Draft>({ goal: initialGoal, level: null, days: null, times: ["evening"] });
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const [missing, setMissing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ program: Program; answers: ProgramAnswers } | null>(null);
  const [view, setView] = useState<"steps" | "result">("steps");

  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  const days = draft.days ?? (draft.goal ? DAYS_ADVICE[draft.goal].best : 3);

  // After a step change: focus the new heading (screen readers announce it) and bring the builder into view.
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    headingRef.current?.focus({ preventScroll: true });
    const root = rootRef.current;
    if (!root) return;
    const top = root.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.6) {
      if (lenis) lenis.scrollTo(root, { offset: -96, immediate: !!reduce });
      else root.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }, [step, view, lenis, reduce]);

  // A goal link on this page (?goal=…#builder) changes the prop without a remount: take the new goal.
  const goalProp = useRef(initialGoal);
  useEffect(() => {
    if (initialGoal === goalProp.current) return;
    goalProp.current = initialGoal;
    if (!initialGoal) return;
    setDraft((d) => ({ ...d, goal: initialGoal }));
    setView("steps");
    moved.current = true;
    setMissing(null);
    setError(null);
    setStep(1);
    setReached((r) => Math.max(r, 1));
  }, [initialGoal]);

  function go(index: number) {
    moved.current = true;
    setMissing(null);
    setError(null);
    setStep(index);
    setReached((r) => Math.max(r, index));
  }

  function update(patch: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...patch }));
    setMissing(null);
  }

  async function build() {
    if (!draft.goal) return go(1);
    if (!draft.level) return go(2);
    const answers: ProgramAnswers = { goal: draft.goal, level: draft.level, days, times: draft.times };
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/program", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !Array.isArray(data.items)) {
        setError(data?.error ?? "Не получилось собрать неделю. Попробуйте ещё раз.");
        return;
      }
      moved.current = true;
      setResult({ program: data as Program, answers });
      setView("result");
    } catch {
      setError("Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  function next(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (step === 1 && !draft.goal) return setMissing("Выберите цель, чтобы идти дальше.");
    if (step === 2 && !draft.level) return setMissing("Выберите уровень, чтобы идти дальше.");
    if (step < LAST) go(step + 1);
    else void build();
  }

  function backToSteps(index: number) {
    setView("steps");
    go(index);
  }

  const summary = (i: number): string | null => {
    switch (BUILDER_STEPS[i].key) {
      case "pulse":
        return pulse.hydrated && pulse.measured ? `${pulse.rest} уд/мин, ${pulse.age} лет` : `${pulse.rest} уд/мин, в среднем`;
      case "goal":
        return draft.goal ? getGoal(draft.goal).title : null;
      case "level":
        return draft.level ? LEVEL_LABELS[draft.level] : null;
      case "days":
        return i <= reached ? `${days} ${timesWord(days)} в неделю` : null;
      case "times":
        return i <= reached ? timesSummary(draft.times) : null;
    }
  };

  const current = BUILDER_STEPS[step];
  const motionProps = reduce
    ? {}
    : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.45, ease: EASE } };

  return (
    <div ref={rootRef} className="relative overflow-hidden rounded-[28px] border border-line/10 bg-graphite">
      {view === "result" && result ? (
        <ProgramResult
          program={result.program}
          answers={result.answers}
          today={today}
          headingRef={headingRef}
          onRebuild={() => backToSteps(0)}
          onEditTimes={() => backToSteps(LAST)}
        />
      ) : (
        <form onSubmit={next} noValidate aria-busy={loading} className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* Progress rail, desktop */}
          <aside className="hidden border-r border-line/10 bg-asphalt/40 p-8 lg:block">
            <p className="eyebrow">Пять шагов</p>
            <ol className="mt-8 grid gap-1">
              {BUILDER_STEPS.map((s, i) => {
                const isCurrent = i === step;
                const open = i <= reached;
                const text = open ? summary(i) : null;
                return (
                  <li key={s.key}>
                    <button
                      type="button"
                      onClick={() => go(i)}
                      disabled={!open || isCurrent}
                      aria-current={isCurrent ? "step" : undefined}
                      className={clsx(
                        "group grid w-full grid-cols-[40px_1fr] items-start gap-x-2 rounded-xl px-3 py-3 text-left transition-colors",
                        isCurrent ? "bg-raised" : open ? "hover:bg-raised/60" : "cursor-default",
                      )}
                    >
                      <span className={clsx("digits text-[26px] leading-none", isCurrent ? "text-pulse" : open ? "text-chalk" : "text-dust/50")}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className={clsx("block text-[15px] font-semibold", open ? "text-chalk" : "text-dust/60")}>{s.title}</span>
                        {text && <span className="mt-0.5 block truncate text-[13px] text-dust">{text}</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="mt-8 h-px bg-line/10" aria-hidden />
            <p className="mt-6 text-[13px] leading-relaxed text-dust">
              В программу попадут только настоящие занятия ближайших 7 дней, где сейчас есть свободные места.
            </p>
          </aside>

          <div className="flex min-h-[640px] min-w-0 flex-col p-5 sm:p-8 lg:p-12">
            {/* Progress, phones and tablets */}
            <div className="mb-8 lg:hidden" aria-hidden>
              <div className="flex gap-1.5">
                {BUILDER_STEPS.map((s, i) => (
                  <span key={s.key} className={clsx("h-1 flex-1 rounded-full transition-colors", i < step ? "bg-chalk" : i === step ? "bg-pulse" : "bg-line/15")} />
                ))}
              </div>
            </div>

            <p className="eyebrow">
              Шаг <span className="digits text-[17px] tracking-normal text-chalk">{step + 1}</span> из{" "}
              <span className="digits text-[17px] tracking-normal">{BUILDER_STEPS.length}</span> · {current.title}
            </p>
            <h2 ref={headingRef} tabIndex={-1} className="display mt-4 max-w-3xl text-d-3 stretch-narrow focus:outline-none sm:stretch-normal">
              {current.question}
            </h2>

            <div className="mt-8 flex-1 sm:mt-10">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={current.key} {...motionProps}>
                  {current.key === "pulse" && <StepPulse />}
                  {current.key === "goal" && <StepGoal value={draft.goal} onChange={(goal) => update({ goal })} />}
                  {current.key === "level" && <StepLevel value={draft.level} onChange={(level) => update({ level })} />}
                  {current.key === "days" && <StepDays value={days} goal={draft.goal} level={draft.level} onChange={(d) => update({ days: d })} />}
                  {current.key === "times" && <StepTimes value={draft.times} onChange={(times) => update({ times })} />}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-8" aria-live="assertive">
              {missing && <p className="text-[14.5px] font-medium text-pulse">{missing}</p>}
            </div>
            <FormError className="mt-2">{error}</FormError>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-line/10 pt-6">
              <button type="button" className="btn-ghost" onClick={() => go(step - 1)} disabled={step === 0 || loading}>
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Назад
              </button>
              <button type="submit" className="btn-primary min-w-[168px]" disabled={loading}>
                {step < LAST ? "Дальше" : loading ? "Собираем неделю…" : "Собрать неделю"}
                {!loading && <ArrowRight className="h-4 w-4" aria-hidden />}
              </button>
            </div>
            <p className="sr-only" aria-live="polite">
              {loading ? "Собираем неделю из расписания" : ""}
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
