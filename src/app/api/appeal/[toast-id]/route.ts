import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getSupabaseServer } from "@/lib/supabase-server";
import { getStripe } from "@/lib/stripe";
import { getMembershipStatus } from "@/lib/membership";
import { getToastById, getAppealByToastId, getMemberFreeAppealThisMonth } from "@/lib/queries";
import { runJudgePanel } from "@/lib/evaluate";
import { FREE_JUDGE_IDS, type JudgeId } from "@/lib/judges";

interface PageProps {
  params: Promise<{ "toast-id": string }>;
}

export async function POST(request: NextRequest, { params }: PageProps) {
  const { "toast-id": toastId } = await params;

  // 1. Validate toast exists
  const toast = await getToastById(toastId);
  if (!toast) {
    return NextResponse.json({ error: "Toast not found" }, { status: 404 });
  }

  // 2. Check no existing appeal
  const existingAppeal = await getAppealByToastId(toastId);
  if (existingAppeal) {
    return NextResponse.json(
      { error: "Appeal already filed. The Bureau's decision is final." },
      { status: 409 }
    );
  }

  // 3. Determine payment
  let body: { session_id?: string; free?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    // No body is OK for paid appeals where session_id is in the body
  }

  let stripeSessionId: string | null = null;
  const membership = await getMembershipStatus();

  if (body.free && membership.isMember && membership.customerId) {
    // Check free appeal eligibility
    const usedFree = await getMemberFreeAppealThisMonth(membership.customerId);
    if (usedFree) {
      return NextResponse.json(
        { error: "Free monthly appeal already used. Pay $0.99 for an additional appeal." },
        { status: 402 }
      );
    }

    // Record free appeal usage
    const supabase = getSupabaseServer();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("member_appeals") as any).insert({
      customer_id: membership.customerId,
      toast_id: toastId,
      month_start: monthStart,
      was_free: true,
    });
  } else if (body.session_id) {
    // Verify Stripe payment
    const stripe = getStripe();
    try {
      const session = await stripe.checkout.sessions.retrieve(body.session_id);
      if (session.payment_status !== "paid") {
        return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
      }
      if (session.metadata?.toast_id !== toastId) {
        return NextResponse.json({ error: "Session does not match toast" }, { status: 400 });
      }
      stripeSessionId = body.session_id;
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }
  } else {
    return NextResponse.json(
      { error: "Payment required" },
      { status: 402 }
    );
  }

  // 4. Get the original image and prepare for judges
  const imageResponse = await fetch(toast.image_url);
  if (!imageResponse.ok) {
    return NextResponse.json({ error: "Failed to fetch original image" }, { status: 500 });
  }
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
  const resizedBuffer = await sharp(imageBuffer)
    .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
  const base64 = resizedBuffer.toString("base64");

  // 5. Determine judges from original toast's verdicts
  let judgeIds: JudgeId[];
  if (toast.verdicts && Array.isArray(toast.verdicts) && toast.verdicts.length > 0) {
    judgeIds = toast.verdicts.map((v) => v.judge_id as JudgeId);
  } else {
    judgeIds = [...FREE_JUDGE_IDS];
  }

  // 6. Run evaluation
  let result;
  try {
    result = await runJudgePanel(judgeIds, base64, "image/jpeg");
  } catch {
    return NextResponse.json(
      { error: "All judges are currently unavailable. Please toast responsibly." },
      { status: 500 }
    );
  }

  // 7. Insert appeal
  const supabase = getSupabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: insertError } = await (supabase.from("appeals") as any).insert({
    toast_id: toastId,
    stripe_session_id: stripeSessionId,
    verdicts: result.verdicts,
    official_tqi: result.officialTqi,
    official_tier: result.officialTier,
  });

  if (insertError) {
    console.error("[appeal] Insert failed:", insertError);
    return NextResponse.json({ error: "Failed to save appeal" }, { status: 500 });
  }

  return NextResponse.json({
    verdicts: result.verdicts,
    official_tqi: result.officialTqi,
    official_tier: result.officialTier,
  });
}
