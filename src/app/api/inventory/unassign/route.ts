import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, requireUser } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = (await req.json()) as { itemIds?: string[] };
    const itemIds = Array.isArray(body.itemIds) ? body.itemIds.filter(Boolean) : [];
    if (itemIds.length === 0) throw new ApiError("Aucun objet sélectionné", 400);

    const items = await prisma.item.findMany({
      where: { id: { in: itemIds }, userId: user.id },
      select: { id: true },
    });
    if (items.length !== itemIds.length) {
      throw new ApiError("Objet introuvable ou non autorisé", 403);
    }

    const ids = items.map((i) => i.id);
    await Promise.all([
      prisma.vote.deleteMany({ where: { itemId: { in: ids } } }),
      prisma.match.deleteMany({ where: { itemId: { in: ids } } }),
    ]);
    await prisma.item.updateMany({
      where: { id: { in: ids } },
      data: { listId: null },
    });

    return json({ ok: true, count: ids.length });
  } catch (err) {
    return errorResponse(err);
  }
}
