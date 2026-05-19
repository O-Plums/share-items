"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { EmojiBadge } from "@/components/EmojiBadge";

type Match = {
  itemId: string;
  createdAt: string;
  item: {
    id: string;
    imageUrl: string;
    label: string | null;
    room: string;
    roomMeta?: { emoji: string; label: string };
    category: string;
  };
};

export function MatchesView({ matches }: { matches: Match[] }) {
  const t = useTranslations("voter");
  if (matches.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="text-center">
          <p className="text-6xl">🎁</p>
          <h2 className="mt-4 text-xl font-bold">{t("matchesEmpty")}</h2>
          <p className="mt-2 text-sm text-neutral-600">{t("matchesEmptyBody")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4">
      <div className="mx-auto max-w-md">
        <h2 className="text-sm font-medium uppercase tracking-wider text-neutral-500">{t("tabMatches")}</h2>
        <ul className="mt-3 grid grid-cols-2 gap-3">
          {matches.map((m) => (
            <li
              key={m.itemId}
              className="overflow-hidden rounded-2xl bg-white ring-1 ring-brand-200"
            >
              <div className="relative aspect-square bg-neutral-100">
                <Image
                  src={m.item.imageUrl}
                  alt={m.item.label ?? ""}
                  fill
                  sizes="50vw"
                  className="object-cover"
                />
                <div className="absolute left-2 top-2 rounded-full bg-brand-500 px-2 py-0.5 text-xs font-semibold text-white">
                  🤝 {t("tabMatches")}
                </div>
              </div>
              <div className="space-y-1 p-2.5">
                {m.item.label && <p className="truncate text-sm font-medium">{m.item.label}</p>}
                <div className="flex flex-wrap gap-1">
                  <EmojiBadge kind="room" value={m.item.room} roomMeta={m.item.roomMeta} />
                  <EmojiBadge kind="category" value={m.item.category} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
