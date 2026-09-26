"use client";

import { useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";
import { useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Volume2, VolumeX } from "lucide-react";
import { useLenis } from "@/components/layout/SmoothScroll";
import { COUNT_LIMITS, RUFFIER_NEEDS, RUFFIER_SAFETY, RUFFIER_STAGE_TEXT } from "./copy";
import { CountInput, countError, parseCount, type CountKey, type Counts } from "./RuffierInputs";
import { RuffierResult } from "./RuffierResult";
import { CountWindow, MIN_TAPS, RecoveryStage, SquatsStage, TapMeter } from "./RuffierTimed";
import { useBeeper, useWakeLock } from "./ruffier-hooks";

type Stage = "intro" | "p1" | "squats" | "recovery" | "result" | "manual";
type Errors = Partial<Record<CountKey, string>>;

const STEPS: { stage: Stage; label: string; title: string }[] = [
  { stage: "intro", label: "Подготовка", title: "Перед началом" },
  { stage: "p1", label: "P1", title: "Пульс в покое" },
  { stage: "squats", label: "30 приседаний", title: "30 приседаний за 45 секунд" },
  { stage: "recovery", label: "P2 и P3", title: "Минута восстановления" },
  { stage: "result", label: "Индекс", title: "Ваш результат" },
];

const EMPTY: Counts = { p1: "", p2: "", p3: "" };

// Tap-along P1 is already per minute: keep it inside the same plausible range as the 15-second count ×4.
const P1_BPM = { min: COUNT_LIMITS.p1.min * 4, max: COUNT_LIMITS.p1.max * 4 };

/**
 * The guided Ruffier test: P1, 30 squats in 45 seconds to a metronome, P2 and P3 in the recovery minute, the index.
 * Works on a phone: big digits, optional beeps, the screen stays on while a timer runs.
 */
export function RuffierTest() {
  const reduce = useReducedMotion() ?? false;
  const lenis = useLenis();
  const [stage, setStage] = useState<Stage>("intro");
  const [counts, setCounts] = useState<Counts>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [p1Mode, setP1Mode] = useState<"count" | "tap">("count");
  const [tapBpm, setTapBpm] = useState<number | null>(null);
  const [tapError, setTapError] = useState<string | null>(null);
  const [sound, setSound] = useState(false);
  // Bumped on restart so every timed stage mounts fresh.
  const [attempt, setAttempt] = useState(0);
  const { prime, beep } = useBeeper(sound);

  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  useWakeLock(stage === "p1" || stage === "squats" || stage === "recovery");

  // After a stage change: focus its heading (screen readers announce it) and bring the test into view.
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    headingRef.current?.focus({ preventScroll: true });
    const root = rootRef.current;
    if (!root) return;
    const top = root.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.5) {
      if (lenis) lenis.scrollTo(root, { offset: -88, immediate: reduce });
      else root.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }, [stage, attempt, lenis, reduce]);

  function go(next: Stage) {
    moved.current = true;
    setStage(next);
  }

  function setCount(key: CountKey, value: string) {
    setCounts((c) => ({ ...c, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  /** Validates the given counts, shows the errors and returns true when all are fine. */
  function check(keys: CountKey[]): boolean {
    const next: Errors = {};
    for (const k of keys) {
      const err = countError(k, counts[k]);
      if (err) next[k] = err;
    }
    setErrors((e) => ({ ...e, ...Object.fromEntries(keys.map((k) => [k, next[k]])) }));
    return Object.keys(next).length === 0;
  }

  function restart() {
    setCounts(EMPTY);
    setErrors({});
    setTapBpm(null);
    setTapError(null);
    setAttempt((a) => a + 1);
    go("p1");
  }

  function toggleSound() {
    if (!sound) prime();
    setSound((s) => !s);
  }

  function nextFromP1() {
    if (p1Mode === "count") {
      if (check(["p1"])) go("squats");
      return;
    }
    if (!tapBpm) return setTapError(`Нажмите в такт пульсу хотя бы ${MIN_TAPS} раз подряд.`);
    if (tapBpm > P1_BPM.max) return setTapError(`Для пульса в покое ${tapBpm} многовато. Полежите ещё пару минут и перемерьте.`);
    if (tapBpm < P1_BPM.min) return setTapError(`${tapBpm} ударов в минуту — слишком редко. Похоже, часть ударов пропущена: перемерьте.`);
    setTapError(null);
    go("squats");
  }

  const p1 = p1Mode === "tap" ? (tapBpm ?? 0) : (parseCount(counts.p1) ?? 0) * 4;
  const p2 = (parseCount(counts.p2) ?? 0) * 4;
  const p3 = (parseCount(counts.p3) ?? 0) * 4;

  const stepIndex = STEPS.findIndex((s) => s.stage === stage);
  const title = stage === "manual" ? "Ввести результаты" : STEPS[stepIndex].title;

  return (
    <div ref={rootRef} className="overflow-hidden rounded-[28px] border border-line/10 bg-graphite">
      {/* Progress and sound */}
      <div className="flex items-center justify-between gap-4 border-b border-line/10 px-5 py-4 sm:px-8 lg:px-12">
        <div className="min-w-0 flex-1">
          {stage === "manual" ? (
            <p className="eyebrow">Без таймера</p>
          ) : (
            <>
              <p className="eyebrow">
                Шаг <span className="digits text-[17px] tracking-normal text-chalk">{stepIndex + 1}</span> из{" "}
                <span className="digits text-[17px] tracking-normal">{STEPS.length}</span> · {STEPS[stepIndex].label}
              </p>
              <ol className="mt-3 flex max-w-md gap-1.5" aria-label="Этапы пробы">
                {STEPS.map((s, i) => (
                  <li key={s.stage} className="flex-1" aria-current={i === stepIndex ? "step" : undefined}>
                    <span className="sr-only">{s.label}</span>
                    <span className={clsx("block h-1 rounded-full transition-colors", i < stepIndex ? "bg-chalk" : i === stepIndex ? "bg-pulse" : "bg-line/15")} aria-hidden />
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
        {stage !== "result" && stage !== "manual" && (
          <button type="button" className="chip min-h-[44px] flex-none px-4" aria-pressed={sound} onClick={toggleSound}>
            {sound ? <Volume2 className="h-4 w-4" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}
            Звук
          </button>
        )}
      </div>

      <div className="p-5 sm:p-8 lg:p-12">
        <h3 ref={headingRef} tabIndex={-1} className="display mb-8 max-w-3xl text-d-3 stretch-narrow focus:outline-none sm:mb-10">
          {title}
        </h3>

        {stage === "intro" && (
          <Intro
            onStart={() => {
              if (sound) prime();
              go("p1");
            }}
            onManual={() => {
              setP1Mode("count");
              go("manual");
            }}
          />
        )}

        {stage === "p1" && (
          <>
            <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-14 [&>*]:min-w-0">
              <div>
                <p className="max-w-xl text-[16px] leading-relaxed text-dust">{p1Mode === "count" ? RUFFIER_STAGE_TEXT.p1 : RUFFIER_STAGE_TEXT.p1Tap}</p>
                <fieldset className="mt-6">
                  <legend className="field-label">Как считаем</legend>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["count", "15 секунд по таймеру"],
                        ["tap", "Тапаю в такт"],
                      ] as const
                    ).map(([mode, label]) => (
                      <label
                        key={mode}
                        data-active={p1Mode === mode}
                        className="chip min-h-[44px] cursor-pointer px-4 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-chalk"
                      >
                        <input
                          type="radio"
                          name="p1-mode"
                          value={mode}
                          checked={p1Mode === mode}
                          onChange={() => {
                            setP1Mode(mode);
                            setTapError(null);
                          }}
                          className="sr-only"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
              <div className="grid content-start gap-8">
                {p1Mode === "count" ? (
                  <>
                    <CountWindow key={`p1-${attempt}`} beep={beep} onPrime={prime} />
                    <CountInput countKey="p1" label="P1: ударов за 15 секунд" value={counts.p1} onChange={(v) => setCount("p1", v)} error={errors.p1} />
                  </>
                ) : (
                  <>
                    <TapMeter
                      key={`tap-${attempt}`}
                      bpm={tapBpm}
                      onBpm={(bpm) => {
                        setTapBpm(bpm);
                        setTapError(null);
                      }}
                    />
                    {tapError && (
                      <p role="alert" className="field-error -mt-4">
                        {tapError}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
            <StageNav onBack={() => go("intro")} onNext={nextFromP1} nextLabel="Дальше: приседания" />
          </>
        )}

        {stage === "squats" && (
          <>
            <p className="mb-8 max-w-2xl text-[16px] leading-relaxed text-dust">{RUFFIER_STAGE_TEXT.squats}</p>
            <SquatsStage key={`squats-${attempt}`} beep={beep} onPrime={prime} onDone={() => go("recovery")} reduce={reduce} />
            <StageNav onBack={() => go("p1")} backLabel="Назад к P1" />
          </>
        )}

        {stage === "recovery" && (
          <>
            <p className="mb-8 max-w-2xl text-[16px] leading-relaxed text-dust">{RUFFIER_STAGE_TEXT.recovery}</p>
            <RecoveryStage key={`recovery-${attempt}`} beep={beep} counts={counts} errors={errors} onCount={setCount} />
            <StageNav
              onBack={restart}
              backLabel="Сбились? Начать заново"
              onNext={() => {
                if (check(["p2", "p3"])) go("result");
              }}
              nextLabel="Показать индекс"
            />
          </>
        )}

        {stage === "manual" && (
          <>
            <p className="mb-8 max-w-2xl text-[16px] leading-relaxed text-dust">{RUFFIER_STAGE_TEXT.manual}</p>
            <div className="grid gap-8 lg:grid-cols-3">
              <CountInput countKey="p1" label="P1: в покое, за 15 секунд" value={counts.p1} onChange={(v) => setCount("p1", v)} error={errors.p1} />
              <CountInput countKey="p2" label="P2: сразу после, первые 15 секунд" value={counts.p2} onChange={(v) => setCount("p2", v)} error={errors.p2} />
              <CountInput countKey="p3" label="P3: последние 15 секунд минуты" value={counts.p3} onChange={(v) => setCount("p3", v)} error={errors.p3} />
            </div>
            <StageNav
              onBack={() => go("intro")}
              onNext={() => {
                if (check(["p1", "p2", "p3"])) go("result");
              }}
              nextLabel="Посчитать индекс"
            />
          </>
        )}

        {stage === "result" && <RuffierResult key={attempt} p1={p1} p2={p2} p3={p3} onRestart={restart} />}
      </div>
    </div>
  );
}

function StageNav({ onBack, backLabel = "Назад", onNext, nextLabel }: { onBack: () => void; backLabel?: string; onNext?: () => void; nextLabel?: string }) {
  return (
    <div className="mt-10 flex flex-col-reverse gap-3 border-t border-line/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <button type="button" className="btn-ghost" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {backLabel}
      </button>
      {onNext && (
        <button type="button" className="btn-primary" onClick={onNext}>
          {nextLabel}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

function Intro({ onStart, onManual }: { onStart: () => void; onManual: () => void }) {
  const id = useId();
  const [ok, setOk] = useState(false);
  const [error, setError] = useState(false);
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14 [&>*]:min-w-0">
      <div>
        <p className="max-w-lg text-[16px] leading-relaxed text-dust">
          Сама проба занимает две минуты, до неё пять минут покоя. Когда считать и когда приседать, подскажет экран.
        </p>
        <ul className="mt-8 grid border-t border-line/10">
          {RUFFIER_NEEDS.map((need, i) => (
            <li key={need} className="grid grid-cols-[44px_1fr] items-baseline gap-3 border-b border-line/10 py-4">
              <span className="digits text-[26px] leading-none text-pulse">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[15.5px] leading-snug text-chalk">{need}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-pulse/35 bg-pulse/[0.06] p-5 sm:p-7">
        <p className="eyebrow text-pulse">Сначала безопасность</p>
        <ul className="mt-4 grid gap-3">
          {RUFFIER_SAFETY.map((rule) => (
            <li key={rule} className="grid grid-cols-[14px_1fr] gap-3 text-[14.5px] leading-relaxed text-chalk/90">
              <span className="mt-[11px] h-[2px] w-3.5 bg-pulse" aria-hidden />
              {rule}
            </li>
          ))}
        </ul>
        <label htmlFor={id} className="mt-6 flex cursor-pointer items-start gap-3 border-t border-pulse/20 pt-5 text-[15px] font-medium leading-snug text-chalk">
          <input
            id={id}
            type="checkbox"
            checked={ok}
            onChange={(e) => {
              setOk(e.target.checked);
              if (e.target.checked) setError(false);
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className="mt-0.5 h-5 w-5 flex-none cursor-pointer accent-[rgb(var(--pulse))]"
          />
          Самочувствие нормальное, ограничений от врача нет
        </label>
        {error && (
          <p id={`${id}-error`} role="alert" className="field-error">
            Отметьте, что чувствуете себя нормально: без этого пробу лучше не начинать.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-line/10 pt-6 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
        <button type="button" className="btn-quiet sm:-ml-4" onClick={onManual}>
          Уже измерили? Ввести результаты
        </button>
        <button type="button" className="btn-primary" onClick={() => (ok ? onStart() : setError(true))}>
          Начать пробу
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
