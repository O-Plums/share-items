"use client";

import { useEffect } from "react";

const STORAGE_KEY = "share-items-identity";
const CLAIMED_FLAG = "share-items-visitor-claimed";

export function ClaimVisitorListsTrigger() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(CLAIMED_FLAG)) return;

    let visitorId: string | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { visitorId?: string };
        if (parsed?.visitorId) visitorId = parsed.visitorId;
      }
    } catch {
      return;
    }
    if (!visitorId) {
      window.localStorage.setItem(CLAIMED_FLAG, "1");
      return;
    }

    fetch("/api/auth/claim-lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId }),
    })
      .then(async (res) => {
        if (res.ok) {
          window.localStorage.setItem(CLAIMED_FLAG, "1");
        }
      })
      .catch(() => {
        // silent — will retry next time the dashboard mounts
      });
  }, []);

  return null;
}
