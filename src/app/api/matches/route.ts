import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, requireUser } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = (await req.json()) as { itemId?: string; visitorId?: string };
    const itemId = body.itemId?.trim();
    const targetVisitorId = body.visitorId?.trim();
    if (!itemId) throw new ApiError("itemId manquant", 400);
    if (!targetVisitorId) throw new ApiError("visitorId manquant", 400);

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { match: true },
    });
    if (!item) throw new ApiError("Objet introuvable", 404);
    if (item.userId !== user.id) throw new ApiError("Accès refusé", 403);
    if (!item.listId) throw new ApiError("Objet pas encore dans une liste", 400);
    if (item.match) throw new ApiError("Cet objet a déjà un match", 409);

    const vote = await prisma.vote.findUnique({
      where: { itemId_visitorId: { itemId, visitorId: targetVisitorId } },
    });
    if (!vote || vote.value !== "YES") {
      throw new ApiError("Cette personne n’a pas voté Oui sur cet objet", 400);
    }

    const match = await prisma.match.create({
      data: {
        itemId,
        visitorId: targetVisitorId,
        displayName: vote.displayName,
      },
    });

    return json({ match }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
