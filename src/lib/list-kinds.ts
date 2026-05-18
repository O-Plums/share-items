export type ListKind = "keep" | "donate" | "sell" | "custom";

export const LIST_KINDS = [
  { key: "keep" as const, emoji: "🏠", label: "À garder", color: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { key: "donate" as const, emoji: "🎁", label: "À donner", color: "bg-sky-50 text-sky-700 ring-sky-200" },
  { key: "sell" as const, emoji: "💰", label: "À vendre", color: "bg-amber-50 text-amber-700 ring-amber-200" },
  { key: "custom" as const, emoji: "📋", label: "Autre", color: "bg-neutral-100 text-neutral-700 ring-neutral-200" },
];

export const LIST_KIND_KEYS = LIST_KINDS.map((k) => k.key);

export function getListKind(key: string) {
  return LIST_KINDS.find((k) => k.key === key) ?? LIST_KINDS[3];
}

export function isValidListKind(key: string): key is ListKind {
  return LIST_KIND_KEYS.includes(key as ListKind);
}
