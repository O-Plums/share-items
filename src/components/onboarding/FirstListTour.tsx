"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/config";
import { useDashboardFetch } from "@/lib/client";
import {
  FORCE_TOUR_PARAM,
  ITEM_TOUR_QUERY_PARAM,
  isFirstListTourDone,
  markFirstListTourDone,
  WELCOME_QUERY_PARAM,
  driverProgressText,
} from "@/lib/first-list-tour";
import { TourAddItemPrompt } from "@/components/onboarding/TourAddItemPrompt";

type Tab = "items" | "results" | "share";

type Props = {
  listId: string;
  ready: boolean;
  /** From parent URL (?welcome=1) — avoids useSearchParams hydration race on client nav. */
  welcome?: boolean;
  onTabChange: (tab: Tab) => void;
};

export function FirstListTour({ listId, ready, welcome = false, onTabChange }: Props) {
  const t = useTranslations("tour");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const searchParams = useSearchParams();
  const authedFetch = useDashboardFetch();
  const launchedRef = useRef(false);
  const [showAddItemPrompt, setShowAddItemPrompt] = useState(false);

  const isWelcome = welcome || searchParams.get(WELCOME_QUERY_PARAM) === "1";
  const forceTour = searchParams.get(FORCE_TOUR_PARAM) === "1";

  useEffect(() => {
    if (!ready || launchedRef.current) return;
    if (!forceTour && isFirstListTourDone()) return;

    let cancelled = false;
    let driveTimeout: number | undefined;

    async function run() {
      let shouldRun = forceTour || isWelcome;
      if (!shouldRun) {
        try {
          const { lists } = await authedFetch<{ lists: { id: string }[] }>("/api/lists");
          shouldRun = lists.length === 1 && lists[0]?.id === listId;
        } catch {
          return;
        }
      }

      if (!shouldRun || cancelled) return;

      const { driver } = await import("driver.js");

      const switchTab = (tab: Tab) => {
        onTabChange(tab);
      };

      const waitForPaint = () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        });

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
          switchTab("items");
          if (isWelcome) {
            const url = new URL(window.location.href);
            url.searchParams.delete(WELCOME_QUERY_PARAM);
            const qs = url.searchParams.toString();
            router.replace(qs ? `${url.pathname}?${qs}` : url.pathname);
          }
          if (!forceTour) setShowAddItemPrompt(true);
          else markFirstListTourDone();
        },
        steps: [
          {
            popover: {
              title: t("stepWelcomeTitle"),
              description: t("stepWelcomeBody"),
              side: "over",
              align: "center",
            },
          },
          {
            element: "[data-tour='list-title']",
            popover: {
              title: t("stepTitleTitle"),
              description: t("stepTitleBody"),
              side: "bottom",
              align: "start",
            },
          },
          {
            element: "[data-tour='list-tabs']",
            popover: {
              title: t("stepTabsTitle"),
              description: t("stepTabsBody"),
              side: "bottom",
              align: "center",
            },
          },
          {
            element: "[data-tour='add-items']",
            onHighlightStarted: async (_el, _step, { driver: d }) => {
              switchTab("items");
              await waitForPaint();
              d.refresh();
            },
            popover: {
              title: t("stepAddTitle"),
              description: t("stepAddBody"),
              side: "bottom",
              align: "center",
            },
          },
          {
            element: "[data-tour='share-panel']",
            onHighlightStarted: async (_el, _step, { driver: d }) => {
              switchTab("share");
              await waitForPaint();
              d.refresh();
            },
            popover: {
              title: t("stepShareTitle"),
              description: t("stepShareBody"),
              side: "top",
              align: "center",
            },
          },
          {
            element: "[data-tour='results-panel']",
            onHighlightStarted: async (_el, _step, { driver: d }) => {
              switchTab("results");
              await waitForPaint();
              d.refresh();
            },
            popover: {
              title: t("stepResultsTitle"),
              description: t("stepResultsBody"),
              side: "top",
              align: "center",
            },
          },
        ],
      });

      if (!cancelled) {
        driveTimeout = window.setTimeout(() => {
          if (cancelled) return;
          launchedRef.current = true;
          driverObj.drive();
        }, 600);
      }
    }

    void run();

    return () => {
      cancelled = true;
      if (driveTimeout !== undefined) clearTimeout(driveTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot launch; welcome prop avoids searchParams race
  }, [ready, listId, isWelcome, forceTour, welcome]);

  function finishListTour() {
    markFirstListTourDone();
    setShowAddItemPrompt(false);
  }

  function onAddItemYes() {
    finishListTour();
    router.push(`/dashboard/${listId}/items/new?${ITEM_TOUR_QUERY_PARAM}=1`);
  }

  return (
    <>
      {showAddItemPrompt && (
        <TourAddItemPrompt onYes={onAddItemYes} onNo={finishListTour} />
      )}
    </>
  );
}
