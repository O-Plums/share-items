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
          select: { id: true, imageUrl: true, label: true, room: true, category: true, sortOrder: true },
        },
      },
    });
    if (!list) throw new ApiError("Liste introuvable", 404);
    return json({
      list: { id: list.id, slug: list.slug, title: list.title },
      items: list.items,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
