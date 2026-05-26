"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import { useTranslations } from "next-intl";
import { AppLogo } from "@/components/AppLogo";
import { PublicLanguageBar } from "@/components/PublicLanguageBar";
import { HomeStep } from "@/components/home/HomeStep";
import { Reveal } from "@/components/home/Reveal";
import { AnimateIn } from "@/components/ui/AnimateIn";
import type { HomeCopy } from "@/components/home/types";
import { easeOut, fadeUp, fadeUpReduced } from "@/components/home/motion";
import { GITHUB_URL } from "@/lib/site";

type Props = {
  copy: HomeCopy;
};

export function HomeLandingClient({ copy }: Props) {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const tLegal = useTranslations("legal.common");

  const heroVariants = reduced ? fadeUpReduced : fadeUp;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-neutral-50 safe-bottom">
      <PublicLanguageBar />

      {/* Scroll progress */}
      <motion.div
        className="fixed inset-x-0 top-0 z-40 h-0.5 origin-left bg-brand-500"
        style={{ scaleX: scrollYProgress }}
        aria-hidden
      />

      {/* Ambient blobs */}
      <motion.div
        className="pointer-events-none absolute -right-24 top-20 h-64 w-64 rounded-full bg-brand-200/50 blur-3xl"
        animate={reduced ? undefined : { x: [0, -12, 0], y: [0, 8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -left-16 top-[40%] h-48 w-48 rounded-full bg-brand-100/60 blur-3xl"
        animate={reduced ? undefined : { x: [0, 10, 0], y: [0, -6, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-lg px-4 pb-28 pt-14 safe-top sm:max-w-xl sm:px-5 sm:pb-14">
        {/* Hero */}
        <header className="text-center">
          <motion.div
            className="flex justify-center"
            initial={reduced ? false : { scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <AppLogo size={80} href={null} priority />
          </motion.div>

          <motion.p
            className="mt-5 inline-block rounded-full bg-brand-100/80 px-3.5 py-1 text-xs font-semibold text-brand-800"
            variants={heroVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.45, delay: 0.1, ease: easeOut }}
          >
            {copy.eyebrow}
          </motion.p>

          <motion.h1
            className="mt-3 text-[1.75rem] font-bold leading-[1.15] tracking-tight text-neutral-900"
            variants={heroVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.18, ease: easeOut }}
          >
            {copy.headline}
          </motion.h1>

          <motion.p
            className="mx-auto mt-3 max-w-[20rem] text-[0.9375rem] leading-relaxed text-neutral-600 sm:max-w-md sm:text-base"
            variants={heroVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.26, ease: easeOut }}
          >
            {copy.subhead}
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.38, ease: easeOut }}
            className="mt-7"
          >
            <Link
              href="/dashboard"
              className="block w-full rounded-2xl bg-brand-500 px-6 py-4 text-center text-lg font-semibold text-white shadow-lg shadow-brand-500/25 transition active:scale-[0.98] active:bg-brand-600"
            >
              {copy.createList}
            </Link>
          </motion.div>

          <motion.p
            className="mt-4 px-2 text-sm leading-snug text-neutral-500"
            variants={heroVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.45, delay: 0.48, ease: easeOut }}
          >
            {copy.hasLink}{" "}
            <span className="text-neutral-700">{copy.hasLinkDetail}</span>
          </motion.p>
        </header>

        {/* Use cases — horizontal snap on mobile */}
        <Reveal className="mt-12" delay={0.05}>
          <h2 className="px-1 text-center text-xs font-semibold uppercase tracking-widest text-neutral-500">
            {copy.useCasesTitle}
          </h2>
          <ul className="mt-4 -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 snap-x snap-mandatory no-scrollbar">
            {copy.useCases.map((label, i) => (
              <motion.li
                key={label}
                initial={reduced ? false : { opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: easeOut }}
                className="snap-center shrink-0 rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 shadow-sm ring-1 ring-neutral-200/80"
              >
                {label}
              </motion.li>
            ))}
          </ul>
        </Reveal>

        {/* How it works */}
        <section className="mt-14" aria-labelledby="home-how">
          <Reveal>
            <h2 id="home-how" className="text-center text-2xl font-bold text-neutral-900">
              {copy.howTitle}
            </h2>
            <p className="mt-2 text-center text-[0.9375rem] leading-relaxed text-neutral-600">
              {copy.howSubtitle}
            </p>
          </Reveal>

          <AnimateIn as="ol" className="mt-10 space-y-16 sm:space-y-20">
            {copy.steps.map((step, i) => (
              <HomeStep
                key={step.step}
                {...step}
                isLast={i === copy.steps.length - 1}
                shareLabels={
                  step.kind === "share"
                    ? {
                        title: copy.shareMockTitle,
                        hint: copy.shareMockHint,
                        copy: copy.shareMockCopy,
                        whatsapp: copy.shareMockWhatsApp,
                      }
                    : undefined
                }
              />
            ))}
          </AnimateIn>
        </section>

        {/* Share spotlight */}
        <Reveal className="mt-16">
          <section
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-brand-50/80 p-6 shadow-sm ring-1 ring-brand-100 sm:p-7"
            aria-labelledby="home-share"
          >
            <motion.div
              className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-200/40 blur-2xl"
              animate={reduced ? undefined : { scale: [1, 1.15, 1] }}
              transition={{ duration: 5, repeat: Infinity }}
              aria-hidden
            />
            <h2 id="home-share" className="relative text-xl font-bold leading-snug text-neutral-900">
              {copy.shareSpotlightTitle}
            </h2>
            <p className="relative mt-2.5 text-[0.9375rem] leading-relaxed text-neutral-600">
              {copy.shareSpotlightBody}
            </p>
            <ul className="relative mt-5 space-y-3">
              {copy.shareSpotlightPoints.map((point, i) => (
                <motion.li
                  key={point}
                  className="flex gap-3 text-sm text-neutral-800"
                  initial={reduced ? false : { opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease: easeOut }}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                    ✓
                  </span>
                  <span className="pt-0.5 leading-snug">{point}</span>
                </motion.li>
              ))}
            </ul>
          </section>
        </Reveal>

        {/* Two paths — stacked on mobile */}
        <section className="mt-14" aria-labelledby="home-paths">
          <Reveal>
            <h2 id="home-paths" className="text-center text-2xl font-bold text-neutral-900">
              {copy.pathsTitle}
            </h2>
          </Reveal>
          <div className="mt-6 flex flex-col gap-3">
            <Reveal delay={0.05}>
              <article className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200">
                <p className="text-2xl" aria-hidden>
                  📋
                </p>
                <h3 className="mt-2 text-lg font-semibold text-neutral-900">{copy.pathOrganizerTitle}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">{copy.pathOrganizerBody}</p>
                <Link
                  href="/dashboard"
                  className="mt-4 block rounded-xl bg-brand-500 py-3.5 text-center text-sm font-semibold text-white shadow-md shadow-brand-500/20 active:scale-[0.98] active:bg-brand-600"
                >
                  {copy.pathOrganizerCta}
                </Link>
              </article>
            </Reveal>
            <Reveal delay={0.12}>
              <article className="flex flex-col rounded-2xl bg-secondary-50/70 p-5 ring-1 ring-secondary-200/80">
                <p className="text-2xl" aria-hidden>
                  🔗
                </p>
                <h3 className="mt-2 text-lg font-semibold text-neutral-900">{copy.pathGuestTitle}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">{copy.pathGuestBody}</p>
                <p className="mt-4 rounded-xl bg-white px-3 py-3 text-center text-sm font-medium text-neutral-700 ring-1 ring-secondary-100">
                  {copy.pathGuestHint}
                </p>
              </article>
            </Reveal>
          </div>
        </section>

        {/* Reassurance */}
        <Reveal className="mt-14">
          <section className="rounded-2xl border border-dashed border-neutral-300/80 bg-white/60 p-5 backdrop-blur-sm">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              {copy.reassureTitle}
            </h2>
            <ul className="mt-4 space-y-3">
              {copy.reassurePoints.map((point, i) => (
                <motion.li
                  key={point}
                  className="text-sm leading-snug text-neutral-700"
                  initial={reduced ? false : { opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                >
                  {point}
                </motion.li>
              ))}
            </ul>
          </section>
        </Reveal>

        {/* Desktop bottom CTA */}
        <Reveal className="mt-10 hidden text-center sm:block">
          <Link
            href="/dashboard"
            className="inline-block rounded-2xl bg-brand-500 px-8 py-3.5 text-lg font-semibold text-white shadow-lg shadow-brand-500/20 active:scale-[0.98] active:bg-brand-600"
          >
            {copy.createList}
          </Link>
        </Reveal>

        <footer className="mt-12 pb-32 text-center text-xs text-neutral-500 sm:pb-10">
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href="/legal/cgu" className="hover:text-neutral-700 hover:underline">
              {tLegal("cguLink")}
            </Link>
            <span aria-hidden>·</span>
            <Link href="/legal/cgv" className="hover:text-neutral-700 hover:underline">
              {tLegal("cgvLink")}
            </Link>
            <span aria-hidden>·</span>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-neutral-700 hover:underline"
            >
              <GitHubMark />
              <span>{tLegal("sourceCode")}</span>
            </a>
          </nav>
        </footer>
      </div>

      {/* Mobile sticky CTA */}
      <motion.div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200/80 bg-neutral-50/90 px-4 py-3 backdrop-blur-md safe-bottom sm:hidden"
        initial={reduced ? false : { y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.45, ease: easeOut }}
      >
        <Link
          href="/dashboard"
          className="block w-full rounded-2xl bg-brand-500 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-brand-500/25 active:scale-[0.98] active:bg-brand-600"
        >
          {copy.createList}
        </Link>
      </motion.div>
    </main>
  );
}

function GitHubMark() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="-mt-px"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.1c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.68 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.77.11 3.06.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.13v3.16c0 .3.21.65.79.54A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}
