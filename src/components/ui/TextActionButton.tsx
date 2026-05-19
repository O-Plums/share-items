import type { ReactNode } from "react";

type Props = {
  onClick: () => void;
  children: ReactNode;
  variant?: "primary" | "neutral";
  className?: string;
};

/** Action secondaire (sélectionner, annuler…) — aspect bouton explicite. */
export function TextActionButton({
  onClick,
  children,
  variant = "primary",
  className = "",
}: Props) {
  const styles =
    variant === "primary"
      ? "bg-brand-50 text-brand-800 ring-brand-200 active:bg-brand-100"
      : "bg-white text-neutral-800 ring-neutral-200 active:bg-neutral-50";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-sm ring-2 transition active:scale-[0.98] ${styles} ${className}`}
    >
      {children}
    </button>
  );
}
