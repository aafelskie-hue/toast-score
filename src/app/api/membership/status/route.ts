import { NextResponse } from "next/server";
import { getMembershipStatus } from "@/lib/membership";

export async function GET() {
  const status = await getMembershipStatus();
  return NextResponse.json({
    isMember: status.isMember,
    currentPeriodEnd: status.currentPeriodEnd,
  });
}
