"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import {
  clearStoredAttribution,
  loadStoredAttribution,
} from "@/lib/attribution";

const SIGNUP_FLAG = "sortyourlife.signup-tracked";
const ATTRIBUTION_SYNC_FLAG = "sortyourlife.attribution-synced";

/**
 * Mounted inside `/dashboard/*`. Runs once per local install:
 *   1. Fires the `signup` Vercel Analytics event (de-duped via localStorage).
 *   2. POSTs the stored attribution to `/api/attribution`. The server upserts
 *      first-touch only; client-side flag prevents redundant calls.
 *
 * Failures are silent — analytics must never break the dashboard.
 */
export function PostSignupSync() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!window.localStorage.getItem(SIGNUP_FLAG)) {
      const attribution = loadStoredAttribution();
      track("signup", { source: attribution?.utmSource ?? attribution?.referrer ?? null });
      window.localStorage.setItem(SIGNUP_FLAG, "1");
    }

    if (window.localStorage.getItem(ATTRIBUTION_SYNC_FLAG)) return;
    const attribution = loadStoredAttribution();
    if (!attribution) {
      window.localStorage.setItem(ATTRIBUTION_SYNC_FLAG, "1");
      return;
    }

    fetch("/api/attribution", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        utmSource: attribution.utmSource,
        utmMedium: attribution.utmMedium,
        utmCampaign: attribution.utmCampaign,
        utmContent: attribution.utmContent,
        utmTerm: attribution.utmTerm,
        referrer: attribution.referrer,
        landingPath: attribution.landingPath,
        gclid: attribution.gclid,
        fbclid: attribution.fbclid,
      }),
    })
      .then((res) => {
        if (res.ok) {
          window.localStorage.setItem(ATTRIBUTION_SYNC_FLAG, "1");
          clearStoredAttribution();
        }
      })
      .catch(() => {
        /* retried next mount */
      });
  }, []);

  return null;
}
