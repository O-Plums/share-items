"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  /** Total seconds before the redirect. Defaults to 5. */
  seconds?: number;
  /** Template for the countdown label, e.g. "Redirection dans {seconds}s…". */
  label: string;
};

/**
 * Soft-redirects the visitor to "/" after a small countdown. The countdown is
 * visible so the redirect is never silent (better UX than just "click here").
 */
export function AutoRedirectHome({ seconds = 5, label }: Props) {
  const router = useRouter();
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const tick = setInterval(() => {
      setRemaining((n) => (n > 0 ? n - 1 : n));
    }, 1000);
    const done = setTimeout(() => {
      router.replace("/");
    }, seconds * 1000);
    return () => {
      clearInterval(tick);
      clearTimeout(done);
    };
  }, [router, seconds]);

  return (
    <p
      role="status"
      aria-live="polite"
      className="text-xs uppercase tracking-wider text-neutral-500"
    >
      {label.replace("{seconds}", String(remaining))}
    </p>
  );
}
