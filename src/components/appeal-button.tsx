"use client";

import { useState, useEffect } from "react";

interface AppealButtonProps {
  toastId: string;
  hasAppeal: boolean;
}

export default function AppealButton({ toastId, hasAppeal }: AppealButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [freeAvailable, setFreeAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/membership/status")
      .then((res) => res.json())
      .then((data) => {
        setIsMember(data.isMember);
        if (data.isMember) {
          // The appeal route will check free eligibility server-side
          setFreeAvailable(true);
        }
      })
      .catch(() => setIsMember(false));
  }, []);

  if (hasAppeal) {
    return (
      <p
        style={{
          fontSize: 13,
          color: "#888",
          textAlign: "center",
          fontStyle: "italic",
        }}
      >
        Appeal filed. The Bureau&apos;s decision is final.
      </p>
    );
  }

  async function handlePaidAppeal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "appeal", toast_id: toastId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to create checkout");
        setLoading(false);
      }
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  async function handleFreeAppeal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appeal/${toastId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ free: true }),
      });
      const data = await res.json();
      if (res.ok) {
        // Reload to show appeal results
        window.location.reload();
      } else {
        if (res.status === 402) {
          // Free appeal already used, fall back to paid
          setFreeAvailable(false);
          setError(null);
        } else {
          setError(data.error || "Appeal failed");
        }
        setLoading(false);
      }
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div style={{ textAlign: "center" }}>
      {isMember && freeAvailable ? (
        <button
          onClick={handleFreeAppeal}
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
          {loading ? "Convening panel..." : "Appeal to the Bureau (free this month)"}
        </button>
      ) : (
        <button
          onClick={handlePaidAppeal}
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
          {loading ? "Loading..." : "Appeal to the Bureau — $0.99"}
        </button>
      )}
      {error && (
        <p style={{ fontSize: 13, color: "var(--pink)", marginTop: 8 }}>
          {error}
        </p>
      )}
    </div>
  );
}
