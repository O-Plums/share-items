import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";

type Body = Partial<{
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  referrer: string | null;
  landingPath: string | null;
  gclid: string | null;
  fbclid: string | null;
}>;

function clean(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 200);
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = (await req.json().catch(() => ({}))) as Body;

    const data = {
      utmSource: clean(body.utmSource),
      utmMedium: clean(body.utmMedium),
      utmCampaign: clean(body.utmCampaign),
      utmContent: clean(body.utmContent),
      utmTerm: clean(body.utmTerm),
      referrer: clean(body.referrer),
      landingPath: clean(body.landingPath),
      gclid: clean(body.gclid),
      fbclid: clean(body.fbclid),
    };

    // First-touch wins: insert only if no row exists for the user.
    const existing = await prisma.signupAttribution.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (existing) return json({ ok: true, created: false });

    await prisma.signupAttribution.create({
      data: { ...data, userId: user.id },
    });
    return json({ ok: true, created: true }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
