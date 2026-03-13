import { NextRequest, NextResponse } from "next/server";
import { getGallery } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const sort = ["tqi", "recent"].includes(params.get("sort") || "")
    ? params.get("sort")!
    : "recent";

  let limit = parseInt(params.get("limit") || "20", 10);
  if (isNaN(limit) || limit < 1) limit = 1;
  if (limit > 50) limit = 50;

  let offset = parseInt(params.get("offset") || "0", 10);
  if (isNaN(offset) || offset < 0) offset = 0;

  const { toasts, total } = await getGallery(sort, limit, offset);

  return NextResponse.json({ toasts, total, limit, offset });
}
