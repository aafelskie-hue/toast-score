"use client";

import { useState, useEffect, useRef } from "react";

interface CertificateButtonProps {
  toastId: string;
  hasCertificate: boolean;
  certificateUrl: string | null;
  certificateSessionId?: string;
}

export default function CertificateButton({
  toastId,
  hasCertificate,
  certificateUrl,
  certificateSessionId,
}: CertificateButtonProps) {
  const [loading, setLoading] = useState(false);
  const downloadTriggered = useRef(false);

  // Auto-trigger certificate download after Stripe redirect
  useEffect(() => {
    if (certificateSessionId && !downloadTriggered.current) {
      downloadTriggered.current = true;
      window.location.href = `/api/certificate/${toastId}?session_id=${certificateSessionId}`;
    }
  }, [certificateSessionId, toastId]);

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
