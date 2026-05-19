import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const VISITOR_HEADER = "x-visitor-id";

export function getVisitorId(req: NextRequest): string | null {
  const fromHeader = req.headers.get(VISITOR_HEADER);
  if (fromHeader && fromHeader.length > 0) return fromHeader;
  return null;
}

export function requireVisitor(req: NextRequest): string {
  const v = getVisitorId(req);
  if (!v) throw new ApiError("Missing visitor id", 401);
  return v;
}

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

/**
 * JWT survives a DB reset; the cookie can outlive User/Account rows.
 * Never create a User here — that leaves an email in DB with no OAuth Account
 * and the next Google sign-in fails with OAuthAccountNotLinked.
 */
async function ensureDbUser(sessionUser: SessionUser): Promise<SessionUser> {
  const existing = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: { accounts: { select: { id: true }, take: 1 } },
  });
  if (existing) {
    if (existing.accounts.length === 0) {
      throw new ApiError("Session invalide. Déconnecte-toi puis reconnecte-toi.", 401);
    }
    return {
      id: existing.id,
      name: existing.name,
      email: existing.email,
      image: existing.image,
    };
  }

  throw new ApiError("Session expirée. Déconnecte-toi puis reconnecte-toi.", 401);
}

export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError("Non connecté", 401);
  }
  return ensureDbUser(session.user as SessionUser);
}

export async function getUser() {
  const session = await auth();
  return session?.user ?? null;
}

export class ApiError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message);
  }
}
