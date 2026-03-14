import { ImageResponse } from "next/og";

export const runtime = "edge";

const FONT_URL =
  "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf";

export async function GET() {
  try {
    const fontData = await fetch(new URL(FONT_URL)).then((res) =>
      res.arrayBuffer()
    );

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#F5F5F5",
          }}
        >
          {/* Toast Score Stamp */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: 240,
              height: 300,
              border: "6px solid #111111",
              borderRadius: 12,
              transform: "rotate(-2.5deg)",
            }}
          >
            {/* TOAST */}
            <div
              style={{
                fontSize: 36,
                fontWeight: 500,
                letterSpacing: 9,
                color: "#111111",
                marginBottom: 8,
                display: "flex",
              }}
            >
              TOAST
            </div>
            {/* Top rule */}
            <div
              style={{
                width: 160,
                height: 2,
                backgroundColor: "#111111",
                marginBottom: 12,
                display: "flex",
              }}
            />
            {/* Score */}
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
              93
            </div>
            {/* Bottom rule */}
            <div
              style={{
                width: 160,
                height: 2,
                backgroundColor: "#111111",
                marginBottom: 8,
                display: "flex",
              }}
            />
            {/* SCORE */}
            <div
              style={{
                fontSize: 28,
                fontWeight: 500,
                letterSpacing: 6,
                color: "#111111",
                display: "flex",
              }}
            >
              SCORE
            </div>
          </div>

          {/* URL */}
          <div
            style={{
              fontSize: 20,
              color: "#888888",
              marginTop: 24,
              display: "flex",
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
            data: fontData,
            weight: 500,
            style: "normal" as const,
          },
        ],
      }
    );
  } catch (e) {
    return new Response(
      `Failed to generate image: ${e instanceof Error ? e.message : String(e)}`,
      { status: 500 }
    );
  }
}
