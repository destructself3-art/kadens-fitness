"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";

// One cardiogram beat on a long flat line, like the LED line over the reception desk.
// The spike sits in the middle; "slice" keeps the stroke even at any width and crops the flat ends.
const PATH = "M-400 70 H520 L540 60 L556 70 H572 L590 100 L618 16 L648 112 L664 70 H690 L714 54 L740 70 H1600";

const LINE = { hidden: { pathLength: 0 }, shown: { pathLength: 1 } };

/**
 * Draws itself once when scrolled into view; with reduced motion it appears without the drawing.
 * The in-view check watches the svg box: the path itself is much wider than the screen and would never reach the threshold.
 */
export function EcgDraw({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      viewBox="0 0 1200 124"
      preserveAspectRatio="xMidYMid slice"
      className={clsx("block aspect-[1200/124] min-h-[90px] w-full overflow-hidden", className)}
      aria-hidden
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.6 }}
    >
      <motion.path
        d={PATH}
        fill="none"
        stroke="rgb(var(--pulse))"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 6px rgb(255 58 36 / 0.85))" }}
        variants={LINE}
        // Same markup on the server and the client; with reduced motion the line simply appears.
        transition={reduce ? { duration: 0 } : { duration: 2.4, ease: [0.65, 0, 0.35, 1] }}
      />
    </motion.svg>
  );
}
