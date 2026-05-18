import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, requireVisitor } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { isValidCategory, isValidRoom } from "@/lib/taxonomies";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const visitorId = requireVisitor(req);
    const { id } = await params;
    const body = (await req.json()) as {
      imageUrl?: string;
      room?: string;
      category?: string;
      label?: string | null;
    };

    const item = await prisma.item.findUnique({
      where: { id },
      include: { list: true },
    });
    if (!item) throw new ApiError("Objet introuvable", 404);
    if (item.list.creatorVisitorId !== visitorId) throw new ApiError("Accès refusé", 403);

    const data: Record<string, unknown> = {};
    if (typeof body.imageUrl === "string" && body.imageUrl.trim().length > 0) {
      data.imageUrl = body.imageUrl.trim();
    }
    if (typeof body.room === "string") {
      if (!isValidRoom(body.room)) throw new ApiError("Pièce invalide", 400);
      data.room = body.room;
    }
    if (typeof body.category === "string") {
      if (!isValidCategory(body.category)) throw new ApiError("Catégorie invalide", 400);
      data.category = body.category;
    }
    if (body.label !== undefined) {
      const label = body.label?.trim() ?? null;
      if (label && label.length > 60) throw new ApiError("Libellé trop long", 400);
      data.label = label && label.length > 0 ? label : null;
    }

    const updated = await prisma.item.update({ where: { id }, data });
    return json({ item: updated });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const visitorId = requireVisitor(req);
    const { id } = await params;
    const item = await prisma.item.findUnique({
      where: { id },
      include: { list: true },
    });
    if (!item) throw new ApiError("Objet introuvable", 404);
    if (item.list.creatorVisitorId !== visitorId) throw new ApiError("Accès refusé", 403);
    await prisma.item.delete({ where: { id } });
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
