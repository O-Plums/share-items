import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, requireUser } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";

const MAX_ROOMS_PER_USER = 20;
const MAX_LABEL_LEN = 24;
const MAX_EMOJI_LEN = 8;

export async function GET() {
  try {
    const user = await requireUser();
    const rooms = await prisma.userRoom.findMany({
      where: { userId: user.id },
      orderBy: { label: "asc" },
      select: { id: true, label: true, emoji: true },
    });
    return json({ rooms });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = (await req.json()) as { label?: string; emoji?: string };
    const label = body.label?.trim();
    if (!label || label.length < 1 || label.length > MAX_LABEL_LEN) {
      throw new ApiError(`Nom invalide (1–${MAX_LABEL_LEN} caractères)`, 400);
    }
    const emojiRaw = body.emoji?.trim() || "🏠";
    const emoji = emojiRaw.slice(0, MAX_EMOJI_LEN);

    const existing = await prisma.userRoom.findUnique({
      where: { userId_label: { userId: user.id, label } },
    });
    if (existing) {
      return json({ room: { id: existing.id, label: existing.label, emoji: existing.emoji } });
    }

    const count = await prisma.userRoom.count({ where: { userId: user.id } });
    if (count >= MAX_ROOMS_PER_USER) {
      throw new ApiError(`Trop de pièces (max ${MAX_ROOMS_PER_USER})`, 400);
    }

    const room = await prisma.userRoom.create({
      data: { userId: user.id, label, emoji },
      select: { id: true, label: true, emoji: true },
    });
    return json({ room }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
