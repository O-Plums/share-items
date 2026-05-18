import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, requireUser } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { isValidListKind } from "@/lib/list-kinds";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const list = await prisma.list.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          include: {
            match: true,
            tags: { include: { userTag: { select: { id: true, label: true } } } },
            _count: { select: { votes: true } },
          },
        },
      },
    });
    if (!list) throw new ApiError("Liste introuvable", 404);
    if (list.userId !== user.id) throw new ApiError("Accès refusé", 403);
    return json({
      list: {
        ...list,
        items: list.items.map((it) => ({
          ...it,
          tags: it.tags.map((t) => ({ id: t.userTag.id, label: t.userTag.label })),
        })),
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = (await req.json()) as { title?: string; kind?: string };
    const list = await prisma.list.findUnique({ where: { id } });
    if (!list) throw new ApiError("Liste introuvable", 404);
    if (list.userId !== user.id) throw new ApiError("Accès refusé", 403);

    const data: Record<string, unknown> = {};
    if (typeof body.title === "string") {
      const title = body.title.trim();
      if (title.length < 1 || title.length > 80) throw new ApiError("Titre invalide", 400);
      data.title = title;
    }
    if (typeof body.kind === "string") {
      if (!isValidListKind(body.kind)) throw new ApiError("Kind invalide", 400);
      data.kind = body.kind;
    }
    const updated = await prisma.list.update({ where: { id }, data });
    return json({ list: updated });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const list = await prisma.list.findUnique({ where: { id } });
    if (!list) throw new ApiError("Liste introuvable", 404);
    if (list.userId !== user.id) throw new ApiError("Accès refusé", 403);
    await prisma.list.delete({ where: { id } });
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
