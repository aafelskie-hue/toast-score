import Link from "next/link";
import { ToastRecord } from "@/lib/types";
import ToastStamp from "./toast-stamp";
import TierBadge from "./tier-badge";
import { JudgeIconRow } from "./judge-avatar";

export default function HeroSection({ toast }: { toast: ToastRecord | null }) {
  return (
    <section style={{ textAlign: "center", padding: "32px 0 40px" }}>
      {toast ? (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flexShrink: 0 }}>
              <ToastStamp score={toast.official_tqi} opacity={1} height={120} />
            </div>
            <div>
              <img
                src={toast.image_url}
                alt={toast.nickname}
                style={{
                  maxWidth: 300,
                  width: "100%",
                  borderRadius: 8,
                  aspectRatio: "1 / 1",
                  objectFit: "cover",
                }}
              />
            </div>
          </div>
          <p style={{ fontSize: 16, color: "#666", marginTop: 16 }}>
            {toast.nickname}
          </p>
          <div
            style={{
              fontSize: 48,
              fontWeight: 500,
              lineHeight: 1,
              marginTop: 4,
            }}
          >
            {toast.official_tqi.toFixed(2)}
          </div>
          <div style={{ marginTop: 4 }}>
            <TierBadge tier={toast.official_tier} />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 12,
            }}
          >
            <JudgeIconRow
              jpTqi={toast.jp_tqi}
              nanaTqi={toast.nana_tqi}
              chadTqi={toast.chad_tqi}
              size={24}
            />
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ToastStamp score={null} opacity={1} height={120} />
          </div>
          <p
            style={{
              fontSize: 16,
              color: "#666",
              marginTop: 16,
              fontStyle: "italic",
            }}
          >
            No toast has been evaluated today. This is concerning.
          </p>
        </>
      )}
      {/* Desktop CTA */}
      <div className="hidden md:block" style={{ marginTop: 24 }}>
        <Link
          href="/submit"
          style={{
            display: "inline-block",
            backgroundColor: "var(--pink)",
            color: "#FFFFFF",
            borderRadius: 12,
            padding: "12px 32px",
            fontWeight: 500,
            fontSize: 16,
            textDecoration: "none",
          }}
        >
          Rate My Toast
        </Link>
        <p style={{ fontSize: 13, color: "#888780", marginTop: 12 }}>
          Follow the results{" "}
          <Link
            href="https://instagram.com/toastscore"
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-follow"
            style={{
              color: "#888780",
              textDecoration: "none",
            }}
          >
            @toastscore
          </Link>
        </p>
      </div>
    </section>
  );
}
