"use client";

// The timed parts of the Ruffier test: the 15-second count, tap-along, the squat metronome and the recovery minute.
import { useEffect, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { HeartPulse, Pause, Play, RotateCcw } from "lucide-react";
import { usePulse } from "@/components/pulse/PulseProvider";
import { bpmFromTaps } from "@/lib/zones";
import { CountInput, type CountKey, type Counts } from "./RuffierInputs";
import { useStopwatch, type BeepKind } from "./ruffier-hooks";

const COUNT_MS = 15_000;
const LEAD_MS = 3_000;
const SQUATS = 30;
const SQUAT_MS = 1_500;
const SQUATS_MS = SQUATS * SQUAT_MS;
const P3_FROM_MS = 45_000;
const RECOVERY_MS = 60_000;

type Beep = (kind: BeepKind) => void;

/** Screen-reader announcements: only changes of the text are read out. */
function Announce({ children }: { children: ReactNode }) {
  return (
    <p className="sr-only" aria-live="assertive" aria-atomic="true">
      {children}
    </p>
  );
}

/** Runs `effect` once each time `key` changes (and not again on re-renders or Strict Mode re-runs). */
function useOnChange(key: string, effect: (key: string) => void) {
  const last = useRef<string | null>(null);
  const fn = useRef(effect);
  useEffect(() => {
    fn.current = effect;
  });
  useEffect(() => {
    if (last.current === key) return;
    last.current = key;
    fn.current(key);
  }, [key]);
}

const seconds = (ms: number) => Math.max(0, Math.ceil(ms / 1000));

// ---------- P1: a 15-second count ----------

export function CountWindow({ beep, onPrime }: { beep: Beep; onPrime: () => void }) {
  const { ms, running, start, pause, reset } = useStopwatch();
  const started = running || ms > 0;
  const phase = !started ? "idle" : ms < LEAD_MS ? "lead" : ms < LEAD_MS + COUNT_MS ? "count" : "done";
  const lead = seconds(LEAD_MS - ms);
  const left = phase === "idle" ? 15 : phase === "count" ? seconds(LEAD_MS + COUNT_MS - ms) : 0;
  const progress = phase === "count" ? (ms - LEAD_MS) / COUNT_MS : phase === "done" ? 1 : 0;

  useOnChange(phase === "lead" ? `lead-${lead}` : phase, (key) => {
    if (key.startsWith("lead")) beep("tick");
    else if (key === "count") beep("go");
    else if (key === "done") {
      pause();
      beep("stop");
    }
  });

  return (
    <div className="rounded-2xl bg-asphalt/60 p-5 sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className={clsx("eyebrow", phase === "count" && "text-pulse")}>
            {phase === "idle" ? "Таймер на 15 секунд" : phase === "lead" ? "Приготовьтесь" : phase === "count" ? "Считайте удары" : "Стоп"}
          </p>
          <p
            className={clsx("digits mt-2 text-[96px] leading-[0.8] sm:text-[112px]", phase === "count" ? "text-pulse" : phase === "idle" ? "text-chalk/40" : "text-chalk")}
            aria-hidden
          >
            {phase === "lead" ? lead : phase === "done" ? "0" : left}
          </p>
        </div>
        {phase === "idle" ? (
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              onPrime();
              start();
            }}
          >
            <Play className="h-4 w-4" aria-hidden />
            Старт
          </button>
        ) : (
          <button type="button" className="btn-ghost" onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            {phase === "done" ? "Ещё раз" : "Заново"}
          </button>
        )}
      </div>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-line/10" aria-hidden>
        <div className="h-full rounded-full bg-pulse" style={{ width: `${progress * 100}%` }} />
      </div>
      <Announce>
        {phase === "lead" ? String(lead) : phase === "count" ? "Считайте удары" : phase === "done" ? "Стоп. Введите число ударов." : ""}
      </Announce>
    </div>
  );
}

// ---------- P1: tap along ----------

const TAP_RESET_MS = 2200;
export const MIN_TAPS = 6;

