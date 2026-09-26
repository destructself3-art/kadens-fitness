import clsx from "clsx";

/** The mark: one cardiogram beat, like the LED line above the reception desk. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 24" className={clsx("text-pulse", className)} fill="none" aria-hidden>
      <path d="M1 14h10l3-5 4 13 5-21 4 13h12" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** "КАДЕНС" set wide in Science Gothic. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={clsx("font-display uppercase leading-none tracking-[0.02em]", className)} style={{ fontVariationSettings: '"wdth" 150', fontWeight: 800 }}>
      Каденс
    </span>
  );
}
