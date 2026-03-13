import Link from "next/link";
import { ToastRecord } from "@/lib/types";
import TierBadge from "./tier-badge";

export default function ToastCard({ toast }: { toast: ToastRecord }) {
  return (
    <Link
      href={`/toast/${toast.id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
        style={{
          backgroundColor: "var(--off-white)",
          borderRadius: 12,
          padding: 12,
        }}
      >
        <img
          src={toast.image_url}
          alt={toast.nickname}
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            objectFit: "cover",
            borderRadius: 8,
            display: "block",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            marginTop: 8,
          }}
        >
          <span style={{ fontWeight: 500, fontSize: 24 }}>
            {toast.official_tqi.toFixed(2)}
          </span>
          <TierBadge tier={toast.official_tier} />
        </div>
      </div>
    </Link>
  );
}
