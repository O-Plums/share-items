import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, requireUser } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { isValidCategory, isValidRoom } from "@/lib/taxonomies";

const MAX_TAGS_PER_ITEM = 3;

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        list: true,
        tags: { include: { userTag: { select: { id: true, label: true } } } },
      },
    });
    if (!item || item.userId !== user.id) throw new ApiError("Objet introuvable", 404);
    return json({
      item: {
        id: item.id,
        listId: item.listId,
        imageUrl: item.imageUrl,
        label: item.label,
        room: item.room,
        category: item.category,
        tags: item.tags.map((t) => ({ id: t.userTag.id, label: t.userTag.label })),
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
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

    const item = await prisma.item.findUnique({
      where: { id },
      include: { list: true },
    });
    if (!item) throw new ApiError("Objet introuvable", 404);
    if (item.userId !== user.id) throw new ApiError("Accès refusé", 403);

    const data: Record<string, unknown> = {};
    if (typeof body.imageUrl === "string" && body.imageUrl.trim().length > 0) {
      data.imageUrl = body.imageUrl.trim();
    }
    if (typeof body.room === "string") {
      if (!isValidRoom(body.room)) throw new ApiError("Pièce invalide", 400);
      data.room = body.room;
    }
    if (typeof body.category === "string") {
      if (!isValidCategory(body.category)) throw new ApiError("Catégorie invalide", 400);
      data.category = body.category;
    }
    if (body.label !== undefined) {
      const label = body.label?.trim() ?? null;
      if (label && label.length > 60) throw new ApiError("Libellé trop long", 400);
      data.label = label && label.length > 0 ? label : null;
    }

    const tagIds = Array.isArray(body.tagIds) ? body.tagIds.slice(0, MAX_TAGS_PER_ITEM) : undefined;
    if (tagIds !== undefined) {
      if (tagIds.length > 0) {
        const owned = await prisma.userTag.findMany({
          where: { userId: user.id, id: { in: tagIds } },
          select: { id: true },
        });
        if (owned.length !== tagIds.length) {
          throw new ApiError("Tag inconnu", 400);
        }
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const it = await tx.item.update({ where: { id }, data });
      if (tagIds !== undefined) {
        await tx.itemTag.deleteMany({ where: { itemId: id } });
        if (tagIds.length > 0) {
          await tx.itemTag.createMany({
            data: tagIds.map((tagId) => ({ itemId: id, userTagId: tagId })),
          });
        }
      }
      return it;
    });

    return json({ item: updated });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) throw new ApiError("Objet introuvable", 404);
    if (item.userId !== user.id) throw new ApiError("Accès refusé", 403);
    await prisma.item.delete({ where: { id } });
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
