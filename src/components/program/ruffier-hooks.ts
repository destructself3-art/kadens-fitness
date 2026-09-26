"use client";

// Timing, sound and screen helpers for the Ruffier test. Everything lives in refs, so a re-render never
// restarts a timer, and everything is cleaned up on unmount.
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A pausable stopwatch. Frames come from requestAnimationFrame for smooth motion; a slow interval keeps the
 * timeline (and the beeps) going where frames stop, e.g. in a background tab. Time itself comes from
 * performance.now(), so nothing drifts.
 */
export function useStopwatch() {
  const [ms, setMs] = useState(0);
  const [running, setRunning] = useState(false);
  const base = useRef(0);
  const since = useRef(0);
  const raf = useRef<number | null>(null);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  const cancel = () => {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    if (interval.current !== null) clearInterval(interval.current);
    raf.current = null;
    interval.current = null;
  };

  const start = useCallback(() => {
    if (interval.current !== null) return;
    since.current = performance.now();
    const update = () => setMs(base.current + performance.now() - since.current);
    const loop = () => {
      update();
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    interval.current = setInterval(update, 200);
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    if (interval.current === null) return;
    cancel();
    base.current += performance.now() - since.current;
    setMs(base.current);
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    cancel();
    base.current = 0;
    setMs(0);
    setRunning(false);
  }, []);

  useEffect(() => cancel, []);

  return { ms, running, start, pause, reset };
}

export type BeepKind = "tick" | "go" | "stop";

const TONES: Record<BeepKind, { freq: number; dur: number }> = {
  tick: { freq: 1240, dur: 0.05 },
  go: { freq: 880, dur: 0.2 },
  stop: { freq: 440, dur: 0.4 },
};

/** Short WebAudio beeps. `prime` must run inside a click, so browsers allow the sound later. */
export function useBeeper(enabled: boolean) {
  const ctx = useRef<AudioContext | null>(null);
  const on = useRef(enabled);
  useEffect(() => {
    on.current = enabled;
  }, [enabled]);

  const prime = useCallback(() => {
    try {
      if (!ctx.current) {
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AC) return;
        ctx.current = new AC();
      }
      if (ctx.current.state === "suspended") void ctx.current.resume();
    } catch {
      // No audio: the test works silently.
    }
  }, []);

  const beep = useCallback((kind: BeepKind) => {
    const c = ctx.current;
    if (!on.current || !c) return;
    try {
      const { freq, dur } = TONES[kind];
      const osc = c.createOscillator();
      const gain = c.createGain();
      const t = c.currentTime;
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.3, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(c.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    } catch {
      // ignore
    }
  }, []);

  useEffect(
    () => () => {
      void ctx.current?.close().catch(() => {});
      ctx.current = null;
    },
    [],
  );

  return { prime, beep };
}

/** Keeps the phone screen on while the timed part of the test runs (where the browser supports it). */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let done = false;
    const request = async () => {
      try {
        const next = await navigator.wakeLock.request("screen");
        if (done) void next.release().catch(() => {});
        else lock = next;
      } catch {
        // Denied or unsupported: the timer still works, the screen may dim.
      }
    };
    void request();
    const onVisible = () => {
      if (document.visibilityState === "visible" && !done) void request();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      done = true;
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release().catch(() => {});
    };
  }, [active]);
}
