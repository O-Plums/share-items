import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const assignedParam = searchParams.get("assigned");
    const room = searchParams.get("room") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const tag = searchParams.get("tag") ?? undefined;

    const items = await prisma.item.findMany({
      where: {
        userId: user.id,
        ...(assignedParam === "true" ? { listId: { not: null } } : {}),
        ...(assignedParam === "false" ? { listId: null } : {}),
        ...(room ? { room } : {}),
        ...(category ? { category } : {}),
        ...(tag ? { tags: { some: { userTagId: tag } } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        list: { select: { id: true, title: true, slug: true, kind: true } },
        tags: { include: { userTag: { select: { id: true, label: true } } } },
      },
    });

    return json({
      items: items.map((item) => ({
        id: item.id,
        listId: item.listId,
        listTitle: item.list?.title ?? null,
        listKind: item.list?.kind ?? null,
        imageUrl: item.imageUrl,
        label: item.label,
        room: item.room,
        category: item.category,
        createdAt: item.createdAt,
        tags: item.tags.map((t) => ({ id: t.userTag.id, label: t.userTag.label })),
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
