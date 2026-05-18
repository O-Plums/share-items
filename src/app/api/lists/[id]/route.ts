import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, requireVisitor } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const visitorId = requireVisitor(req);
    const { id } = await params;
    const list = await prisma.list.findUnique({
      where: { id },
      include: {
        items: { orderBy: { sortOrder: "asc" }, include: { match: true, _count: { select: { votes: true } } } },
      },
    });
    if (!list) throw new ApiError("Liste introuvable", 404);
    if (list.creatorVisitorId !== visitorId) throw new ApiError("Accès refusé", 403);
    return json({ list });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const visitorId = requireVisitor(req);
    const { id } = await params;
    const body = (await req.json()) as { title?: string };
    const list = await prisma.list.findUnique({ where: { id } });
    if (!list) throw new ApiError("Liste introuvable", 404);
    if (list.creatorVisitorId !== visitorId) throw new ApiError("Accès refusé", 403);

    const title = body.title?.trim();
    if (!title || title.length < 1 || title.length > 80) {
      throw new ApiError("Titre invalide", 400);
    }
    const updated = await prisma.list.update({ where: { id }, data: { title } });
    return json({ list: updated });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const visitorId = requireVisitor(req);
    const { id } = await params;
    const list = await prisma.list.findUnique({ where: { id } });
    if (!list) throw new ApiError("Liste introuvable", 404);
    if (list.creatorVisitorId !== visitorId) throw new ApiError("Accès refusé", 403);
    await prisma.list.delete({ where: { id } });
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
