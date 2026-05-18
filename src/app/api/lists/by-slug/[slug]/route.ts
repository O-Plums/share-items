import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { slug } = await params;
    const list = await prisma.list.findUnique({
      where: { slug },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          include: {
            tags: { include: { userTag: { select: { id: true, label: true } } } },
          },
        },
      },
    });
    if (!list) throw new ApiError("Liste introuvable", 404);
    return json({
      list: { id: list.id, slug: list.slug, title: list.title, kind: list.kind },
      items: list.items.map((it) => ({
        id: it.id,
        imageUrl: it.imageUrl,
        label: it.label,
        room: it.room,
        category: it.category,
        sortOrder: it.sortOrder,
        tags: it.tags.map((t) => ({ id: t.userTag.id, label: t.userTag.label })),
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
