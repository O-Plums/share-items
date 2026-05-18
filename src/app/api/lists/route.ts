import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, requireUser } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { generateSlug } from "@/lib/slug";
import { isValidListKind } from "@/lib/list-kinds";

export async function GET(_req: NextRequest) {
  try {
    const user = await requireUser();
    const lists = await prisma.list.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { items: true } },
        items: { select: { id: true, imageUrl: true }, take: 1, orderBy: { sortOrder: "asc" } },
      },
    });
    return json({ lists });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = (await req.json()) as { title?: string; kind?: string };
    const title = body.title?.trim();
    if (!title || title.length < 1 || title.length > 80) {
      throw new ApiError("Titre invalide (1–80 caractères)", 400);
    }
    const kind = body.kind && isValidListKind(body.kind) ? body.kind : "custom";

    let slug = generateSlug();
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.list.findUnique({ where: { slug } });
      if (!exists) break;
      slug = generateSlug();
    }

    const list = await prisma.list.create({
      data: { title, slug, kind, userId: user.id },
    });
    return json({ list }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
