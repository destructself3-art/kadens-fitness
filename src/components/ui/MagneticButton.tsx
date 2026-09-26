"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import Link from "next/link";

const MotionLink = motion.create(Link);

type Props = {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

/** The main call to action leans toward the cursor. Only on devices with a precise pointer. */
export function MagneticButton({ children, className, href, onClick, type = "button", disabled }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const [fine, setFine] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  useEffect(() => {
    setFine(window.matchMedia("(pointer: fine)").matches);
  }, []);

  const active = fine && !reduce && !disabled;

  const onMove = (e: React.PointerEvent) => {
    if (!active || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.28);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.36);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const common = {
    className: clsx("btn-primary", className),
    style: active ? { x: sx, y: sy } : undefined,
    onPointerMove: onMove,
    onPointerLeave: onLeave,
  };

  if (href) {
    return (
      <MotionLink ref={ref as React.Ref<HTMLAnchorElement>} href={href} onClick={onClick} {...common}>
        {children}
      </MotionLink>
    );
  }
  return (
    <motion.button ref={ref as React.Ref<HTMLButtonElement>} type={type} disabled={disabled} onClick={onClick} {...common}>
      {children}
    </motion.button>
  );
}
