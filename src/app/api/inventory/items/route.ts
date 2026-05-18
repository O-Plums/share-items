import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, requireUser } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { isValidCategory } from "@/lib/taxonomies";
import { assertUserRoomKey } from "@/lib/user-room";

const MAX_TAGS_PER_ITEM = 3;

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = (await req.json()) as {
      imageUrl?: string;
      room?: string;
      category?: string;
      label?: string | null;
      tagIds?: string[];
    };

    const imageUrl = body.imageUrl?.trim();
    const room = body.room?.trim() ?? "";
    const category = body.category?.trim() ?? "";
    const label = body.label?.trim() ?? null;
    const tagIds = Array.isArray(body.tagIds) ? body.tagIds.slice(0, MAX_TAGS_PER_ITEM) : [];

    if (!imageUrl) throw new ApiError("Photo manquante", 400);
    await assertUserRoomKey(user.id, room);
    if (!isValidCategory(category)) throw new ApiError("Catégorie invalide", 400);
    if (label && label.length > 60) throw new ApiError("Libellé trop long", 400);

    if (tagIds.length > 0) {
      const owned = await prisma.userTag.findMany({
        where: { userId: user.id, id: { in: tagIds } },
        select: { id: true },
      });
      if (owned.length !== tagIds.length) {
        throw new ApiError("Tag inconnu", 400);
      }
    }

    const item = await prisma.item.create({
      data: {
        userId: user.id,
        listId: null,
        imageUrl,
        room,
        category,
        label: label && label.length > 0 ? label : null,
        sortOrder: 0,
        tags: tagIds.length
          ? { create: tagIds.map((id) => ({ userTagId: id })) }
          : undefined,
      },
    });

    return json({ item }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
