"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
      .then((res) => {
        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        setStatus("error");
      });
  }, [sessionId]);

  return (
    <>
      {status === "loading" && (
        <p style={{ fontSize: 16, color: "#666" }}>
          Verifying your membership...
        </p>
      )}

      {status === "success" && (
        <>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 500,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Welcome to the Bureau
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "#666",
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            Your membership is active. You now have access to the full roster of
            8 judges, including 5 exclusive personas. Select your panel on each
            evaluation.
          </p>
          <Link
            href="/submit"
            style={{
              display: "inline-block",
              backgroundColor: "var(--pink)",
              color: "#FFFFFF",
              borderRadius: 12,
              padding: "12px 32px",
              fontWeight: 500,
              fontSize: 16,
              textDecoration: "none",
            }}
          >
            Rate a Toast
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 500,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Verification Failed
          </h1>
          <p style={{ fontSize: 16, color: "#666", marginBottom: 32 }}>
            We could not verify your membership session. If you completed
            payment, your membership should still be active.
          </p>
          <Link
            href="/membership"
            style={{
              display: "inline-block",
              backgroundColor: "var(--black)",
              color: "#FFFFFF",
              borderRadius: 12,
              padding: "12px 32px",
              fontWeight: 500,
              fontSize: 16,
              textDecoration: "none",
            }}
          >
            View Membership
          </Link>
        </>
      )}
    </>
  );
}

export default function MembershipSuccessPage() {
  return (
    <main
      className="mx-auto px-4"
      style={{
        maxWidth: 640,
        paddingTop: 64,
        paddingBottom: 64,
        textAlign: "center",
      }}
    >
      <Suspense
        fallback={
          <p style={{ fontSize: 16, color: "#666" }}>
            Verifying your membership...
          </p>
        }
      >
        <SuccessContent />
      </Suspense>
    </main>
  );
}
