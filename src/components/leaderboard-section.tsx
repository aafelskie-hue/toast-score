"use client";

import { useState } from "react";
import Link from "next/link";
import { ToastRecord, BottomShelfToast } from "@/lib/types";
import { deriveTier } from "@/lib/tqi";
import TierBadge from "./tier-badge";
import { getHarshestJudge, getJudgeVerdict } from "./judge-avatar";

type Period = "today" | "week" | "alltime";
type Shelf = "top" | "bottom";

const PERIOD_TABS: { label: string; value: Period }[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "All Time", value: "alltime" },
];

const SHELF_TABS: { label: string; value: Shelf }[] = [
  { label: "Top Shelf", value: "top" },
  { label: "Bottom Shelf", value: "bottom" },
];

interface LeaderboardSectionProps {
  initialData: { toasts: ToastRecord[]; total: number };
}

export default function LeaderboardSection({
  initialData,
}: LeaderboardSectionProps) {
  const [period, setPeriod] = useState<Period>("today");
  const [shelf, setShelf] = useState<Shelf>("top");
  const [toasts, setToasts] = useState<(ToastRecord | BottomShelfToast)[]>(initialData.toasts);
  const [total, setTotal] = useState(initialData.total);
  const [loading, setLoading] = useState(false);

  async function fetchData(p: Period, s: Shelf, offset: number, append: boolean) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/leaderboard?period=${p}&shelf=${s}&limit=20&offset=${offset}`
      );
      const data = await res.json();
      setToasts(append ? (prev) => [...prev, ...data.toasts] : data.toasts);
      setTotal(data.total);
    } catch {
      // keep existing data
    } finally {
      setLoading(false);
    }
  }

  function switchPeriod(p: Period) {
    setPeriod(p);
    fetchData(p, shelf, 0, false);
  }

  function switchShelf(s: Shelf) {
    setShelf(s);
    fetchData(period, s, 0, false);
  }

  function loadMore() {
    fetchData(period, shelf, toasts.length, true);
  }

  function isBottomShelf(toast: ToastRecord | BottomShelfToast): toast is BottomShelfToast {
    return "lowest_tqi" in toast;
  }

  return (
    <section style={{ marginTop: 32 }}>
      <h2 style={{ fontWeight: 500, fontSize: 20, marginBottom: 12 }}>
        Leaderboard
      </h2>

      {/* Shelf Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {SHELF_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => switchShelf(tab.value)}
            style={{
              fontWeight: 500,
              fontSize: 14,
              padding: "6px 14px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              backgroundColor:
                shelf === tab.value ? "var(--pink-tint)" : "transparent",
              color:
                shelf === tab.value ? "var(--pink)" : "var(--foreground)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Period Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {PERIOD_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => switchPeriod(tab.value)}
            style={{
              fontWeight: 500,
              fontSize: 14,
              padding: "6px 14px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              backgroundColor:
                period === tab.value ? "var(--pink-tint)" : "transparent",
              color:
                period === tab.value ? "var(--pink)" : "var(--foreground)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {toasts.length === 0 ? (
        <p style={{ color: "#666", fontStyle: "italic", fontSize: 14 }}>
          No toast has been evaluated in this period. The Bureau is concerned.
        </p>
      ) : (
        <div style={{ opacity: loading ? 0.5 : 1, transition: "opacity 150ms" }}>
          {toasts.map((toast, i) => {
            const bottom = shelf === "bottom" && isBottomShelf(toast);
            const displayTqi = bottom ? toast.lowest_tqi : toast.official_tqi;
            const displayTier = bottom ? deriveTier(toast.lowest_tqi) : toast.official_tier;
            const harshest = bottom ? toast.harshest_judge : null;
            const verdict = harshest ? getJudgeVerdict(toast, harshest) : null;
            const verdictSnippet = verdict
              ? verdict.length > 80 ? verdict.slice(0, 80) + "…" : verdict
              : undefined;

            return (
              <Link
                key={toast.id}
                href={`/toast/${toast.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  title={verdictSnippet}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 12px",
                    borderRadius: 8,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--pink-tint)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <span
                    style={{
                      width: 28,
                      textAlign: "right",
                      fontSize: 14,
                      color: "#888780",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <img
                    src={toast.image_url}
                    alt={toast.nickname}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 4,
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      flex: 1,
                      fontSize: 14,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {toast.nickname}
                  </span>
                  <span style={{ fontWeight: 500, fontSize: 16, flexShrink: 0 }}>
                    {displayTqi.toFixed(2)}
                  </span>
                  <div className="hidden md:block" style={{ flexShrink: 0 }}>
                    <TierBadge tier={displayTier} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {toasts.length < total && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button
            onClick={loadMore}
            disabled={loading}
            style={{
              fontWeight: 500,
              fontSize: 14,
              padding: "8px 24px",
              borderRadius: 8,
              border: "1px solid #E5E5E5",
              backgroundColor: "transparent",
              cursor: loading ? "default" : "pointer",
              color: "var(--foreground)",
            }}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </section>
  );
}
