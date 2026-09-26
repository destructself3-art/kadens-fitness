"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ecgValue } from "@/components/pulse/PulseProvider";

// The first look at a fresh ticket (?new=1): a cardiogram trace sweeps across the empty space,
// then the ticket prints out behind it and the code settles character by character.
// Plays once: the flag is dropped from the address, so a reload shows the plain ticket.

type Stage = "line" | "print" | "done";

const RevealStage = createContext<Stage>("done");

const EASE = [0.16, 1, 0.3, 1] as const;
const W = 1200;
const H = 160;

/** Five heartbeats across the width, starting and ending on the baseline. */
const TRACE = (() => {
  const n = 600;
  let d = "";
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const y = H * 0.62 - ecgValue((t * 5 + 0.7) % 1) * H * 0.48;
    d += `${i ? "L" : "M"}${(t * W).toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
})();

const ticketVariants = {
  hidden: { clipPath: "inset(0% 100% 0% 0%)" },
  shown: { clipPath: "inset(0% 0% 0% 0%)", transitionEnd: { clipPath: "none" } },
};

export function TicketReveal({ play, children, className }: { play: boolean; children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>(play ? "line" : "done");

  useEffect(() => {
    if (!play) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("new");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [play]);

  useEffect(() => {
    if (reduce) setStage("done");
  }, [reduce]);

  if (!play) {
    return <div className={className}>{children}</div>;
  }

  return (
    <RevealStage.Provider value={stage}>
      <div className={`relative ${className ?? ""}`}>
        {stage !== "done" && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-40 -translate-y-1/2"
            initial={{ opacity: 1 }}
            animate={{ opacity: stage === "print" ? 0 : 1 }}
            transition={{ duration: 0.7, delay: stage === "print" ? 0.3 : 0 }}
          >
            <motion.svg
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="none"
              className="h-full w-full overflow-visible"
              initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
              animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
              transition={{ duration: 1.05, ease: [0.5, 0, 0.25, 1] }}
              onAnimationComplete={() => setStage((s) => (s === "line" ? "print" : s))}
            >
              <path d={TRACE} fill="none" stroke="#FF3A24" strokeWidth={2.5} strokeLinejoin="round" vectorEffect="non-scaling-stroke" style={{ filter: "drop-shadow(0 0 8px rgb(255 58 36 / 0.85))" }} />
            </motion.svg>
            <motion.span
              className="absolute inset-y-0 w-px bg-pulse shadow-[0_0_18px_4px_rgb(255_58_36/0.7)]"
              initial={{ left: "0%" }}
              animate={{ left: "100%", opacity: stage === "print" ? 0 : 1 }}
              transition={{ duration: 1.05, ease: [0.5, 0, 0.25, 1] }}
            />
          </motion.div>
        )}
        <motion.div
          variants={ticketVariants}
          initial="hidden"
          animate={stage === "line" ? "hidden" : "shown"}
          transition={{ duration: reduce ? 0 : 1, ease: EASE }}
          onAnimationComplete={() => setStage((s) => (s === "print" ? "done" : s))}
        >
          {children}
        </motion.div>
      </div>
    </RevealStage.Provider>
  );
}

const SCRAMBLE = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** The booking code; while the ticket prints, its characters run like a display and settle left to right. */
export function ScrambleCode({ code, className }: { code: string; className?: string }) {
  const stage = useContext(RevealStage);
  const [text, setText] = useState(code);

  useEffect(() => {
    if (stage !== "print") return;
    const prefix = code.indexOf("-") + 1;
    const frames = 18;
    let frame = 0;
    const id = window.setInterval(() => {
      frame += 1;
      const settled = prefix + Math.floor((frame / frames) * (code.length - prefix));
      setText(
        code
          .split("")
          .map((ch, i) => (i < settled ? ch : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)]))
          .join(""),
      );
      if (frame >= frames) window.clearInterval(id);
    }, 55);
    return () => {
      window.clearInterval(id);
      setText(code);
    };
  }, [stage, code]);

  return (
    <span className={className}>
      <span className="sr-only">{code}</span>
      <span aria-hidden>{text}</span>
    </span>
  );
}
