"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { AGE_MAX, AGE_MIN, DEFAULT_AGE, DEFAULT_REST, heartRateMax, REST_MAX, REST_MIN, zoneRanges, type ZoneRange } from "@/lib/zones";

// The heartbeat of the site. One requestAnimationFrame loop beats at the visitor's resting pulse
// (68 until they measure it) and feeds every subscriber: beating words, dots, cardiogram canvases.
// The loop only runs while something subscribes, the tab is visible and motion is allowed.

export type PulseSource = "default" | "tap" | "manual" | "ruffier";

export type BeatFrame = {
  /** 0..1 position inside the current beat; the R peak is at R_PEAK */
  phase: number;
  /** 0..1 swell of the beat: 1 right after the R peak, 0 between beats */
  beat: number;
  bpm: number;
  /** seconds since the previous frame */
  dt: number;
};

type Listener = (frame: BeatFrame) => void;

export const R_PEAK = 0.235;

const gauss = (x: number, mu: number, s: number) => Math.exp(-((x - mu) ** 2) / (2 * s * s));
const swell = (p: number, at: number, attack: number, release: number) => {
  const d = p - at;
  const s = d < 0 ? attack : release;
  return Math.exp(-(d * d) / (2 * s * s));
};

/** Beat envelope: a strong "lub" on the R peak and a softer "dub" after the T wave. */
export const beatEnvelope = (p: number) => Math.min(1, swell(p, R_PEAK + 0.01, 0.025, 0.09) + 0.45 * swell(p, 0.48, 0.03, 0.07));

/** One cardiogram cycle (P, QRS, T), roughly -0.3..1. */
export const ecgValue = (p: number) =>
  0.1 * gauss(p, 0.12, 0.022) - 0.14 * gauss(p, 0.212, 0.009) + gauss(p, R_PEAK, 0.012) - 0.26 * gauss(p, 0.258, 0.011) + 0.26 * gauss(p, 0.45, 0.038);

type PulseContextValue = {
  rest: number;
  age: number;
  source: PulseSource;
  /** ISO time of the last measurement */
  measuredAt: string | null;
  /** The visitor measured or entered their pulse */
  measured: boolean;
  /** Stored values are loaded (false during the first render) */
  hydrated: boolean;
  hrMax: number;
  zones: ZoneRange[];
  reducedMotion: boolean;
  setRest: (bpm: number, source?: Exclude<PulseSource, "default">) => void;
  setAge: (age: number) => void;
  reset: () => void;
  /** Subscribe to animation frames. Returns an unsubscribe function. */
  subscribe: (listener: Listener) => () => void;
  /** Snap the beat to "now": used when the visitor taps along to their pulse. */
  kick: () => void;
};

const PulseContext = createContext<PulseContextValue | null>(null);

const KEY = "kadens:pulse";
type Stored = { rest: number; age: number; source: PulseSource; measuredAt: string | null };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(v)));

export function PulseProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Stored>({ rest: DEFAULT_REST, age: DEFAULT_AGE, source: "default", measuredAt: null });
  const [hydrated, setHydrated] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const listeners = useRef(new Set<Listener>());
  const phase = useRef(0.05);
  const bpmRef = useRef(DEFAULT_REST);
  const raf = useRef<number | null>(null);
  const last = useRef(0);
  const reducedRef = useRef(false);

  // Load stored values and watch the motion preference.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw) as Partial<Stored>;
        setState({
          rest: clamp(Number(s.rest) || DEFAULT_REST, REST_MIN, REST_MAX),
          age: clamp(Number(s.age) || DEFAULT_AGE, AGE_MIN, AGE_MAX),
          source: s.source ?? "default",
          measuredAt: s.measuredAt ?? null,
        });
      }
    } catch {
      // Private mode or blocked storage: keep defaults.
    }
    setHydrated(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      reducedRef.current = mq.matches;
      setReducedMotion(mq.matches);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    bpmRef.current = state.rest;
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state, hydrated]);

  const emit = useCallback((dt: number) => {
    const p = phase.current;
    const frame: BeatFrame = { phase: p, beat: reducedRef.current ? 0 : beatEnvelope(p), bpm: bpmRef.current, dt };
    for (const l of listeners.current) l(frame);
  }, []);

  const loop = useCallback(
    (t: number) => {
      const dt = last.current ? Math.min(0.05, (t - last.current) / 1000) : 0;
      last.current = t;
      phase.current = (phase.current + dt * (bpmRef.current / 60)) % 1;
      emit(dt);
      raf.current = requestAnimationFrame(loop);
    },
    [emit],
  );

  const start = useCallback(() => {
    if (raf.current !== null || reducedRef.current || document.hidden || listeners.current.size === 0) return;
    last.current = 0;
    raf.current = requestAnimationFrame(loop);
  }, [loop]);

  const stop = useCallback(() => {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = null;
  }, []);

  useEffect(() => {
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [start, stop]);

  useEffect(() => {
    if (reducedMotion) {
      stop();
      emit(0);
    } else start();
  }, [reducedMotion, start, stop, emit]);

  const subscribe = useCallback(
    (listener: Listener) => {
      listeners.current.add(listener);
      // Draw a first frame immediately (and the only one when motion is reduced).
      listener({ phase: phase.current, beat: 0, bpm: bpmRef.current, dt: 0 });
      start();
      return () => {
        listeners.current.delete(listener);
        if (listeners.current.size === 0) stop();
      };
    },
    [start, stop],
  );

  const kick = useCallback(() => {
    phase.current = R_PEAK - 0.012;
    if (reducedRef.current) emit(0);
  }, [emit]);

  const setRest = useCallback((bpm: number, source: Exclude<PulseSource, "default"> = "manual") => {
    setState((s) => ({ ...s, rest: clamp(bpm, REST_MIN, REST_MAX), source, measuredAt: new Date().toISOString() }));
  }, []);
  const setAge = useCallback((age: number) => setState((s) => ({ ...s, age: clamp(age, AGE_MIN, AGE_MAX) })), []);
  const reset = useCallback(() => setState({ rest: DEFAULT_REST, age: DEFAULT_AGE, source: "default", measuredAt: null }), []);

  const value = useMemo<PulseContextValue>(
    () => ({
      ...state,
      measured: state.source !== "default",
      hydrated,
      hrMax: heartRateMax(state.age),
      zones: zoneRanges(state.rest, state.age),
      reducedMotion,
      setRest,
      setAge,
      reset,
      subscribe,
      kick,
    }),
    [state, hydrated, reducedMotion, setRest, setAge, reset, subscribe, kick],
  );

  return <PulseContext.Provider value={value}>{children}</PulseContext.Provider>;
}

export function usePulse(): PulseContextValue {
  const ctx = useContext(PulseContext);
  if (!ctx) throw new Error("usePulse must be used inside <PulseProvider>");
  return ctx;
}

/** Calls `apply` with the beat swell on every frame while the element is mounted. */
export function useBeat<T extends HTMLElement | SVGElement>(ref: RefObject<T | null>, apply: (el: T, beat: number, frame: BeatFrame) => void) {
  const { subscribe } = usePulse();
  const applyRef = useRef(apply);
  applyRef.current = apply;
  useEffect(() => {
    return subscribe((frame) => {
      const el = ref.current;
      if (el) applyRef.current(el, frame.beat, frame);
    });
  }, [subscribe, ref]);
}

/** Frame callback for canvases. */
export function useBeatFrame(callback: Listener) {
  const { subscribe } = usePulse();
  const cb = useRef(callback);
  cb.current = callback;
  useEffect(() => subscribe((f) => cb.current(f)), [subscribe]);
}
