import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, requireUser } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const room = searchParams.get("room") ?? undefined;
    const category = searchParams.get("category") ?? undefined;

    const list = await prisma.list.findUnique({ where: { id } });
    if (!list) throw new ApiError("Liste introuvable", 404);
    if (list.userId !== user.id) throw new ApiError("Accès refusé", 403);

    const items = await prisma.item.findMany({
      where: {
        listId: id,
        ...(room ? { room } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { sortOrder: "asc" },
      include: {
        votes: { orderBy: { updatedAt: "desc" } },
        match: true,
        tags: { include: { userTag: { select: { id: true, label: true } } } },
      },
    });

    const results = items.map((item) => {
      const yes = item.votes.filter((v) => v.value === "YES");
      const no = item.votes.filter((v) => v.value === "NO");
      return {
        id: item.id,
        imageUrl: item.imageUrl,
        label: item.label,
        room: item.room,
        category: item.category,
        sortOrder: item.sortOrder,
        tags: item.tags.map((t) => ({ id: t.userTag.id, label: t.userTag.label })),
        votesYes: yes.map((v) => ({ visitorId: v.visitorId, displayName: v.displayName })),
        votesNo: no.map((v) => ({ visitorId: v.visitorId, displayName: v.displayName })),
        match: item.match
          ? { visitorId: item.match.visitorId, displayName: item.match.displayName }
          : null,
      };
    });

    return json({
      list: { id: list.id, slug: list.slug, title: list.title, kind: list.kind },
      items: results,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
