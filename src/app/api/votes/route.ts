import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, requireVisitor } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { isValidVoteValue } from "@/lib/taxonomies";

export async function POST(req: NextRequest) {
  try {
    const visitorId = requireVisitor(req);
    const body = (await req.json()) as {
      itemId?: string;
      displayName?: string;
      value?: string;
    };

    const itemId = body.itemId?.trim();
    const displayName = body.displayName?.trim();
    const value = body.value?.trim();

    if (!itemId) throw new ApiError("itemId manquant", 400);
    if (!displayName || displayName.length < 1 || displayName.length > 30) {
      throw new ApiError("Prénom invalide", 400);
    }
    if (!value || !isValidVoteValue(value)) throw new ApiError("Valeur de vote invalide", 400);

    const item = await prisma.item.findUnique({ where: { id: itemId }, select: { id: true } });
    if (!item) throw new ApiError("Objet introuvable", 404);

    const vote = await prisma.vote.upsert({
      where: { itemId_visitorId: { itemId, visitorId } },
      create: { itemId, visitorId, displayName, value },
      update: { displayName, value },
    });

    // R6: si vote → NO, supprimer le match du même visitor sur cet objet
    if (value === "NO") {
      await prisma.match.deleteMany({ where: { itemId, visitorId } });
    }

    return json({ vote });
  } catch (err) {
    return errorResponse(err);
  }
}
