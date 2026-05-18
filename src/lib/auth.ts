import { NextRequest } from "next/server";

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

export class ApiError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message);
  }
}
