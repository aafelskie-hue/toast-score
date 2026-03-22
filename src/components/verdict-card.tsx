"use client";

import { useRef, useState } from "react";
import { type JudgeId } from "@/lib/judges";
import { JUDGES } from "@/lib/judges";
import { SubMetrics } from "@/lib/types";
import JudgeAvatar, { getJudgeDisplayName } from "./judge-avatar";
import ToastStamp from "./toast-stamp";
import TierBadge from "./tier-badge";
import VerdictShareActions from "./verdict-share-actions";

interface VerdictCardProps {
  judge: JudgeId;
  verdict: string | null;
  tqi: number | null;
  tier: string | null;
  subMetrics: SubMetrics | null;
  failed: boolean;
  animationDelay?: number;
  shareUrl?: string;
  isWinner?: boolean;
}

function getFailureMessage(judge: JudgeId): string {
  return JUDGES[judge]?.failureMessage ?? "This judge is currently unavailable.";
}

const METRIC_LABELS: Record<string, string> = {
  browning_uniformity: "Browning Uniformity",
  crust_integrity: "Crust Integrity",
  crumb_crust_ratio: "Crumb/Crust Ratio",
  char_analysis: "Char Analysis",
  surface_texture: "Surface Texture",
  presentation: "Presentation",
};

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between" style={{ fontSize: 13, position: "relative", zIndex: 1, marginBottom: 4 }}>
        <span>{label}</span>
        <span>{value.toFixed(1)}</span>
      </div>
      <div
        className="w-full rounded"
        style={{ height: 4, backgroundColor: "#E5E5E5", borderRadius: 4 }}
      >
        <div
          className="rounded"
          style={{
            height: 4,
            width: `${(value / 10) * 100}%`,
            backgroundColor: "var(--pink)",
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
}

export default function VerdictCard({
  judge,
  verdict,
  tqi,
  tier,
  subMetrics,
  failed,
  animationDelay = 0,
  shareUrl,
  isWinner = false,
}: VerdictCardProps) {
  const [metricsOpen, setMetricsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      className="animate-fade-slide-up relative"
      style={
        {
          "--animation-delay": `${animationDelay}ms`,
          backgroundColor: "var(--off-white)",
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          overflow: "hidden",
          opacity: failed ? 0.5 : undefined,
          borderTop: isWinner ? "3px solid var(--pink)" : undefined,
        } as React.CSSProperties
      }
    >
      {/* Card inner with responsive padding */}
      <div className="p-2.5 md:p-6" style={{ position: "relative", zIndex: 1 }}>
        {/* Judge header */}
        <div className="flex items-center gap-1.5 md:gap-3 mb-1.5 md:mb-4">
          <div className="shrink-0 w-7 h-7 md:w-8 md:h-8">
            <JudgeAvatar judge={judge} size={28} />
          </div>
          <span className="text-xs md:text-sm" style={{ fontWeight: 500 }}>
            {getJudgeDisplayName(judge)}
          </span>
        </div>

        {failed ? (
          <p className="text-sm md:text-base" style={{ fontStyle: "italic", color: "#666" }}>
            {getFailureMessage(judge)}
          </p>
        ) : (
          <>
            {/* Verdict text */}
            <p className="mb-1.5 md:mb-4" style={{ fontSize: 16, fontWeight: 400, lineHeight: 1.5 }}>
              {verdict}
            </p>

            {/* TQI + tier */}
            {tqi !== null && (
              <div className="text-[48px] md:text-6xl" style={{ fontWeight: 500, lineHeight: 1, paddingBottom: 12 }}>
                {tqi.toFixed(2)}
              </div>
            )}
            {tier && (
              <div style={{ marginBottom: 8 }}>
                <TierBadge tier={tier} />
              </div>
            )}

            {/* Sub-metric bars */}
            {subMetrics && (
              <>
                {/* Mobile: collapsible toggle */}
                <button
                  className="md:hidden"
                  onClick={() => setMetricsOpen(!metricsOpen)}
                  style={{
                    fontSize: 11,
                    color: "var(--pink)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {metricsOpen ? "Hide metrics" : "Show metrics"}
                </button>
                {/* Mobile: conditional render only when toggled open */}
                {metricsOpen && (
                  <div className="mt-1.5 md:hidden">
                    {Object.entries(subMetrics).map(([key, val]) => (
                      <MetricBar key={key} label={METRIC_LABELS[key] || key} value={val} />
                    ))}
                  </div>
                )}
                {/* Desktop: always visible — uses media query to avoid Tailwind hidden bug */}
                <div className="metrics-desktop-only">
                  {Object.entries(subMetrics).map(([key, val]) => (
                    <MetricBar key={key} label={METRIC_LABELS[key] || key} value={val} />
                  ))}
                </div>
              </>
            )}

            {/* Stamp + share row */}
            {tqi !== null && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 12,
                  paddingBottom: 6,
                }}
              >
                <div style={{ pointerEvents: "none", height: 60, overflow: "hidden" }}>
                  <ToastStamp score={tqi} opacity={0.4} height={60} color="#D4537E" />
                </div>
                {shareUrl && (
                  <VerdictShareActions cardRef={cardRef} url={shareUrl} judge={judge} tqi={tqi} />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
