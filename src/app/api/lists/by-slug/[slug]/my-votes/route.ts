import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, requireVisitor } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const visitorId = requireVisitor(req);
    const { slug } = await params;
    const list = await prisma.list.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!list) throw new ApiError("Liste introuvable", 404);

    const votes = await prisma.vote.findMany({
      where: { visitorId, item: { listId: list.id } },
      include: { item: { select: { id: true, imageUrl: true, label: true, room: true, category: true, sortOrder: true } } },
      orderBy: { updatedAt: "desc" },
    });

    return json({
      votes: votes.map((v) => ({
        itemId: v.itemId,
        value: v.value,
        updatedAt: v.updatedAt,
        item: v.item,
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const visitorId = requireVisitor(req);
    const { slug } = await params;
    const list = await prisma.list.findUnique({ where: { slug }, select: { id: true } });
    if (!list) throw new ApiError("Liste introuvable", 404);

    const items = await prisma.item.findMany({
      where: { listId: list.id },
      select: { id: true },
    });
    const itemIds = items.map((i) => i.id);

    await prisma.$transaction([
      prisma.match.deleteMany({ where: { visitorId, itemId: { in: itemIds } } }),
      prisma.vote.deleteMany({ where: { visitorId, itemId: { in: itemIds } } }),
    ]);

    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
