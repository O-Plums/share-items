"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/config";
import {
  ITEM_TOUR_QUERY_PARAM,
  driverProgressText,
  isItemTourDone,
  markItemTourDone,
} from "@/lib/first-list-tour";

type WizardStep = 1 | 2 | 3;

type Props = {
  active: boolean;
  wizardStep: WizardStep;
  hasImage: boolean;
  onWizardStepChange: (step: WizardStep) => void;
};

export function ItemWizardTour({ active, wizardStep, hasImage, onWizardStepChange }: Props) {
  const t = useTranslations("tour");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const searchParams = useSearchParams();
  const launchedRef = useRef(false);
  const driverRef = useRef<ReturnType<typeof import("driver.js").driver> | null>(null);
  const hasImageRef = useRef(hasImage);

  hasImageRef.current = hasImage;

  const itemTour = active || searchParams.get(ITEM_TOUR_QUERY_PARAM) === "1";

  useEffect(() => {
    if (!itemTour || launchedRef.current || isItemTourDone()) return;

    let cancelled = false;
    let driveTimeout: number | undefined;

    async function run() {
      const { driver } = await import("driver.js");

      const waitForPaint = () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        });

      const goToStep = async (step: WizardStep, d: ReturnType<typeof driver>) => {
        onWizardStepChange(step);
        await waitForPaint();
        d.refresh();
      };

      const driverObj = driver({
        animate: true,
        showProgress: true,
        progressText: driverProgressText(locale),
        nextBtnText: t("next"),
        prevBtnText: t("prev"),
        doneBtnText: t("done"),
        allowClose: true,
        overlayColor: "#171717",
        overlayOpacity: 0.55,
        stagePadding: 10,
        stageRadius: 16,
        popoverClass: "share-items-tour-popover",
        showButtons: ["next", "previous", "close"],
        onDestroyed: () => {
          driverRef.current = null;
          markItemTourDone();
          if (searchParams.get(ITEM_TOUR_QUERY_PARAM) === "1") {
            const url = new URL(window.location.href);
            url.searchParams.delete(ITEM_TOUR_QUERY_PARAM);
            const qs = url.searchParams.toString();
            router.replace(qs ? `${url.pathname}?${qs}` : url.pathname);
          }
        },
        steps: [
          {
            popover: {
              title: t("itemWelcomeTitle"),
              description: t("itemWelcomeBody"),
              side: "over",
              align: "center",
            },
          },
          {
            element: "[data-tour='wizard-photo']",
            onHighlightStarted: async (_el, _step, { driver: d }) => {
              await goToStep(1, d);
            },
            popover: {
              title: t("itemPhotoTitle"),
              description: t("itemPhotoBody"),
              side: "bottom",
              align: "center",
            },
          },
          {
            popover: {
              title: t("itemAfterPhotoTitle"),
              description: t("itemAfterPhotoBody"),
              side: "over",
              align: "center",
            },
          },
          {
            element: "[data-tour='wizard-room']",
            onHighlightStarted: async (_el, _step, { driver: d }) => {
              if (!hasImageRef.current) {
                await goToStep(1, d);
                return;
              }
              await goToStep(2, d);
            },
            popover: {
              title: t("itemRoomTitle"),
              description: t("itemRoomBody"),
              side: "top",
              align: "center",
            },
          },
          {
            element: "[data-tour='wizard-category']",
            onHighlightStarted: async (_el, _step, { driver: d }) => {
              if (!hasImageRef.current) {
                await goToStep(1, d);
                return;
              }
              await goToStep(3, d);
            },
            popover: {
              title: t("itemCategoryTitle"),
              description: t("itemCategoryBody"),
              side: "top",
              align: "center",
            },
          },
          {
            element: "[data-tour='wizard-tags']",
            onHighlightStarted: async (_el, _step, { driver: d }) => {
              if (!hasImageRef.current) {
                await goToStep(1, d);
                return;
              }
              await goToStep(3, d);
            },
            popover: {
              title: t("itemTagsTitle"),
              description: t("itemTagsBody"),
              side: "top",
              align: "center",
            },
          },
          {
            element: "[data-tour='wizard-save']",
            onHighlightStarted: async (_el, _step, { driver: d }) => {
              if (!hasImageRef.current) {
                await goToStep(1, d);
                return;
              }
              await goToStep(3, d);
            },
            popover: {
              title: t("itemSaveTitle"),
              description: t("itemSaveBody"),
              side: "top",
              align: "center",
            },
          },
        ],
      });

      driverRef.current = driverObj;

      if (!cancelled) {
        driveTimeout = window.setTimeout(() => {
          if (cancelled) return;
          launchedRef.current = true;
          driverObj.drive();
        }, 500);
      }
    }

    void run();

    return () => {
      cancelled = true;
      if (driveTimeout !== undefined) clearTimeout(driveTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot item tour launch
  }, [itemTour]);

  useEffect(() => {
    if (!launchedRef.current || !driverRef.current) return;
    driverRef.current.refresh();
  }, [wizardStep, hasImage]);

  return null;
}
