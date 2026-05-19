import type { ReactNode } from "react";

type Props = {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
};

/** Filtre / choix — gros bouton tactile, lisible pour tous les âges. */
export function FilterChip({ active, onClick, children, className = "" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-sm ring-2 transition active:scale-[0.98] ${className} ${
        active
          ? "bg-brand-500 text-white ring-brand-500"
          : "bg-white text-neutral-800 ring-neutral-200 active:bg-neutral-50"
      }`}
    >
      {children}
    </button>
  );
}
