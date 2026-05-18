import { getCategory, getRoom } from "@/lib/taxonomies";

export function EmojiBadge({ kind, value }: { kind: "room" | "category"; value: string }) {
  const tax = kind === "room" ? getRoom(value) : getCategory(value);
  if (!tax) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
      <span>{tax.emoji}</span>
      <span>{tax.label}</span>
    </span>
  );
}
