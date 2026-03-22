"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MembershipLink() {
  const [isMember, setIsMember] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/membership/status")
      .then((res) => res.json())
      .then((data) => setIsMember(data.isMember))
      .catch(() => setIsMember(false));
  }, []);

  if (isMember === null) return null;

  return (
    <Link
      href="/membership"
      style={{
        fontSize: 14,
        fontWeight: 500,
        color: isMember ? "var(--pink)" : "var(--black)",
        textDecoration: "none",
        letterSpacing: 1,
        textTransform: "uppercase",
      }}
    >
      {isMember ? "Member" : "Join"}
    </Link>
  );
}
