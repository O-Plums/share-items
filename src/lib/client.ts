"use client";

import { useIdentity } from "./identity";
import { useCallback } from "react";
import { VISITOR_HEADER } from "./auth-client";

/**
 * Voter fetch (/l/[slug]) — sends visitor id header, no session needed.
 */
export function useAuthedFetch() {
  const { identity } = useIdentity();
  return useCallback(
    async <T,>(input: string, init?: RequestInit): Promise<T> => {
      if (!identity) throw new Error("Pas d’identité");
      const res = await fetch(input, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          [VISITOR_HEADER]: identity.visitorId,
          ...(init?.headers ?? {}),
        },
      });
      if (!res.ok) {
        let message = `HTTP ${res.status}`;
        try {
          const body = (await res.json()) as { error?: string };
          if (body?.error) message = body.error;
        } catch {}
        throw new Error(message);
      }
      return (await res.json()) as T;
    },
    [identity],
  );
}

/**
 * Dashboard fetch — relies on the Auth.js session cookie. Redirects to /login
 * on 401 to keep the dashboard tight.
 */
export function useDashboardFetch() {
  return useCallback(async <T,>(input: string, init?: RequestInit): Promise<T> => {
    const res = await fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      if (res.status === 401 && typeof window !== "undefined") {
        const path = window.location.pathname + window.location.search;
        window.location.href = `/login?callbackUrl=${encodeURIComponent(path)}`;
      }
      let message = `HTTP ${res.status}`;
      try {
        const body = (await res.json()) as { error?: string };
        if (body?.error) message = body.error;
      } catch {}
      throw new Error(message);
    }
    return (await res.json()) as T;
  }, []);
}

/**
 * Upload image — used in the dashboard wizard. Uses the session cookie; no
 * visitor header is required anymore.
 */
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    let message = `Upload échoué (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {}
    throw new Error(message);
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}