export function TapMeter({ bpm, onBpm }: { bpm: number | null; onBpm: (bpm: number | null) => void }) {
  const { kick } = usePulse();
  const taps = useRef<number[]>([]);
  const [count, setCount] = useState(0);
  const [ripple, setRipple] = useState(0);

  function tap() {
    const t = performance.now();
    const list = taps.current;
    if (list.length && t - list[list.length - 1] > TAP_RESET_MS) list.length = 0;
    list.push(t);
    if (list.length > 16) list.shift();
    kick();
    setRipple((r) => r + 1);
    setCount(list.length);
    onBpm(list.length >= MIN_TAPS ? bpmFromTaps(list) : null);
  }

  const left = Math.max(0, MIN_TAPS - count);
  return (
    <div className="flex items-center justify-between gap-5 rounded-2xl bg-asphalt/60 p-5 sm:p-6">
      <div className="min-w-0">
        <p className="eyebrow">{bpm ? "P1 по тапам" : "Тапайте в такт"}</p>
        <p className="digits mt-2 text-[88px] leading-[0.8] text-pulse sm:text-[104px]">{bpm ?? "··"}</p>
        <p className="mt-3 text-[14px] text-dust" aria-live="polite">
          {bpm
            ? "уд/мин. Можно продолжать, число уточнится."
            : count === 0
              ? `Нужно хотя бы ${MIN_TAPS} нажатий подряд.`
              : `Ещё ${left}, не останавливайтесь.`}
        </p>
      </div>
      <button
        type="button"
        onClick={tap}
        className="relative grid h-32 w-32 flex-none place-items-center rounded-full border-2 border-pulse text-chalk transition-transform duration-100 active:scale-95"
        aria-label="Тап в такт пульсу"
      >
        <span key={ripple} className={clsx("absolute inset-0 rounded-full bg-pulse/25", ripple > 0 && "motion-safe:animate-live-ping")} aria-hidden />
        <span className="relative flex flex-col items-center gap-1">
          <HeartPulse className="h-7 w-7" aria-hidden />
          <span className="font-display text-[15px] uppercase" style={{ fontVariationSettings: '"wdth" 120', fontWeight: 800 }}>
            Тап
          </span>
        </span>
      </button>
    </div>
  );
}

// ---------- Squats ----------

type Point = [number, number];
// Side view, facing right, viewBox 160 × 220. Standing and bottom of the squat; frames in between are interpolated.
const STAND: Record<"ankle" | "toe" | "knee" | "hip" | "shoulder" | "head" | "hand", Point> = {
  ankle: [70, 205],
  toe: [98, 205],
  knee: [72, 160],
  hip: [70, 115],
  shoulder: [72, 55],
  head: [75, 31],
  hand: [120, 58],
};
const SQUAT: typeof STAND = {
  ankle: [70, 205],
  toe: [98, 205],
  knee: [100, 168],
  hip: [52, 160],
  shoulder: [80, 108],
  head: [92, 88],
  hand: [128, 110],
};

function pose(depth: number) {
  const out = {} as typeof STAND;
  for (const k of Object.keys(STAND) as (keyof typeof STAND)[]) {
    out[k] = [STAND[k][0] + (SQUAT[k][0] - STAND[k][0]) * depth, STAND[k][1] + (SQUAT[k][1] - STAND[k][1]) * depth];
  }
  return out;
}

const path = (p: typeof STAND) =>
  `M ${p.toe.join(" ")} L ${p.ankle.join(" ")} L ${p.knee.join(" ")} L ${p.hip.join(" ")} L ${p.shoulder.join(" ")} L ${p.hand.join(" ")}`;

function SquatFigure({ depth, className }: { depth: number; className?: string }) {
  const now = pose(depth);
  const low = pose(1);
  return (
    <svg viewBox="0 0 160 220" className={className} aria-hidden>
      <line x1="10" y1="211" x2="150" y2="211" stroke="rgb(var(--line) / 0.25)" strokeWidth="2" />
      {/* Target depth: a faint ghost of the bottom position */}
      <path d={path(low)} fill="none" stroke="rgb(var(--line) / 0.12)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={low.head[0]} cy={low.head[1]} r="13" fill="rgb(var(--line) / 0.12)" />
      <path d={path(now)} fill="none" stroke="rgb(var(--chalk))" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={now.head[0]} cy={now.head[1]} r="13" fill="rgb(var(--chalk))" />
      <circle cx={now.hip[0]} cy={now.hip[1]} r="6" fill="rgb(var(--pulse))" />
    </svg>
  );
}

