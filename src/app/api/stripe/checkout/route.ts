import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getMemberCustomerId, setMemberCookie } from "@/lib/cookies";

type CheckoutType = "membership" | "appeal" | "certificate";

interface CheckoutBody {
  type: CheckoutType;
  toast_id?: string;
}

export async function POST(request: NextRequest) {
  let body: CheckoutBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { type, toast_id } = body;

  if (!type || !["membership", "appeal", "certificate"].includes(type)) {
    return NextResponse.json({ error: "Invalid checkout type" }, { status: 400 });
  }

  if ((type === "appeal" || type === "certificate") && !toast_id) {
    return NextResponse.json(
      { error: "toast_id is required for appeal and certificate" },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";

  // Reuse existing Stripe customer if we have one
  let customerId = await getMemberCustomerId();
  if (!customerId) {
    const customer = await stripe.customers.create({});
    customerId = customer.id;
    await setMemberCookie(customerId);
  }

  // Build checkout session params per product type
  const priceId = getPriceId(type);
  if (!priceId) {
    return NextResponse.json({ error: "Price not configured" }, { status: 500 });
  }

  const mode = type === "membership" ? "subscription" : "payment";
  const { successUrl, cancelUrl } = getRedirectUrls(type, toast_id, origin);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: mode as "subscription" | "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      type,
      ...(toast_id ? { toast_id } : {}),
    },
  });

  return NextResponse.json({ url: session.url });
}

function getPriceId(type: CheckoutType): string | undefined {
  switch (type) {
    case "membership":
      return process.env.STRIPE_MEMBERSHIP_PRICE_ID;
    case "appeal":
      return process.env.STRIPE_APPEAL_PRICE_ID;
    case "certificate":
      return process.env.STRIPE_CERTIFICATE_PRICE_ID;
  }
}

function getRedirectUrls(
  type: CheckoutType,
  toastId: string | undefined,
  origin: string
): { successUrl: string; cancelUrl: string } {
  switch (type) {
    case "membership":
      return {
        successUrl: `${origin}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/membership`,
      };
    case "appeal":
      return {
        successUrl: `${origin}/toast/${toastId}?appeal_session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/toast/${toastId}`,
      };
    case "certificate":
      return {
        successUrl: `${origin}/toast/${toastId}?certificate_session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/toast/${toastId}`,
      };
  }
}
