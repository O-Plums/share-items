"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePullToRefresh } from "use-pull-to-refresh";

const MAX_PULL = 200;
const THRESHOLD = 110;
const MIN_SPIN_MS = 600;

type Props = {
  /**
   * Hook supplémentaire exécuté en parallèle de `router.refresh()`.
   * Utile pour les écrans qui chargent des données côté client (ex. VoterApp).
   */
  onRefresh?: () => void | Promise<void>;
  /** Désactive le pull (par exemple pendant qu'un modal est ouvert). */
  disabled?: boolean;
};

export function PullToRefresh({ onRefresh, disabled = false }: Props) {
  const router = useRouter();

  const handle = useCallback(async () => {
    try {
      const userRefresh = Promise.resolve(onRefresh?.());
      router.refresh();
      await Promise.all([
        userRefresh,
        new Promise<void>((r) => setTimeout(r, MIN_SPIN_MS)),
      ]);
    } catch {
      /* le pull-to-refresh ne doit jamais casser la page */
    }
  }, [onRefresh, router]);

  const { isRefreshing, pullPosition } = usePullToRefresh({
    onRefresh: handle,
    maximumPullLength: MAX_PULL,
    refreshThreshold: THRESHOLD,
    isDisabled: disabled,
    enableResistance: true,
  });

  const isActive = isRefreshing || pullPosition > 0;
  const translateY = isRefreshing
    ? 0
    : Math.min(pullPosition * 0.45, 90) - 90;
  const opacity = isRefreshing ? 1 : Math.min(pullPosition / 40, 1);
  const spinAngle = isRefreshing
    ? null
    : Math.min((pullPosition / THRESHOLD) * 270, 270);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[120] flex justify-center pt-[max(12px,env(safe-area-inset-top))]"
      aria-hidden={!isActive}
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-neutral-200/80"
        style={{
          transform: `translateY(${translateY}px)`,
          opacity,
          transition:
            "transform 90ms ease-out, opacity 120ms ease-out",
          willChange: "transform, opacity",
        }}
      >
        <svg
          className={`h-5 w-5 text-brand-500 ${isRefreshing ? "animate-spin" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          style={
            spinAngle !== null
              ? {
                  transform: `rotate(${spinAngle}deg)`,
                  transition: "transform 60ms linear",
                }
              : undefined
          }
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeOpacity="0.18"
            strokeWidth="3"
          />
          <path
            d="M21 12a9 9 0 0 1-9 9"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
