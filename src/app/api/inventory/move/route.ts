import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, requireUser } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = (await req.json()) as { itemId?: string; listId?: string | null };
    const itemId = body.itemId?.trim();
    const listId = body.listId === null ? null : body.listId?.trim();
    if (!itemId) throw new ApiError("itemId manquant", 400);

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: { id: true, listId: true, userId: true },
    });
    if (!item || item.userId !== user.id) throw new ApiError("Objet introuvable", 404);

    if (listId) {
      const list = await prisma.list.findUnique({ where: { id: listId } });
      if (!list || list.userId !== user.id) throw new ApiError("Liste introuvable", 404);
    }

    if (item.listId !== (listId ?? null)) {
      await Promise.all([
        prisma.vote.deleteMany({ where: { itemId } }),
        prisma.match.deleteMany({ where: { itemId } }),
      ]);
    }

    let sortOrder = 0;
    if (listId) {
      const last = await prisma.item.findFirst({
        where: { listId },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
      sortOrder = (last?.sortOrder ?? -1) + 1;
    }

    const updated = await prisma.item.update({
      where: { id: itemId },
      data: { listId: listId ?? null, sortOrder },
    });

    return json({ item: updated });
  } catch (err) {
    return errorResponse(err);
  }
}
