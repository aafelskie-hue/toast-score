"use client";

import { useRef, useState } from "react";
import { JudgeName, SubMetrics } from "@/lib/types";
import JudgeAvatar, { getJudgeDisplayName } from "./judge-avatar";
import ToastStamp from "./toast-stamp";
import TierBadge from "./tier-badge";
import VerdictShareActions from "./verdict-share-actions";

interface VerdictCardProps {
  judge: JudgeName;
  verdict: string | null;
  tqi: number | null;
  tier: string | null;
  subMetrics: SubMetrics | null;
  failed: boolean;
  animationDelay?: number;
  shareUrl?: string;
  isWinner?: boolean;
}

const FAILURE_MESSAGES: Record<JudgeName, string> = {
  jp: "Jean-Pierre has stormed out of the kitchen.",
  nana: "Nana had to step out. She says she still loves you.",
  chad: "Chad is at the gym. He'll catch the next one, bro.",
};

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
            {FAILURE_MESSAGES[judge]}
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
                    marginBottom: metricsOpen ? 6 : 0,
                  }}
                >
                  {metricsOpen ? "Hide metrics" : "Show metrics"}
                </button>
                {/* Mobile: visible when toggled. Desktop: always visible */}
                <div className={metricsOpen ? "block" : "hidden md:block"}>
                  {Object.entries(subMetrics).map(([key, val]) => (
                    <MetricBar key={key} label={METRIC_LABELS[key] || key} value={val} />
                  ))}
                </div>
              </>
            )}

            {/* Stamp watermark — right-aligned, in its own row */}
            {tqi !== null && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 12,
                  pointerEvents: "none",
                }}
              >
                <ToastStamp score={tqi} opacity={0.4} height={80} color="#D4537E" />
              </div>
            )}

            {/* Share button row — full-width bottom of card */}
            {shareUrl && tqi !== null && (
              <div style={{ marginTop: 8, paddingBottom: 6 }}>
                <VerdictShareActions cardRef={cardRef} url={shareUrl} judge={judge} tqi={tqi} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
