"use client";

import { useEffect, useState } from "react";
import { JudgeName } from "@/lib/types";

interface VerdictShareActionsProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
  url: string;
  judge: JudgeName;
  tqi: number;
}

export default function VerdictShareActions({
  cardRef,
  url,
  judge,
  tqi,
}: VerdictShareActionsProps) {
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "share" in navigator)
      setCanShare(true);
  }, []);

  const absoluteUrl =
    typeof window !== "undefined" ? window.location.origin + url : url;

  async function handleWebShare() {
    try {
      await navigator.share({
        url: absoluteUrl,
        text: `Three judges. Three verdicts. One toast. Official TQI: ${tqi}.`,
      });
    } catch {
      // User cancelled
    }
  }

  async function handleSaveImage() {
    if (!cardRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: null,
      scale: 2,
    });
    const link = document.createElement("a");
    link.download = `toast-score-${judge}-${tqi}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }

  function handleShareX() {
    const text = encodeURIComponent(
      `My toast just scored ${tqi}. Three judges. Three verdicts.`
    );
    const encodedUrl = encodeURIComponent(absoluteUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  const buttonStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--pink)",
    padding: 4,
    display: "inline-flex",
    alignItems: "center",
    transition: "opacity 0.15s",
  };

  function handleHover(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.style.opacity = "0.6";
  }
  function handleLeave(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.style.opacity = "1";
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 8,
        marginTop: 12,
      }}
    >
      {canShare && (
        <button
          onClick={handleWebShare}
          style={buttonStyle}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
          aria-label="Share"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
      )}

      <button
        onClick={handleSaveImage}
        style={buttonStyle}
        onMouseEnter={handleHover}
        onMouseLeave={handleLeave}
        aria-label="Save image"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>

      <button
        onClick={handleCopyLink}
        style={buttonStyle}
        onMouseEnter={handleHover}
        onMouseLeave={handleLeave}
        aria-label="Copy link"
      >
        {copied ? (
          <span style={{ fontSize: 11, fontWeight: 500 }}>Copied</span>
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        )}
      </button>

      <button
        onClick={handleShareX}
        style={buttonStyle}
        onMouseEnter={handleHover}
        onMouseLeave={handleLeave}
        aria-label="Share on X"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>
    </div>
  );
}
