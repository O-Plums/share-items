"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { easeOut, fadeUp, fadeUpReduced, viewport } from "./motion";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ children, className, delay = 0 }: Props) {
  const reduced = useReducedMotion();

  const motionProps: HTMLMotionProps<"div"> = {
    initial: "hidden",
    whileInView: "visible",
    viewport,
    variants: reduced ? fadeUpReduced : fadeUp,
    transition: { duration: reduced ? 0.2 : 0.55, delay, ease: easeOut },
    className,
  };

  return <motion.div {...motionProps}>{children}</motion.div>;
}
