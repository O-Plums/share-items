"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { HomeStepCopy } from "./types";
import { PhoneFrame } from "./PhoneFrame";
import { ShareLinkMockup } from "./ShareLinkMockup";
import { Reveal } from "./Reveal";
import { easeOut, fadeUp, fadeUpReduced, viewport } from "./motion";

type Props = HomeStepCopy & {
  shareLabels?: {
    title: string;
    hint: string;
    copy: string;
    whatsapp: string;
  };
  isLast?: boolean;
};

const accents = {
  brand: {
    line: "from-brand-300 to-brand-100",
    badge: "bg-brand-500 shadow-brand-500/30",
  },
  voter: {
    line: "from-secondary-300 to-secondary-100",
    badge: "bg-secondary-500 shadow-secondary-500/30",
  },
} as const;

export function HomeStep({
  step,
  title,
  body,
  kind,
  imageSrc,
  imageAlt,
  shareLabels,
  isLast,
  tone = "brand",
}: Props) {
  const reduced = useReducedMotion();
  const accent = accents[tone];

  const visual =
    kind === "share" && shareLabels ? (
      <ShareLinkMockup
        title={shareLabels.title}
        hint={shareLabels.hint}
        copyLabel={shareLabels.copy}
        shareLabel={shareLabels.whatsapp}
      />
    ) : imageSrc && imageAlt ? (
      <PhoneFrame src={imageSrc} alt={imageAlt} tone={tone} />
    ) : null;

  return (
    <li className="relative pl-0">
      {!isLast && (
        <motion.div
          className={`absolute left-[15px] top-12 bottom-0 w-0.5 origin-top bg-gradient-to-b ${accent.line}`}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: reduced ? 0.1 : 0.8, ease: easeOut, delay: 0.3 }}
          aria-hidden
        />
      )}

      <Reveal className="flex flex-col gap-5 sm:gap-6">
        {visual && <div className="order-1">{visual}</div>}

        <div className="order-2 flex gap-4">
          <motion.span
            className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md ${accent.badge}`}
            initial={reduced ? false : { scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={viewport}
            transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.1 }}
          >
            {step}
          </motion.span>
          <div className="min-w-0 flex-1 pt-0.5">
            <motion.h3
              className="text-xl font-semibold leading-snug text-neutral-900"
              variants={reduced ? fadeUpReduced : fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              transition={{ duration: 0.45, delay: 0.15, ease: easeOut }}
            >
              {title}
            </motion.h3>
            <motion.p
              className="mt-2 text-[0.9375rem] leading-relaxed text-neutral-600"
              variants={reduced ? fadeUpReduced : fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              transition={{ duration: 0.45, delay: 0.22, ease: easeOut }}
            >
              {body}
            </motion.p>
          </div>
        </div>
      </Reveal>
    </li>
  );
}
