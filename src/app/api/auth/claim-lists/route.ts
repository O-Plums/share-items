import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { visitorId?: string };
  const visitorId = body.visitorId?.trim();
  if (!visitorId || visitorId.length < 1 || visitorId.length > 100) {
    return NextResponse.json({ error: "visitorId invalide" }, { status: 400 });
  }

  const updated = await prisma.list.updateMany({
    where: {
      creatorVisitorId: visitorId,
      userId: null,
    },
    data: { userId: session.user.id },
  });

  return NextResponse.json({ claimed: updated.count });
}
