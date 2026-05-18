import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, requireUser } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { isValidCategory, isValidRoom } from "@/lib/taxonomies";

const MAX_TAGS_PER_ITEM = 3;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = (await req.json()) as {
      imageUrl?: string;
      room?: string;
      category?: string;
      label?: string | null;
      tagIds?: string[];
    };

    const list = await prisma.list.findUnique({ where: { id } });
    if (!list) throw new ApiError("Liste introuvable", 404);
    if (list.userId !== user.id) throw new ApiError("Accès refusé", 403);

    const imageUrl = body.imageUrl?.trim();
    const room = body.room?.trim() ?? "";
    const category = body.category?.trim() ?? "";
    const label = body.label?.trim() ?? null;
    const tagIds = Array.isArray(body.tagIds) ? body.tagIds.slice(0, MAX_TAGS_PER_ITEM) : [];

    if (!imageUrl) throw new ApiError("Photo manquante", 400);
    if (!isValidRoom(room)) throw new ApiError("Pièce invalide", 400);
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

    const last = await prisma.item.findFirst({
      where: { listId: id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const item = await prisma.item.create({
      data: {
        listId: id,
        userId: user.id,
        imageUrl,
        room,
        category,
        label: label && label.length > 0 ? label : null,
        sortOrder: (last?.sortOrder ?? -1) + 1,
        tags: tagIds.length
          ? { create: tagIds.map((tagId) => ({ userTagId: tagId })) }
          : undefined,
      },
    });
    return json({ item }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
