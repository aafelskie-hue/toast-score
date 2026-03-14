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
    try {
      const captureWidth = cardRef.current.offsetWidth;
      const captureHeight = cardRef.current.offsetHeight;

      // Convert any CSS color to #rrggbb hex. Modern browsers return
      // color(srgb ...) from getComputedStyle which html2canvas can't parse.
      const probe = document.createElement("canvas");
      probe.width = 1;
      probe.height = 1;
      const probeCtx = probe.getContext("2d")!;
      function toSafeColor(cssColor: string): string {
        probeCtx.clearRect(0, 0, 1, 1);
        probeCtx.fillStyle = "#000000";
        probeCtx.fillStyle = cssColor;
        probeCtx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = probeCtx.getImageData(0, 0, 1, 1).data;
        if (a === 0) return "transparent";
        if (a < 255) return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
        return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
      }

      // Pre-read computed styles from the LIVE DOM before html2canvas clones it.
      // The clone may lack full CSS context, so we capture colors from the original.
      const origEls = [cardRef.current, ...Array.from(cardRef.current.querySelectorAll("*"))];
      const styleMap: { color: string; bg: string; border: string; fill: string; stroke: string }[] = [];
      for (const child of origEls) {
        const computed = getComputedStyle(child);
        styleMap.push({
          color: toSafeColor(computed.color),
          bg: toSafeColor(computed.backgroundColor),
          border: toSafeColor(computed.borderColor),
          fill: child instanceof SVGElement ? (computed.fill && computed.fill !== "none" ? toSafeColor(computed.fill) : "") : "",
          stroke: child instanceof SVGElement ? (computed.stroke && computed.stroke !== "none" ? toSafeColor(computed.stroke) : "") : "",
        });
      }

      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#F5F5F5",
        logging: false,
        useCORS: true,
        width: captureWidth,
        height: captureHeight + 24,
        onclone: (_doc: Document, el: HTMLElement) => {
          // Constrain capture to this card only
          el.style.overflow = "hidden";
          el.style.width = `${captureWidth}px`;

          // Extra bottom padding so stamp isn't clipped
          el.style.paddingBottom = "24px";

          // Hide share actions row
          const shareRow = el.querySelector("[aria-label='Save image']")?.parentElement;
          if (shareRow) (shareRow as HTMLElement).style.display = "none";

          // Force full opacity — the fade-in animation may leave opacity < 1
          el.style.opacity = "1";
          el.style.animation = "none";

          // Apply pre-read hex colors from the live DOM onto cloned elements
          const clonedEls = [el, ...Array.from(el.querySelectorAll("*"))];
          for (let i = 0; i < clonedEls.length && i < styleMap.length; i++) {
            const htmlChild = clonedEls[i] as HTMLElement;
            const s = styleMap[i];
            htmlChild.style.color = s.color;
            htmlChild.style.backgroundColor = s.bg;
            htmlChild.style.borderColor = s.border;
            htmlChild.style.opacity = "1";
            if (s.fill) htmlChild.style.fill = s.fill;
            if (s.stroke) htmlChild.style.stroke = s.stroke;
          }
        },
      });
      const link = document.createElement("a");
      link.download = `toast-score-${judge}-${tqi}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("[SaveImage] error:", err);
    }
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
