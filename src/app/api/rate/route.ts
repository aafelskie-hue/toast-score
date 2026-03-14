import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { checkRateLimit } from "@/lib/rate-limiter";
import { getSupabaseServer } from "@/lib/supabase-server";
import { callJudge } from "@/lib/anthropic";
import { calculateTqi, deriveTier } from "@/lib/tqi";
import { JudgeName, SubMetrics } from "@/lib/types";

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

  // 5. Prepare image buffer
  const arrayBuffer = await imageFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = imageFile.type === "image/png" ? "png" : "jpg";

  // 6. Strip metadata, resize, and compress for storage
  const cleanBuffer = ext === "png"
    ? await sharp(buffer)
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .png()
        .toBuffer()
    : await sharp(buffer)
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

  // 7. Generate ID and upload to Supabase Storage
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

  // 8. Get public URL
  const { data: urlData } = supabase.storage
    .from("toast-images")
    .getPublicUrl(`toasts/${toastId}.${ext}`);
  const imageUrl = urlData.publicUrl;

  // 9. Resize image for Anthropic API
  const resizedBuffer = await sharp(cleanBuffer)
    .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
  const base64 = resizedBuffer.toString("base64");

  // 10. Call all three judges in parallel
  const judges: JudgeName[] = ["jp", "nana", "chad"];
  const results = await Promise.allSettled(
    judges.map((j) => callJudge(j, base64, "image/jpeg"))
  );

  // 11. Process results
  const judgeResults: Record<string, JudgeResultData | null> = {};
  const successfulTqis: number[] = [];

  for (let i = 0; i < judges.length; i++) {
    const judgeName = judges[i];
    const result = results[i];

    if (result.status === "fulfilled") {
      const tqi = calculateTqi(result.value.sub_metrics);
      const tier = deriveTier(tqi);
      judgeResults[judgeName] = {
        verdict: result.value.verdict,
        tqi,
        tier,
        sub_metrics: result.value.sub_metrics,
      };
      successfulTqis.push(tqi);
    } else {
      console.error(`[rate] ${judgeName} judge failed:`, result.reason);
      judgeResults[judgeName] = null;
    }
  }

  // All judges failed
  if (successfulTqis.length === 0) {
    return NextResponse.json(
      { error: "All judges are currently unavailable. Please toast responsibly." },
      { status: 500 }
    );
  }

  // 12. Official scores = average of successful judges, rounded to 2 decimal places
  const sum = successfulTqis.reduce((a, b) => a + b, 0);
  const officialTqi = Math.round((sum / successfulTqis.length) * 100) / 100;
  const officialTier = deriveTier(officialTqi);

  // 13. Build DB row
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
  };

  const { error: insertError } = await supabase.from("toasts").insert(row);

  if (insertError) {
    console.error("[rate] Supabase insert failed:", insertError);
    return NextResponse.json({ error: "Failed to save toast rating" }, { status: 500 });
  }

  // 14. Return full result
  return NextResponse.json({
    id: toastId,
    image_url: imageUrl,
    nickname,
    official_tqi: officialTqi,
    official_tier: officialTier,
    judges: {
      jp: judgeResults.jp,
      nana: judgeResults.nana,
      chad: judgeResults.chad,
    },
  });
}
