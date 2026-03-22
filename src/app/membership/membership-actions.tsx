"use client";

import { useState } from "react";

export default function MembershipActions({
  isMember,
}: {
  isMember: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "membership" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  async function handleManage() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  if (isMember) {
    return (
      <div style={{ textAlign: "center" }}>
        <button
          onClick={handleManage}
          disabled={loading}
          style={{
            backgroundColor: "var(--black)",
            color: "#FFFFFF",
            borderRadius: 12,
            padding: "12px 32px",
            fontWeight: 500,
            fontSize: 16,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Loading..." : "Manage Membership"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center" }}>
      <button
        onClick={handleSubscribe}
        disabled={loading}
        style={{
          backgroundColor: "var(--pink)",
          color: "#FFFFFF",
          borderRadius: 12,
          padding: "12px 32px",
          fontWeight: 500,
          fontSize: 16,
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Loading..." : "Join the Bureau"}
      </button>
    </div>
  );
}
