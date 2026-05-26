"use client";

import { motion, useReducedMotion } from "framer-motion";
import { easeOut, scaleIn, fadeUpReduced, viewport } from "./motion";

type Props = {
  title: string;
  hint: string;
  copyLabel: string;
  shareLabel: string;
};

export function ShareLinkMockup({ title, hint, copyLabel, shareLabel }: Props) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={reduced ? fadeUpReduced : scaleIn}
      transition={{ duration: reduced ? 0.2 : 0.6, ease: easeOut }}
      className="overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-100 via-brand-50 to-white p-5 shadow-lg ring-1 ring-brand-200/80"
      aria-hidden
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{title}</p>
      <motion.p
        className="mt-3 rounded-xl bg-white px-3 py-3 font-mono text-sm text-neutral-800 ring-1 ring-neutral-200"
        animate={reduced ? undefined : { boxShadow: ["0 0 0 0 rgba(244,53,104,0)", "0 0 0 4px rgba(244,53,104,0.12)", "0 0 0 0 rgba(244,53,104,0)"] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
      >
        sortyourlife.fr/l/maison-papy
      </motion.p>
      <p className="mt-2.5 text-sm leading-snug text-neutral-600">{hint}</p>
      <motion.div
        className="mt-4 flex flex-wrap gap-2"
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        transition={{ staggerChildren: reduced ? 0 : 0.1, delayChildren: 0.2 }}
      >
        <motion.span
          variants={reduced ? fadeUpReduced : scaleIn}
          className="rounded-full bg-white px-3.5 py-2 text-xs font-medium text-neutral-700 ring-1 ring-neutral-200"
        >
          📋 {copyLabel}
        </motion.span>
        <motion.span
          variants={reduced ? fadeUpReduced : scaleIn}
          className="rounded-full bg-[#25D366]/15 px-3.5 py-2 text-xs font-medium text-[#128C7E] ring-1 ring-[#25D366]/35"
          animate={reduced ? undefined : { scale: [1, 1.04, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
        >
          💬 {shareLabel}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
