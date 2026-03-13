"use client";

import { useState } from "react";
import Link from "next/link";
import { ToastRecord } from "@/lib/types";
import TierBadge from "./tier-badge";

type Period = "today" | "week" | "alltime";

const TABS: { label: string; value: Period }[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "All Time", value: "alltime" },
];

interface LeaderboardSectionProps {
  initialData: { toasts: ToastRecord[]; total: number };
}

export default function LeaderboardSection({
  initialData,
}: LeaderboardSectionProps) {
  const [period, setPeriod] = useState<Period>("today");
  const [toasts, setToasts] = useState(initialData.toasts);
  const [total, setTotal] = useState(initialData.total);
  const [loading, setLoading] = useState(false);

  async function switchPeriod(p: Period) {
    setPeriod(p);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/leaderboard?period=${p}&limit=20&offset=0`
      );
      const data = await res.json();
      setToasts(data.toasts);
      setTotal(data.total);
    } catch {
      // keep existing data
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/leaderboard?period=${period}&limit=20&offset=${toasts.length}`
      );
      const data = await res.json();
      setToasts((prev) => [...prev, ...data.toasts]);
      setTotal(data.total);
    } catch {
      // keep existing data
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ marginTop: 32 }}>
      <h2 style={{ fontWeight: 500, fontSize: 20, marginBottom: 12 }}>
        Leaderboard
      </h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {TABS.map((tab) => (
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
          {toasts.map((toast, i) => (
            <Link
              key={toast.id}
              href={`/toast/${toast.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
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
                  {toast.official_tqi.toFixed(2)}
                </span>
                <div className="hidden md:block" style={{ flexShrink: 0 }}>
                  <TierBadge tier={toast.official_tier} />
                </div>
              </div>
            </Link>
          ))}
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
