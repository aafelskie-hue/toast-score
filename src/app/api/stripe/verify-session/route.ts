import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { setMemberCookie } from "@/lib/cookies";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const stripe = getStripe();

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
  }

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  if (!customerId) {
    return NextResponse.json({ error: "No customer on session" }, { status: 400 });
  }

  await setMemberCookie(customerId);

  return NextResponse.json({ active: true, customerId });
}
