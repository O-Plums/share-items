"use client";

import { useEffect } from "react";
import {
  persistAttribution,
  readAttributionFromUrl,
} from "@/lib/attribution";

/**
 * Capture UTM / gclid / fbclid + referrer on first landing, persist with
 * "first-touch wins" semantics (later visits don't overwrite). Mounted in
 * the root layout so it runs on every entry page.
 */
export function AttributionCapture() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const fields = readAttributionFromUrl(window.location.href, document.referrer || null);
    persistAttribution(fields);
  }, []);

  return null;
}
