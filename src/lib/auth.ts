import { NextRequest } from "next/server";
import { auth } from "@/auth";

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

export async function requireUser(): Promise<{ id: string; name?: string | null; email?: string | null; image?: string | null }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError("Non connecté", 401);
  }
  return session.user;
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
