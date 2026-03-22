import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { checkRateLimit } from "@/lib/rate-limiter";
import { getSupabaseServer } from "@/lib/supabase-server";
import { callJudge } from "@/lib/anthropic";
import { calculateTqi, deriveTier } from "@/lib/tqi";
import { JUDGES, FREE_JUDGE_IDS, MEMBER_JUDGE_IDS, ALL_JUDGE_IDS, type JudgeId } from "@/lib/judges";
import { getMembershipStatus } from "@/lib/membership";
import { SubMetrics } from "@/lib/types";

const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

interface JudgeResultData {
  verdict: string;
  tqi: number;
  tier: string;
  sub_metrics: SubMetrics;
}

export async function POST(request: NextRequest) {
  // 1. Rate limit by IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: rateCheck.message }, { status: 429 });
  }

  // 2. Parse form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (err) {
    console.error("[rate] Failed to parse form data:", err);
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const imageFile = formData.get("image") as File | null;
  const nicknameRaw = formData.get("nickname") as string | null;
  const judgesRaw = formData.get("judges") as string | null;

  // 3. Validate image
  if (!imageFile) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(imageFile.type)) {
    return NextResponse.json({ error: "Only JPEG and PNG images are accepted" }, { status: 400 });
  }
  if (imageFile.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
  }

  // 4. Sanitize nickname
  const nickname = nicknameRaw?.trim().slice(0, 20) || "Anonymous Toaster";

  // 5. Parse and validate judge selection
  let selectedJudges: JudgeId[];
  if (judgesRaw) {
    const parsed = judgesRaw.split(",").map((s) => s.trim()) as JudgeId[];
    // Validate all IDs are known
    const allValid = parsed.every((id) => ALL_JUDGE_IDS.includes(id));
    if (!allValid || parsed.length !== 3) {
      return NextResponse.json(
        { error: "Select exactly 3 valid judges" },
        { status: 400 }
      );
    }
    // Check for duplicates
    if (new Set(parsed).size !== 3) {
      return NextResponse.json(
        { error: "Duplicate judges are not allowed" },
        { status: 400 }
      );
    }
    selectedJudges = parsed;
  } else {
    selectedJudges = [...FREE_JUDGE_IDS];
  }

  // 6. If any member-only judges selected, verify membership
  const hasMemberJudges = selectedJudges.some((id) => MEMBER_JUDGE_IDS.includes(id));
  if (hasMemberJudges) {
    const membership = await getMembershipStatus();
    if (!membership.isMember) {
      return NextResponse.json(
        { error: "Bureau Membership required for exclusive judges" },
        { status: 403 }
      );
    }
  }

  // 7. Prepare image buffer
  const arrayBuffer = await imageFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = imageFile.type === "image/png" ? "png" : "jpg";

  // 8. Strip metadata, resize, and compress for storage
  const cleanBuffer = ext === "png"
    ? await sharp(buffer)
        .rotate()
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .png()
        .toBuffer()
    : await sharp(buffer)
        .rotate()
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

  // 9. Generate ID and upload to Supabase Storage
  const toastId = randomUUID();
  const supabase = getSupabaseServer();

  const { error: uploadError } = await supabase.storage
    .from("toast-images")
    .upload(`toasts/${toastId}.${ext}`, cleanBuffer, {
      contentType: imageFile.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("[rate] Supabase storage upload failed:", uploadError);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }

  // 10. Get public URL
  const { data: urlData } = supabase.storage
    .from("toast-images")
    .getPublicUrl(`toasts/${toastId}.${ext}`);
  const imageUrl = urlData.publicUrl;

  // 11. Resize image for Anthropic API
  const resizedBuffer = await sharp(cleanBuffer)
    .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
  const base64 = resizedBuffer.toString("base64");

  // 12. Call selected judges in parallel
  const results = await Promise.allSettled(
    selectedJudges.map((j) => callJudge(j, base64, "image/jpeg"))
  );

  // 13. Process results
  const judgeResults: Record<string, JudgeResultData | null> = {};
  const successfulTqis: number[] = [];
  const verdicts: Array<{
    judge_id: string;
    judge_name: string;
    verdict: string;
    tqi: number;
    tier: string;
    metrics: SubMetrics;
  }> = [];

  for (let i = 0; i < selectedJudges.length; i++) {
    const judgeId = selectedJudges[i];
    const result = results[i];

    if (result.status === "fulfilled") {
      const tqi = calculateTqi(result.value.sub_metrics);
      const tier = deriveTier(tqi);
      judgeResults[judgeId] = {
        verdict: result.value.verdict,
        tqi,
        tier,
        sub_metrics: result.value.sub_metrics,
      };
      successfulTqis.push(tqi);
      verdicts.push({
        judge_id: judgeId,
        judge_name: JUDGES[judgeId].displayName,
        verdict: result.value.verdict,
        tqi,
        tier,
        metrics: result.value.sub_metrics,
      });
    } else {
      console.error(`[rate] ${judgeId} judge failed:`, result.reason);
      judgeResults[judgeId] = null;
    }
  }

  // All judges failed
  if (successfulTqis.length === 0) {
    return NextResponse.json(
      { error: "All judges are currently unavailable. Please toast responsibly." },
      { status: 500 }
    );
  }

  // 14. Official scores = average of successful judges, rounded to 2 decimal places
  const sum = successfulTqis.reduce((a, b) => a + b, 0);
  const officialTqi = Math.round((sum / successfulTqis.length) * 100) / 100;
  const officialTier = deriveTier(officialTqi);

  // 15. Build DB row
  const jp = judgeResults.jp;
  const nana = judgeResults.nana;
  const chad = judgeResults.chad;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: any = {
    id: toastId,
    image_url: imageUrl,
    nickname,
    official_tqi: officialTqi,
    official_tier: officialTier,
    // Flat columns for backwards compatibility (core 3 only)
    jp_verdict: jp?.verdict ?? null,
    jp_tqi: jp?.tqi ?? null,
    jp_tier: jp?.tier ?? null,
    jp_metrics: jp?.sub_metrics ?? null,
    nana_verdict: nana?.verdict ?? null,
    nana_tqi: nana?.tqi ?? null,
    nana_tier: nana?.tier ?? null,
    nana_metrics: nana?.sub_metrics ?? null,
    chad_verdict: chad?.verdict ?? null,
    chad_tqi: chad?.tqi ?? null,
    chad_tier: chad?.tier ?? null,
    chad_metrics: chad?.sub_metrics ?? null,
    // New JSONB column with all judges
    verdicts,
  };

  const { error: insertError } = await supabase.from("toasts").insert(row);

  if (insertError) {
    console.error("[rate] Supabase insert failed:", insertError);
    return NextResponse.json({ error: "Failed to save toast rating" }, { status: 500 });
  }

  // 16. Return full result
  return NextResponse.json({
    id: toastId,
    image_url: imageUrl,
    nickname,
    official_tqi: officialTqi,
    official_tier: officialTier,
    judges: judgeResults,
    verdicts,
  });
}
