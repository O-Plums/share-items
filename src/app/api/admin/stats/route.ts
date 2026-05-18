import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { fetchAdminStats, parseAdminDateRange } from "@/lib/admin-stats";
import { errorResponse, json } from "@/lib/http";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const range = parseAdminDateRange(
      searchParams.get("preset"),
      searchParams.get("from"),
      searchParams.get("to"),
    );
    const stats = await fetchAdminStats(range);
    return json(stats);
  } catch (err) {
    return errorResponse(err);
  }
}
