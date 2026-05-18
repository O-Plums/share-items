import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/auth";
import { getRoom, isValidRoom } from "@/lib/taxonomies";

export type RoomMeta = { emoji: string; label: string };

export async function assertUserRoomKey(userId: string, roomKey: string) {
  if (isValidRoom(roomKey)) return;
  const row = await prisma.userRoom.findFirst({
    where: { id: roomKey, userId },
    select: { id: true },
  });
  if (!row) throw new ApiError("Pièce invalide", 400);
}

export async function buildRoomMetaMap(
  ownerUserId: string,
  roomKeys: string[],
): Promise<Map<string, RoomMeta>> {
  const customIds = [...new Set(roomKeys.filter((k) => !isValidRoom(k)))];
  if (customIds.length === 0) return new Map();

  const rows = await prisma.userRoom.findMany({
    where: { userId: ownerUserId, id: { in: customIds } },
    select: { id: true, emoji: true, label: true },
  });
  return new Map(rows.map((r) => [r.id, { emoji: r.emoji, label: r.label }]));
}

export function resolveRoomMeta(roomKey: string, customMap: Map<string, RoomMeta>): RoomMeta | undefined {
  const built = getRoom(roomKey);
  if (built) return { emoji: built.emoji, label: built.label };
  return customMap.get(roomKey);
}

export async function attachRoomMeta<T extends { room: string }>(
  ownerUserId: string,
  rows: T[],
): Promise<(T & { roomMeta: RoomMeta })[]> {
  const map = await buildRoomMetaMap(
    ownerUserId,
    rows.map((r) => r.room),
  );
  return rows.map((row) => {
    const roomMeta = resolveRoomMeta(row.room, map);
    if (!roomMeta) {
      return { ...row, roomMeta: { emoji: "🏠", label: "Pièce" } };
    }
    return { ...row, roomMeta };
  });
}
