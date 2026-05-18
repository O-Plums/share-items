"use client";

import { getCategory, getRoom } from "@/lib/taxonomies";
import type { RoomMeta } from "@/lib/user-room";
import { useUserRooms } from "@/components/UserRoomsProvider";

type Props = {
  kind: "room" | "category";
  value: string;
  roomMeta?: RoomMeta;
};

export function EmojiBadge({ kind, value, roomMeta }: Props) {
  const { rooms } = useUserRooms();

  let emoji: string | undefined;
  let label: string | undefined;

  if (kind === "room") {
    if (roomMeta) {
      emoji = roomMeta.emoji;
      label = roomMeta.label;
    } else {
      const built = getRoom(value);
      if (built) {
        emoji = built.emoji;
        label = built.label;
      } else {
        const custom = rooms.find((r) => r.id === value);
        if (custom) {
          emoji = custom.emoji;
          label = custom.label;
        }
      }
    }
  } else {
    const tax = getCategory(value);
    if (tax) {
      emoji = tax.emoji;
      label = tax.label;
    }
  }

  if (!emoji || !label) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
      <span>{emoji}</span>
      <span>{label}</span>
    </span>
  );
}
