"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "share-items-identity";

export type Identity = {
  visitorId: string;
  displayName: string;
  /** `google` = identité liée au compte OAuth (visitorId = user.id) */
  source?: "name" | "google";
};

type IdentityContextValue = {
  identity: Identity | null;
  ready: boolean;
  setDisplayName: (name: string) => void;
  /** Lie l’identité votant à un compte Google (id stable entre appareils). */
  setIdentityFromAuth: (visitorId: string, displayName: string) => void;
  reset: () => void;
};

const IdentityContext = createContext<IdentityContextValue | null>(null);

function readIdentity(): Identity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Identity>;
    if (
      typeof parsed.visitorId === "string" &&
      parsed.visitorId.length > 0 &&
      typeof parsed.displayName === "string" &&
      parsed.displayName.length > 0
    ) {
      return parsed as Identity;
    }
    return null;
  } catch {
    return null;
  }
}

function writeIdentity(identity: Identity) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
}

function clearIdentity() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

function newVisitorId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `v_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIdentity(readIdentity());
    setReady(true);
  }, []);

  const setDisplayName = useCallback((name: string) => {
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 30) return;
    setIdentity((current) => {
      const next: Identity = {
        visitorId: current?.visitorId ?? newVisitorId(),
        displayName: trimmed,
        source: current?.source === "google" ? "google" : "name",
      };
      writeIdentity(next);
      return next;
    });
  }, []);

  const setIdentityFromAuth = useCallback((visitorId: string, displayName: string) => {
    const trimmed = displayName.trim();
    if (!visitorId || trimmed.length < 1 || trimmed.length > 30) return;
    const next: Identity = {
      visitorId,
      displayName: trimmed,
      source: "google",
    };
    writeIdentity(next);
    setIdentity(next);
  }, []);

  const reset = useCallback(() => {
    clearIdentity();
    setIdentity(null);
  }, []);

  const value = useMemo(
    () => ({ identity, ready, setDisplayName, setIdentityFromAuth, reset }),
    [identity, ready, setDisplayName, setIdentityFromAuth, reset],
  );

  return <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>;
}

export function useIdentity(): IdentityContextValue {
  const ctx = useContext(IdentityContext);
  if (!ctx) {
    throw new Error("useIdentity doit être utilisé dans un IdentityProvider");
  }
  return ctx;
}
