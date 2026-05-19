"use client";

import { useTranslations } from "next-intl";
import { CATEGORIES, ROOMS, CATEGORY_KEYS, ROOM_KEYS } from "@/lib/taxonomies";
import type { RoomMeta } from "@/lib/user-room";
import { useUserRooms } from "@/components/UserRoomsProvider";

type Props = {
  kind: "room" | "category";
  value: string;
  roomMeta?: RoomMeta;
};

export function EmojiBadge({ kind, value, roomMeta }: Props) {
  const { rooms } = useUserRooms();
  const tRooms = useTranslations("taxonomies.rooms");
  const tCategories = useTranslations("taxonomies.categories");
  const tCommon = useTranslations("common");

  let emoji: string | undefined;
  let label: string | undefined;

  if (kind === "room") {
    if (roomMeta) {
      emoji = roomMeta.emoji;
      label = roomMeta.label;
    } else if (ROOM_KEYS.includes(value)) {
      emoji = ROOMS.find((r) => r.key === value)?.emoji;
      label = tRooms(value);
    } else {
      const custom = rooms.find((r) => r.id === value);
      if (custom) {
        emoji = custom.emoji;
        label = custom.label;
      }
    }
  } else if (CATEGORY_KEYS.includes(value)) {
    emoji = CATEGORIES.find((c) => c.key === value)?.emoji;
    label = tCategories(value);
  }

  if (!emoji || !label) {
    if (kind === "room") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
          <span>🏠</span>
          <span>{tCommon("roomFallback")}</span>
        </span>
      );
    }
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
      <span>{emoji}</span>
      <span>{label}</span>
    </span>
  );
}
