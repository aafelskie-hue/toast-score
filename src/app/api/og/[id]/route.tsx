import { ImageResponse } from "next/og";
import { getToastById } from "@/lib/queries";

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

const interMedium = fetch(
  new URL(
    "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKv8nD.woff2"
  )
).then((res) => res.arrayBuffer());

const interRegular = fetch(
  new URL(
    "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKv8nD.woff2"
  )
).then((res) => res.arrayBuffer());

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const toast = await getToastById(id);

  if (!toast) {
    return new Response("Toast not found", { status: 404 });
  }

  const [mediumFont, regularFont] = await Promise.all([
    interMedium,
    interRegular,
  ]);

  const tierColor = TIER_COLORS[toast.official_tier] || "#111111";
  const tierBg = TIER_BG[toast.official_tier] || "rgba(17, 17, 17, 0.12)";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          backgroundColor: "#F5F5F5",
          padding: 48,
          position: "relative",
        }}
      >
        {/* Left: Toast photo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 500,
            height: "100%",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={toast.image_url}
            alt=""
            width={480}
            height={480}
            style={{
              borderRadius: 16,
              objectFit: "cover",
            }}
          />
        </div>

        {/* Right: Score info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            paddingLeft: 32,
          }}
        >
          {/* Nickname */}
          <div
            style={{
              fontSize: 24,
              color: "#666666",
              marginBottom: 12,
              display: "flex",
            }}
          >
            {toast.nickname}
          </div>

          {/* TQI Score */}
          <div
            style={{
              fontSize: 128,
              fontWeight: 500,
              color: "#111111",
              lineHeight: 1,
              marginBottom: 16,
              display: "flex",
            }}
          >
            {toast.official_tqi.toFixed(2)}
          </div>

          {/* Tier Badge */}
          <div
            style={{
              display: "flex",
              fontSize: 18,
              fontWeight: 500,
              textTransform: "uppercase" as const,
              letterSpacing: 2,
              color: tierColor,
              backgroundColor: tierBg,
              padding: "8px 16px",
              borderRadius: 6,
            }}
          >
            {toast.official_tier}
          </div>
        </div>

        {/* Stamp watermark - bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 32,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 80,
            border: "2px solid #111111",
            borderRadius: 4,
            transform: "rotate(-2.5deg)",
            opacity: 0.2,
          }}
        >
          <div
            style={{
              fontSize: 8,
              fontWeight: 500,
              letterSpacing: 2,
              color: "#111111",
              display: "flex",
            }}
          >
            TOAST
          </div>
          <div
            style={{
              width: 40,
              height: 0.5,
              backgroundColor: "#111111",
              margin: "2px 0",
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#111111",
              display: "flex",
            }}
          >
            {toast.official_tqi.toFixed(0)}
          </div>
          <div
            style={{
              width: 40,
              height: 0.5,
              backgroundColor: "#111111",
              margin: "2px 0",
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 6,
              fontWeight: 500,
              letterSpacing: 1,
              color: "#111111",
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
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: mediumFont,
          weight: 500,
          style: "normal",
        },
        {
          name: "Inter",
          data: regularFont,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );
}
