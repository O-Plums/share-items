import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, requireVisitor } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const visitorId = requireVisitor(req);
    const { slug } = await params;
    const list = await prisma.list.findUnique({ where: { slug }, select: { id: true } });
    if (!list) throw new ApiError("Liste introuvable", 404);

    const matches = await prisma.match.findMany({
      where: { visitorId, item: { listId: list.id } },
      include: { item: { select: { id: true, imageUrl: true, label: true, room: true, category: true } } },
      orderBy: { createdAt: "desc" },
    });

    return json({
      matches: matches.map((m) => ({
        itemId: m.itemId,
        createdAt: m.createdAt,
        item: m.item,
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
