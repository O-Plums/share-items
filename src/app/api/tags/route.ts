import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, requireUser } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";

const MAX_TAGS_PER_USER = 30;
const MAX_LABEL_LEN = 24;

export async function GET() {
  try {
    const user = await requireUser();
    const tags = await prisma.userTag.findMany({
      where: { userId: user.id },
      orderBy: { label: "asc" },
      select: { id: true, label: true },
    });
    return json({ tags });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = (await req.json()) as { label?: string };
    const label = body.label?.trim();
    if (!label || label.length < 1 || label.length > MAX_LABEL_LEN) {
      throw new ApiError(`Tag invalide (1–${MAX_LABEL_LEN} caractères)`, 400);
    }

    const existing = await prisma.userTag.findUnique({
      where: { userId_label: { userId: user.id, label } },
    });
    if (existing) {
      return json({ tag: { id: existing.id, label: existing.label } });
    }

    const count = await prisma.userTag.count({ where: { userId: user.id } });
    if (count >= MAX_TAGS_PER_USER) {
      throw new ApiError(`Trop de tags (max ${MAX_TAGS_PER_USER})`, 400);
    }

    const tag = await prisma.userTag.create({
      data: { userId: user.id, label },
      select: { id: true, label: true },
    });
    return json({ tag }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
