import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const period = ["today", "week", "alltime"].includes(params.get("period") || "")
    ? params.get("period")!
    : "today";

  let limit = parseInt(params.get("limit") || "20", 10);
  if (isNaN(limit) || limit < 1) limit = 1;
  if (limit > 50) limit = 50;

  let offset = parseInt(params.get("offset") || "0", 10);
  if (isNaN(offset) || offset < 0) offset = 0;

  const { toasts, total } = await getLeaderboard(period, limit, offset);

  return NextResponse.json({ toasts, total, limit, offset });
}
