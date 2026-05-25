"use client";

import { track as vercelTrack } from "@vercel/analytics";

/**
 * Phase 2 — Custom events for funnel analysis.
 *
 * Keep this map tight: every new event should appear here AND surface in the
 * admin dashboard if it should be visible. Vercel Analytics accepts arbitrary
 * keys but we want a typed surface to prevent drift across the codebase.
 */
export type AnalyticsEventMap = {
  signup: { source?: string | null };
  list_created: { kind: string };
  invite_sent: { method: "copy" | "native_share" };
  vote_cast: { value: "YES" | "NO" };
  match_reached: undefined;
};

export type AnalyticsEventName = keyof AnalyticsEventMap;

type TrackProps = Record<string, string | number | boolean | null>;

/**
 * Strongly-typed wrapper around Vercel Analytics' `track()`.
 * No-op on the server / when Analytics is disabled.
 */
export function track<K extends AnalyticsEventName>(
  event: K,
  props?: AnalyticsEventMap[K],
): void {
  if (typeof window === "undefined") return;
  try {
    vercelTrack(event, (props ?? undefined) as TrackProps | undefined);
  } catch {
    /* analytics must never break the app */
  }
}
