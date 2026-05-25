"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { AppLogo } from "@/components/AppLogo";
import { LOGO_PATH, SITE_NAME } from "@/lib/site";
import {
  dismissPwaPromptLater,
  getInstallPlatform,
  markPwaInstalled,
  shouldOfferPwaInstall,
  type InstallPlatform,
} from "@/lib/pwa";

const SHOW_DELAY_MS = 1200;

export function PwaInstallPrompt() {
  const t = useTranslations("pwa");
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<InstallPlatform | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (!shouldOfferPwaInstall()) return;

    const detected = getInstallPlatform();
    if (!detected) return;

    setPlatform(detected);

    const onInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const onInstalled = () => {
      markPwaInstalled();
      setOpen(false);
    };

    window.addEventListener("beforeinstallprompt", onInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    const timer = window.setTimeout(() => setOpen(true), SHOW_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function handleLater() {
    dismissPwaPromptLater();
    setOpen(false);
  }

  async function handleNativeInstall() {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        markPwaInstalled();
        setOpen(false);
      }
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  }

  const steps =
    platform === "ios"
      ? [t("iosStep1", { name: SITE_NAME }), t("iosStep2"), t("iosStep3")]
      : [t("androidStep1"), t("androidStep2"), t("androidStep3")];

  return (
    <AnimatePresence>
      {open && platform && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.1 : 0.2 }}
            onClick={handleLater}
            className="fixed inset-0 z-[60] bg-black/45"
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-install-title"
            initial={reduced ? { opacity: 0 } : { y: "100%" }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: "100%" }}
            transition={reduced ? { duration: 0.15 } : { type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-[70] mx-auto max-w-md rounded-t-3xl bg-white shadow-2xl"
          >
            <div className="safe-bottom px-5 pb-6 pt-3">
              <div className="flex justify-center">
                <div className="h-1.5 w-10 rounded-full bg-neutral-300" />
              </div>

              <div className="mt-4 flex items-center gap-3">
                <AppLogo size={48} href={null} />
                <div>
                  <h2 id="pwa-install-title" className="text-lg font-semibold text-neutral-900">
                    {t("title")}
                  </h2>
                  <p className="mt-0.5 text-sm text-neutral-600">{t("subtitle")}</p>
                </div>
              </div>

              <ol className="mt-5 space-y-3">
                {steps.map((step, i) => (
                  <li key={step} className="flex gap-3 text-sm leading-snug text-neutral-800">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>

              {platform === "ios" && (
                <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-neutral-100 px-3 py-2.5 text-sm text-neutral-600">
                  <Image src={LOGO_PATH} alt="" width={28} height={28} className="rounded-lg" aria-hidden />
                  <span>{t("iosHint", { name: SITE_NAME })}</span>
                </div>
              )}

              <div className="mt-5 flex flex-col gap-2">
                {platform === "android" && deferredPrompt && (
                  <button
                    type="button"
                    onClick={handleNativeInstall}
                    disabled={installing}
                    className="w-full rounded-2xl bg-brand-500 py-3.5 text-sm font-semibold text-white active:bg-brand-600 disabled:opacity-60"
                  >
                    {installing ? t("installing") : t("install")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleLater}
                  className="w-full rounded-2xl bg-neutral-100 py-3.5 text-sm font-medium text-neutral-800 active:bg-neutral-200"
                >
                  {t("later")}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
