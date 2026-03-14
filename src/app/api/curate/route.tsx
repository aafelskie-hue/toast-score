import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getCurationCandidates } from "@/lib/queries";
import { ToastRecord, JudgeName } from "@/lib/types";
import { getJudgeDisplayName } from "@/components/judge-avatar";

export const runtime = "nodejs";

const TIER_COLORS: Record<string, string> = {
  Legendary: "#EFC820",
  Golden: "#B8960A",
  Respectable: "#D4537E",
  Questionable: "#888780",
  Concerning: "#B4B2A9",
  Criminal: "#111111",
};

const TIER_BG: Record<string, string> = {
  Legendary: "rgba(239, 200, 32, 0.12)",
  Golden: "rgba(184, 150, 10, 0.12)",
  Respectable: "rgba(212, 83, 126, 0.12)",
  Questionable: "rgba(136, 135, 128, 0.12)",
  Concerning: "rgba(180, 178, 169, 0.12)",
  Criminal: "rgba(17, 17, 17, 0.12)",
};

const FONT_URL =
  "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf";

const CATEGORY_LABELS: Record<string, string> = {
  best: "BEST OF THE WEEK",
  criminal: "CRIMINAL REPORT",
  judges_pick: "JUDGE'S PICK",
};

function getFeaturedJudge(toast: ToastRecord): { judge: JudgeName; verdict: string } {
  const verdicts: [JudgeName, string | null][] = [
    ["jp", toast.jp_verdict],
    ["nana", toast.nana_verdict],
    ["chad", toast.chad_verdict],
  ];
  let longest: { judge: JudgeName; verdict: string } = { judge: "jp", verdict: "" };
  for (const [judge, verdict] of verdicts) {
    if (verdict && verdict.length > longest.verdict.length) {
      longest = { judge, verdict };
    }
  }
  return longest;
}

function getFirstSentence(text: string, maxLen = 120): string {
  const match = text.match(/^[^.!?]*[.!?]/);
  const sentence = match ? match[0] : text;
  if (sentence.length <= maxLen) return sentence;
  return sentence.slice(0, maxLen - 3).trim() + "...";
}

function getJudgeInitial(judge: JudgeName): string {
  switch (judge) {
    case "jp": return "JP";
    case "nana": return "N";
    case "chad": return "C";
  }
}

function buildCaption(
  category: string,
  quote: string,
  judgeName: string,
  nickname: string
): string {
  const openings: Record<string, string> = {
    best: "This week's highest-rated toast has been acknowledged.",
    criminal: "The Bureau has concerns.",
    judges_pick: "One verdict stood above the rest.",
  };
  const opening = openings[category] || openings.best;
  return `${opening}\n\n"${quote}" -- ${judgeName}, on ${nickname}'s toast.\n\nRate yours at toastscore.com\n\n#ToastScore #toast #AIratesmyfood`;
}

