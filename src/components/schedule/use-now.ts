"use client";

import { useEffect, useState } from "react";

/**
 * The current moment for time-dependent UI (the "now" line, past classes).
 * Starts from the server's timestamp so the first client render matches the HTML, then ticks every 30 seconds.
 */
export function useNow(serverNow: number, everyMs = 30_000): number {
  const [now, setNow] = useState(serverNow);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), everyMs);
    return () => clearInterval(id);
  }, [everyMs]);
  return now;
}
