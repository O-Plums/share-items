/**
 * Design tokens — toutes les couleurs du projet en un seul endroit.
 *
 * Deux niveaux :
 *
 * 1. `palette` : les couleurs brutes, organisées en échelles 50→900 façon Tailwind.
 *    Servent de source de vérité — on ne touche aux hex que ici.
 *
 * 2. `semantic` : des alias parlants (primary, success, danger, …) qui pointent
 *    vers une palette. C'est ce qu'on utilise dans les composants pour exprimer
 *    une *intention* plutôt qu'une couleur ("ce bouton est destructif" plutôt
 *    que "ce bouton est rouge").
 *
 * Les deux sont exposés dans `tailwind.config.ts`. Les classes Tailwind
 * `bg-primary-500`, `text-success-700`, `ring-secondary-200`, etc. fonctionnent.
 *
 * Les anciens alias historiques (`brand`, `voter`) sont conservés pour la
 * rétro-compat — voir le bas du fichier.
 */

export type ColorScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Palette brute — hex literals, source de vérité.
// ─────────────────────────────────────────────────────────────────────────────

/** Rose vif — l'identité visuelle de Sort your life. */
const pink: ColorScale = {
  50: "#fff1f4",
  100: "#ffe1e9",
  200: "#ffc3d4",
  300: "#ff95b3",
  400: "#fc5d8a",
  500: "#f43568",
  600: "#e11849",
  700: "#bd0d3b",
  800: "#9c0e36",
  900: "#831033",
};

/** Bleu ciel — accent pour le côté votant (échelle Tailwind `sky`). */
const sky: ColorScale = {
  50: "#f0f9ff",
  100: "#e0f2fe",
  200: "#bae6fd",
  300: "#7dd3fc",
  400: "#38bdf8",
  500: "#0ea5e9",
  600: "#0284c7",
  700: "#0369a1",
  800: "#075985",
  900: "#0c4a6e",
};

/** Vert — feedback positif, votes Oui (échelle Tailwind `emerald`). */
const emerald: ColorScale = {
  50: "#ecfdf5",
  100: "#d1fae5",
  200: "#a7f3d0",
  300: "#6ee7b7",
  400: "#34d399",
  500: "#10b981",
  600: "#059669",
  700: "#047857",
  800: "#065f46",
  900: "#064e3b",
};

/** Rouge — erreurs, destructif (échelle Tailwind `red`). */
const red: ColorScale = {
  50: "#fef2f2",
  100: "#fee2e2",
  200: "#fecaca",
  300: "#fca5a5",
  400: "#f87171",
  500: "#ef4444",
  600: "#dc2626",
  700: "#b91c1c",
  800: "#991b1b",
  900: "#7f1d1d",
};

/** Ambre — avertissements (échelle Tailwind `amber`). */
const amber: ColorScale = {
  50: "#fffbeb",
  100: "#fef3c7",
  200: "#fde68a",
  300: "#fcd34d",
  400: "#fbbf24",
  500: "#f59e0b",
  600: "#d97706",
  700: "#b45309",
  800: "#92400e",
  900: "#78350f",
};

/** Rose pâle — votes Non sur la card de swipe (échelle Tailwind `rose`). */
const rose: ColorScale = {
  50: "#fff1f2",
  100: "#ffe4e6",
  200: "#fecdd3",
  300: "#fda4af",
  400: "#fb7185",
  500: "#f43f5e",
  600: "#e11d48",
  700: "#be123c",
  800: "#9f1239",
  900: "#881337",
};

export const palette = {
  pink,
  sky,
  emerald,
  red,
  amber,
  rose,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 2. Alias sémantiques — c'est ce qu'on utilise dans le code applicatif.
// ─────────────────────────────────────────────────────────────────────────────

export const semantic = {
  /** Couleur identitaire du produit — boutons principaux, marque, organisateur. */
  primary: pink,
  /** Accent secondaire — côté votant (swipe, matchs reçus, identité visiteur). */
  secondary: sky,
  /** Feedback positif — votes Oui, confirmations, badge "Connecté". */
  success: emerald,
  /** Erreurs et actions destructives — messages d'erreur, "Effacer mes votes". */
  danger: red,
  /** Avertissements informatifs — blocs "à compléter", warnings non bloquants. */
  warning: amber,
  /** Vote Non sur la carte de swipe — sémantiquement attaché au geste, pas une "danger". */
  no: rose,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 3. Alias historiques — gardés pour rétro-compatibilité du code existant.
//    Préférer `primary` / `secondary` pour le nouveau code.
// ─────────────────────────────────────────────────────────────────────────────

export const legacyAliases = {
  /** @deprecated utiliser `primary` à la place. */
  brand: pink,
  /** @deprecated utiliser `secondary` à la place. */
  voter: sky,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 4. Helper — exporte tout sous la forme attendue par Tailwind.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Toutes les couleurs custom à brancher dans `tailwind.config.ts`.
 * Inclut les alias sémantiques + les anciens noms pour rétro-compat.
 */
export const tailwindColors = {
  ...semantic,
  ...legacyAliases,
} as const;
