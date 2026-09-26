import clsx from "clsx";
import { BeatDot } from "@/components/pulse/Beat";
import { STATE_META, type TicketState, type Tone } from "./ticket-state";

const TONE: Record<Tone, string> = {
  pulse: "border-pulse/50 bg-pulse/10 text-pulse",
  chalk: "border-line/30 text-chalk",
  dust: "border-line/15 text-dust",
};

/** Booking status as a small pill. Server-safe; the live dot beats in the visitor's rhythm. */
export function StatusChip({ state, position, className }: { state: TicketState; position?: number | null; className?: string }) {
  const meta = STATE_META[state];
  return (
    <span className={clsx("inline-flex min-h-[28px] items-center gap-2 rounded-full border px-3 text-[12px] font-semibold uppercase tracking-[0.1em]", TONE[meta.tone], className)}>
      {state === "live" ? <BeatDot className="h-2 w-2" /> : <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />}
      {meta.chip}
      {state === "waitlist" && position ? <span className="digits text-[15px] leading-none tracking-normal">{position}-й</span> : null}
    </span>
  );
}
