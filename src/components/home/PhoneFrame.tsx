"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { easeOut, scaleIn, fadeUpReduced, viewport } from "./motion";

type Props = {
  src: string;
  alt: string;
  priority?: boolean;
};

export function PhoneFrame({ src, alt, priority }: Props) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={reduced ? fadeUpReduced : scaleIn}
      transition={{ duration: reduced ? 0.2 : 0.65, ease: easeOut }}
      className="relative mx-auto w-full max-w-[min(100%,280px)]"
    >
      <div
        className="relative aspect-[9/19] overflow-hidden rounded-[2rem] bg-neutral-900 p-1.5 shadow-[0_24px_48px_-12px_rgba(244,53,104,0.25)] ring-1 ring-neutral-900/10"
        aria-hidden
      >
        <motion.div
          className="relative h-full w-full overflow-hidden rounded-[1.65rem] bg-neutral-100"
          whileInView={reduced ? undefined : { scale: [1, 1.02, 1] }}
          transition={{ duration: 4, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
          viewport={{ once: false, amount: 0.5 }}
        >
          <Image src={src} alt={alt} fill className="object-cover object-top" sizes="280px" priority={priority} />
        </motion.div>
      </div>
      <motion.div
        className="pointer-events-none absolute -inset-x-6 -bottom-4 h-16 bg-gradient-to-t from-neutral-50 to-transparent"
        aria-hidden
      />
    </motion.div>
  );
}
