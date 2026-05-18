"use client";

import { useIdentity } from "./identity";
import { useCallback } from "react";
import { VISITOR_HEADER } from "./auth-client";

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

export async function uploadImage(file: File, visitorId: string): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { [VISITOR_HEADER]: visitorId },
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