export function SquatsStage({ beep, onPrime, onDone, reduce }: { beep: Beep; onPrime: () => void; onDone: () => void; reduce: boolean }) {
  const { ms, running, start, pause, reset } = useStopwatch();
  const started = running || ms > 0;
  const t = ms - LEAD_MS;
  const phase = !started ? "idle" : t < 0 ? "lead" : t < SQUATS_MS ? "run" : "done";
  const index = phase === "run" ? Math.floor(t / SQUAT_MS) : phase === "done" ? SQUATS - 1 : -1;
  const within = phase === "run" ? (t % SQUAT_MS) / SQUAT_MS : 0;
  const depth = reduce || phase !== "run" ? 0 : (1 - Math.cos(2 * Math.PI * within)) / 2;
  const lead = seconds(-t);
  const left = phase === "run" ? seconds(SQUATS_MS - t) : phase === "done" ? 0 : SQUATS_MS / 1000;
  const done = index + 1;

  useOnChange(phase === "lead" ? `lead-${lead}` : phase === "run" ? `squat-${index}` : phase, (key) => {
    if (key.startsWith("lead")) beep("tick");
    else if (key === "squat-0") beep("go");
    else if (key.startsWith("squat")) beep("tick");
    else if (key === "done") {
      pause();
      onDone();
    }
  });

  const cue = phase === "idle" ? "Готовы?" : phase === "lead" ? "Встаньте" : phase === "done" ? "Ложитесь" : within < 0.5 ? "Вниз" : "Вверх";
  const say =
    phase === "lead" ? String(lead) : phase === "run" ? (done < 10 ? "Приседайте" : `${Math.floor(done / 10) * 10} из ${SQUATS}`) : phase === "done" ? "Готово. Ложитесь и считайте пульс." : "";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-14 [&>*]:min-w-0">
      <div className="order-2 lg:order-1">
        <div className="flex flex-wrap gap-3">
          {phase === "idle" && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                onPrime();
                start();
              }}
            >
              <Play className="h-4 w-4" aria-hidden />
              Старт метронома
            </button>
          )}
          {(phase === "lead" || phase === "run") &&
            (running ? (
              <button type="button" className="btn-ghost" onClick={pause}>
                <Pause className="h-4 w-4" aria-hidden />
                Пауза
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  onPrime();
                  start();
                }}
              >
                <Play className="h-4 w-4" aria-hidden />
                Продолжить
              </button>
            ))}
          {started && !running && phase !== "done" && (
            <button type="button" className="btn-quiet" onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden />
              Сначала
            </button>
          )}
        </div>
        <p className="mt-5 text-[14px] leading-relaxed text-dust">
          {started && !running && phase !== "done"
            ? "Пауза сбивает пробу. Если остановились дольше чем на несколько секунд, отдохните пять минут и начните с P1."
            : "Перед стартом отсчёт 3, 2, 1. Сигнал на каждое приседание звучит, если включён звук."}
        </p>
      </div>

      <div className="order-1 rounded-2xl bg-asphalt/60 p-5 sm:p-7 lg:order-2">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <SquatFigure depth={depth} className="h-[200px] w-full max-w-[180px] sm:h-[250px] sm:max-w-[220px]" />
          <div className="text-right">
            <p className="eyebrow">{phase === "lead" ? "Старт через" : "Приседание"}</p>
            <p className={clsx("digits mt-2 text-[104px] leading-[0.8] sm:text-[128px]", phase === "run" ? "text-pulse" : "text-chalk")} aria-hidden>
              {phase === "lead" ? lead : Math.max(0, done)}
            </p>
            <p className="mt-2 text-[14px] text-dust">
              из <span className="digits text-[20px] text-chalk">{SQUATS}</span>
            </p>
            <p className="mt-4 font-display text-[30px] uppercase leading-none text-chalk sm:text-[36px]" style={{ fontVariationSettings: '"wdth" 130', fontWeight: 850 }} aria-hidden>
              {cue}
            </p>
            <p className="mt-2 text-[13px] text-dust">
              осталось <span className="digits text-[20px] text-chalk">{left}</span> с
            </p>
          </div>
        </div>
        <ol className="mt-6 flex h-6 gap-[3px]" aria-hidden>
          {Array.from({ length: SQUATS }, (_, i) => (
            <li key={i} className={clsx("flex-1 rounded-[2px]", i < index || phase === "done" ? "bg-chalk" : i === index ? "bg-pulse" : "bg-line/15")} />
          ))}
        </ol>
      </div>
      <Announce>{say}</Announce>
    </div>
  );
}

