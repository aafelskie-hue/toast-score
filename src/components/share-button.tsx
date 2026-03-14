"use client";

import { useEffect, useState } from "react";

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  variant?: "inline" | "standalone";
}

export default function ShareButton({
  title,
  text,
  url,
  variant = "inline",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "share" in navigator) setCanShare(true);
  }, []);

  async function handleShare() {
    const absoluteUrl = window.location.origin + url;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: absoluteUrl });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }

  const isStandalone = variant === "standalone";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isStandalone ? "center" : "flex-end",
        marginTop: isStandalone ? 24 : 12,
      }}
    >
      <button
        onClick={handleShare}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--pink)",
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontWeight: 500,
          fontSize: isStandalone ? 14 : 13,
          letterSpacing: "0.5px",
          padding: "12px 8px",
          margin: "-12px -8px",
          opacity: copied ? 0.7 : 1,
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!copied) e.currentTarget.style.opacity = "0.7";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = copied ? "0.7" : "1";
        }}
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
        {copied ? "Copied!" : canShare ? "Share" : "Copy Link"}
      </button>
    </div>
  );
}