async function generateImage(
  toast: ToastRecord,
  category: string,
  featuredJudge: JudgeName,
  verdictExcerpt: string,
  fontData: ArrayBuffer
): Promise<string> {
  const tierColor = TIER_COLORS[toast.official_tier] || "#111111";
  const tierBg = TIER_BG[toast.official_tier] || "rgba(17, 17, 17, 0.12)";
  const imageUrl = toast.image_url.startsWith("http")
    ? toast.image_url
    : `https://www.toastscore.com${toast.image_url}`;
  const categoryLabel = CATEGORY_LABELS[category] || category.toUpperCase();
  const judgeName = getJudgeDisplayName(featuredJudge);
  const judgeInitial = getJudgeInitial(featuredJudge);

  const response = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#F5F5F5",
          padding: 48,
          position: "relative",
        }}
      >
        {/* Category label */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: 4,
            color: "#888780",
            marginBottom: 24,
            display: "flex",
          }}
        >
          {categoryLabel}
        </div>

        {/* Toast photo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            width={480}
            height={480}
            style={{
              borderRadius: 16,
              objectFit: "cover",
            }}
          />
        </div>

        {/* Judge info row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {/* Judge initial circle */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "#D4537E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 500,
              color: "#FFFFFF",
            }}
          >
            {judgeInitial}
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: "#111111",
              display: "flex",
            }}
          >
            {judgeName}
          </div>
        </div>

        {/* Verdict excerpt */}
        <div
          style={{
            fontSize: 16,
            color: "#666666",
            textAlign: "center",
            maxWidth: 700,
            marginBottom: 24,
            display: "flex",
          }}
        >
          &ldquo;{verdictExcerpt}&rdquo;
        </div>

        {/* TQI Score */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 500,
            color: "#111111",
            lineHeight: 1,
            marginBottom: 12,
            display: "flex",
          }}
        >
          {toast.official_tqi.toFixed(2)}
        </div>

        {/* Tier Badge */}
        <div
          style={{
            display: "flex",
            fontSize: 16,
            fontWeight: 500,
            letterSpacing: 2,
            color: tierColor,
            backgroundColor: tierBg,
            padding: "6px 14px",
            borderRadius: 6,
          }}
        >
          {toast.official_tier.toUpperCase()}
        </div>

        {/* Stamp watermark - bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 120,
            border: "3px solid #CCCCCC",
            borderRadius: 6,
            transform: "rotate(-2.5deg)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: 3,
              color: "#CCCCCC",
              display: "flex",
            }}
          >
            TOAST
          </div>
          <div
            style={{
              width: 60,
              height: 1,
              backgroundColor: "#CCCCCC",
              margin: "4px 0",
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 22,
              fontWeight: 500,
              color: "#CCCCCC",
              lineHeight: 1,
              display: "flex",
            }}
          >
            {toast.official_tqi.toFixed(0)}
          </div>
          <div
            style={{
              width: 60,
              height: 1,
              backgroundColor: "#CCCCCC",
              margin: "4px 0",
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: 2,
              color: "#CCCCCC",
              display: "flex",
            }}
          >
            SCORE
          </div>
        </div>

        {/* toastscore.com footer */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            fontSize: 16,
            color: "#999999",
          }}
        >
          toastscore.com
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
      fonts: [
        {
          name: "Inter",
          data: fontData,
          weight: 500,
          style: "normal" as const,
        },
      ],
    }
  );

  const buffer = Buffer.from(await response.arrayBuffer());
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (key !== process.env.CURATION_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const fontData = await fetch(new URL(FONT_URL)).then((res) =>
      res.arrayBuffer()
    );

    const { best, criminal, judgesPick } = await getCurationCandidates();

    interface Post {
      category: string;
      toastId: string;
      nickname: string;
      tqi: number;
      tier: string;
      imageDataUrl: string;
      caption: string;
    }

    const posts: Post[] = [];

    // Generate posts sequentially to manage memory
    const candidates: { toast: ToastRecord; category: string; judge?: JudgeName }[] = [];
    if (best) candidates.push({ toast: best, category: "best" });
    if (criminal) candidates.push({ toast: criminal, category: "criminal" });
    if (judgesPick) candidates.push({ toast: judgesPick.toast, category: "judges_pick", judge: judgesPick.judge });

    for (const { toast, category, judge } of candidates) {
      const featured = judge
        ? { judge, verdict: toast[`${judge}_verdict` as keyof ToastRecord] as string || "" }
        : getFeaturedJudge(toast);

      if (!featured.verdict) continue;

      const excerpt = getFirstSentence(featured.verdict);
      const judgeName = getJudgeDisplayName(featured.judge);

      const imageDataUrl = await generateImage(
        toast,
        category,
        featured.judge,
        excerpt,
        fontData
      );

      const caption = buildCaption(category, excerpt, judgeName, toast.nickname);

      posts.push({
        category,
        toastId: toast.id,
        nickname: toast.nickname,
        tqi: toast.official_tqi,
        tier: toast.official_tier,
        imageDataUrl,
        caption,
      });
    }

    if (posts.length === 0) {
      return Response.json({
        posts: [],
        message: "No eligible toasts found in the last 7 days.",
      });
    }

    return Response.json({ posts });
  } catch (e) {
    return Response.json(
      { error: `Failed to generate curation: ${e instanceof Error ? e.message : String(e)}` },
      { status: 500 }
    );
  }
}
