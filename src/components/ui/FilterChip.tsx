import type { ReactNode } from "react";

type Tone = "brand" | "voter";

type Props = {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  /** Couleur du chip actif. `brand` (rose, côté créateur) ou `voter` (bleu, côté votant). */
  tone?: Tone;
};

const activeTone: Record<Tone, string> = {
  brand: "bg-primary-500 text-white ring-primary-500",
  voter: "bg-secondary-500 text-white ring-secondary-500",
};

/** Filtre / choix — gros bouton tactile, lisible pour tous les âges. */
export function FilterChip({ active, onClick, children, className = "", tone = "brand" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-sm ring-2 transition active:scale-[0.98] ${className} ${
        active
          ? activeTone[tone]
          : "bg-white text-neutral-800 ring-neutral-200 active:bg-neutral-50"
      }`}
    >
      {children}
    </button>
  );
}
