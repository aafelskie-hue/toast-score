import { NextRequest, NextResponse } from "next/server";
import { getToastById } from "@/lib/queries";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Invalid toast ID" }, { status: 400 });
  }

  const toast = await getToastById(id);

  if (!toast) {
    return NextResponse.json({ error: "Toast not found" }, { status: 404 });
  }

  return NextResponse.json(toast);
}
