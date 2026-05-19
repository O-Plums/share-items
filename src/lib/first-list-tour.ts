import type { Locale } from "@/i18n/config";

export const FIRST_LIST_TOUR_KEY = "share-items-first-list-tour-done";
export const ITEM_TOUR_KEY = "share-items-item-tour-done";

/** Driver.js replaces {{current}} / {{total}} itself — must not go through next-intl ICU. */
export function driverProgressText(locale: Locale): string {
  return locale === "en" ? "{{current}} of {{total}}" : "{{current}} sur {{total}}";
}

/** Set by /dashboard/lists/new after the first list is created. */
export const WELCOME_QUERY_PARAM = "welcome";
/** Dev / QA: force the tour on a list page (?tour=1). */
export const FORCE_TOUR_PARAM = "tour";
/** Continues onboarding on /dashboard/[listId]/items/new */
export const ITEM_TOUR_QUERY_PARAM = "itemTour";

export function isFirstListTourDone(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(FIRST_LIST_TOUR_KEY) === "1";
}

export function markFirstListTourDone(): void {
  window.localStorage.setItem(FIRST_LIST_TOUR_KEY, "1");
}

/** Call when the user has no lists so the next first list can show the tour again. */
export function clearFirstListTourDone(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(FIRST_LIST_TOUR_KEY);
  window.localStorage.removeItem(ITEM_TOUR_KEY);
}

export function isItemTourDone(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(ITEM_TOUR_KEY) === "1";
}

export function markItemTourDone(): void {
  window.localStorage.setItem(ITEM_TOUR_KEY, "1");
}
