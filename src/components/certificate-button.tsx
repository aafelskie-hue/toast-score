"use client";

import { useState } from "react";

interface CertificateButtonProps {
  toastId: string;
  hasCertificate: boolean;
  certificateUrl: string | null;
}

export default function CertificateButton({
  toastId,
  hasCertificate,
  certificateUrl,
}: CertificateButtonProps) {
  const [loading, setLoading] = useState(false);

  if (hasCertificate && certificateUrl) {
    return (
      <div style={{ textAlign: "center" }}>
        <a
          href={certificateUrl}
          download
          style={{
            display: "inline-block",
            backgroundColor: "var(--black)",
            color: "#FFFFFF",
            borderRadius: 12,
            padding: "10px 24px",
            fontWeight: 500,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Download Certificate
        </a>
      </div>
    );
  }

  async function handlePurchase() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "certificate", toast_id: toastId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div style={{ textAlign: "center" }}>
      <button
        onClick={handlePurchase}
        disabled={loading}
        style={{
          backgroundColor: "var(--black)",
          color: "#FFFFFF",
          borderRadius: 12,
          padding: "10px 24px",
          fontWeight: 500,
          fontSize: 14,
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Loading..." : "Official Certificate — $1.99"}
      </button>
    </div>
  );
}
