import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, requireVisitor } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";

type Ctx = { params: Promise<{ itemId: string }> };

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const creatorVisitorId = requireVisitor(req);
    const { itemId } = await params;
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { list: true },
    });
    if (!item) throw new ApiError("Objet introuvable", 404);
    if (item.list.creatorVisitorId !== creatorVisitorId) throw new ApiError("Accès refusé", 403);

    await prisma.match.deleteMany({ where: { itemId } });
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