// ---------- Recovery minute: P2, rest, P3 ----------

export function RecoveryStage({
  beep,
  counts,
  errors,
  onCount,
}: {
  beep: Beep;
  counts: Counts;
  errors: Partial<Record<CountKey, string>>;
  onCount: (key: CountKey, value: string) => void;
}) {
  const { ms, start, pause } = useStopwatch();
  const phase = ms < COUNT_MS ? "p2" : ms < P3_FROM_MS ? "rest" : ms < RECOVERY_MS ? "p3" : "done";
  const counting = phase === "p2" || phase === "p3";
  const left = seconds((phase === "p2" ? COUNT_MS : phase === "rest" ? P3_FROM_MS : RECOVERY_MS) - ms);

  // The minute starts the moment the squats end.
  useEffect(() => {
    start();
  }, [start]);

  useOnChange(phase, (key) => {
    if (key === "p2" || key === "p3") beep("go");
    else beep("stop");
    if (key === "done") pause();
  });

  const label = { p2: "Считайте удары · P2", rest: "Отдыхайте лёжа. P3 через", p3: "Считайте удары · P3", done: "Минута прошла" }[phase];
  const say = { p2: "Считайте удары, P2", rest: "Стоп. Запишите P2 и отдыхайте", p3: "Считайте удары, P3", done: "Стоп. Запишите P3" }[phase];

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14 [&>*]:min-w-0">
      <div className="rounded-2xl bg-asphalt/60 p-5 sm:p-7">
        <p className={clsx("eyebrow", counting && "text-pulse")}>{label}</p>
        <p className={clsx("digits mt-2 text-[112px] leading-[0.8] sm:text-[140px]", counting ? "text-pulse" : phase === "done" ? "text-chalk/40" : "text-chalk")} aria-hidden>
          {phase === "done" ? "0" : left}
        </p>
        {/* The minute: two counting windows and the rest between them, with a playhead */}
        <div className="relative mt-8" aria-hidden>
          <div className="flex h-10 gap-[3px]">
            <span className="flex flex-[15] items-center rounded-l-lg bg-pulse/25 px-2 font-digits text-[18px] text-chalk">P2</span>
            <span className="flex flex-[30] items-center justify-center bg-line/10 text-[12.5px] text-dust">отдых</span>
            <span className="flex flex-[15] items-center rounded-r-lg bg-pulse/25 px-2 font-digits text-[18px] text-chalk">P3</span>
          </div>
          <span className="absolute -bottom-1 -top-1 w-[3px] -translate-x-1/2 rounded-full bg-chalk" style={{ left: `${Math.min(1, ms / RECOVERY_MS) * 100}%` }} />
          <div className="mt-2 flex justify-between font-digits text-[15px] text-dust">
            <span>0</span>
            <span>60 с</span>
          </div>
        </div>
      </div>

      <div className="grid content-start gap-8">
        {ms >= COUNT_MS ? (
          <CountInput countKey="p2" label="P2: ударов за первые 15 секунд" value={counts.p2} onChange={(v) => onCount("p2", v)} error={errors.p2} />
        ) : (
          <p className="text-[15px] leading-relaxed text-dust">Сейчас только считайте. Поле для P2 появится, когда таймер скажет «стоп».</p>
        )}
        {ms >= RECOVERY_MS ? (
          <CountInput countKey="p3" label="P3: ударов за последние 15 секунд" value={counts.p3} onChange={(v) => onCount("p3", v)} error={errors.p3} />
        ) : (
          ms >= COUNT_MS && <p className="text-[15px] leading-relaxed text-dust">P3 считаем в последние 15 секунд минуты. Таймер подаст сигнал.</p>
        )}
      </div>
      <Announce>{say}</Announce>
    </div>
  );
}
