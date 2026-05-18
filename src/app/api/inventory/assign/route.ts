import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, requireUser } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = (await req.json()) as { itemIds?: string[]; listId?: string };
    const itemIds = Array.isArray(body.itemIds) ? body.itemIds.filter(Boolean) : [];
    const listId = body.listId?.trim();
    if (itemIds.length === 0) throw new ApiError("Aucun objet sélectionné", 400);
    if (!listId) throw new ApiError("listId manquant", 400);

    const list = await prisma.list.findUnique({ where: { id: listId } });
    if (!list || list.userId !== user.id) throw new ApiError("Liste introuvable", 404);

    const items = await prisma.item.findMany({
      where: { id: { in: itemIds }, userId: user.id },
      select: { id: true, listId: true },
    });
    if (items.length !== itemIds.length) {
      throw new ApiError("Objet introuvable ou non autorisé", 403);
    }

    const last = await prisma.item.findFirst({
      where: { listId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    let nextOrder = (last?.sortOrder ?? -1) + 1;

    const movedFromOtherList = items.filter((i) => i.listId && i.listId !== listId).map((i) => i.id);

    const ops: Promise<unknown>[] = [];
    if (movedFromOtherList.length > 0) {
      ops.push(prisma.vote.deleteMany({ where: { itemId: { in: movedFromOtherList } } }));
      ops.push(prisma.match.deleteMany({ where: { itemId: { in: movedFromOtherList } } }));
    }
    await Promise.all(ops);

    for (const it of items) {
      await prisma.item.update({
        where: { id: it.id },
        data: { listId, sortOrder: nextOrder++ },
      });
    }

    return json({ ok: true, count: items.length });
  } catch (err) {
    return errorResponse(err);
  }
}
