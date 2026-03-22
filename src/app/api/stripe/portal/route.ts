import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getMemberCustomerId } from "@/lib/cookies";

export async function POST(request: NextRequest) {
  const customerId = await getMemberCustomerId();
  if (!customerId) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";
  const stripe = getStripe();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/membership`,
  });

  return NextResponse.json({ url: session.url });
}
