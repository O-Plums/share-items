"use client";

import type { Taxonomy } from "@/lib/taxonomies";

type Props = {
  items: readonly Taxonomy[];
  selected: string | null;
  onSelect: (key: string) => void;
};

export function EmojiGrid({ items, selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => {
        const isActive = item.key === selected;
        return (
          <button
            key={item.key}
            type="button"
            aria-label={item.label}
            aria-pressed={isActive}
            onClick={() => onSelect(item.key)}
            className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 p-2 text-center transition active:scale-95 ${
              isActive
                ? "border-brand-500 bg-brand-50 text-neutral-900"
                : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
            }`}
          >
            <span className="text-4xl leading-none">{item.emoji}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
