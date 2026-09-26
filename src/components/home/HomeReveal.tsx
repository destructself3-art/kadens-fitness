"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Same canonical timing as src/components/ui/Reveal.tsx (opacity + y 28 + blur 8, cubic-bezier(0.16, 1, 0.3, 1),
// once at 30% in view), but hydration-safe: the shared Reveal renders a plain element when the visitor prefers
// reduced motion, so the server HTML (with the hidden initial style) no longer matches, React refuses to patch the
// attributes and the content stays invisible. Here the element and its initial style are identical on the server and
// the client; with reduced motion it simply appears at once, without movement.
const EASE = [0.16, 1, 0.3, 1] as const;
const HIDDEN = { opacity: 0, y: 28, filter: "blur(8px)" };
const SHOWN = { opacity: 1, y: 0, filter: "blur(0px)" };

const TAGS = {
  div: motion.div,
  li: motion.li,
  p: motion.p,
} as const;

type Props = {
  children: ReactNode;
  as?: keyof typeof TAGS;
  delay?: number;
  className?: string;
  id?: string;
};

export function HomeReveal({ children, as = "div", delay = 0, className, id }: Props) {
  const reduce = useReducedMotion();
  const Tag = TAGS[as];
  return (
    <Tag
      id={id}
      className={className}
      initial={HIDDEN}
      animate={reduce ? SHOWN : undefined}
      whileInView={reduce ? undefined : SHOWN}
      viewport={{ once: true, amount: 0.3 }}
      transition={reduce ? { duration: 0 } : { duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}
