"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MembershipBanner() {
  const [isMember, setIsMember] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/membership/status")
      .then((res) => res.json())
      .then((data) => setIsMember(data.isMember))
      .catch(() => setIsMember(false));
  }, []);

  // Hide while loading or if already a member
  if (isMember !== false) return null;

  return (
    <div
      style={{
        backgroundColor: "var(--off-white)",
        borderRadius: 12,
        padding: "16px 24px",
        marginTop: 24,
        marginBottom: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <p style={{ fontSize: 14, color: "var(--black)", margin: 0 }}>
        Bureau Membership — $2.99/mo. 5 exclusive judges.
      </p>
      <Link
        href="/membership"
        style={{
          backgroundColor: "var(--pink)",
          color: "#FFFFFF",
          borderRadius: 8,
          padding: "6px 16px",
          fontWeight: 500,
          fontSize: 13,
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}
      >
        Join the Bureau
      </Link>
    </div>
  );
}
