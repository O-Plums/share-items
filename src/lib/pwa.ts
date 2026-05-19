export const PWA_PROMPT_DISMISS_KEY = "share-items-pwa-prompt-dismissed";

const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export type InstallPlatform = "ios" | "android";

export function isRunningAsPwa(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    nav.standalone === true
  );
}

export function getInstallPlatform(): InstallPlatform | null {
  if (typeof window === "undefined") return null;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return null;
}

export function shouldOfferPwaInstall(): boolean {
  if (typeof window === "undefined") return false;
  if (isRunningAsPwa()) return false;
  if (!getInstallPlatform()) return false;
  return !isPwaPromptDismissed();
}

export function isPwaPromptDismissed(): boolean {
  if (typeof window === "undefined") return true;
  const raw = window.localStorage.getItem(PWA_PROMPT_DISMISS_KEY);
  if (!raw) return false;
  if (raw === "installed") return true;
  const dismissedAt = Number(raw);
  if (!Number.isFinite(dismissedAt)) return true;
  return Date.now() - dismissedAt < DISMISS_COOLDOWN_MS;
}

export function dismissPwaPromptLater(): void {
  window.localStorage.setItem(PWA_PROMPT_DISMISS_KEY, String(Date.now()));
}

export function markPwaInstalled(): void {
  window.localStorage.setItem(PWA_PROMPT_DISMISS_KEY, "installed");
}
