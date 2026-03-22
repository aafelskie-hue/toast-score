import type { Metadata } from "next";
import { getMembershipStatus } from "@/lib/membership";
import MembershipActions from "./membership-actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bureau Membership — Toast Score",
  description:
    "Exclusive judges. Expanded roster. $2.99 per month.",
};

export default async function MembershipPage() {
  const status = await getMembershipStatus();

  return (
    <main
      className="mx-auto px-4"
      style={{ maxWidth: 640, paddingTop: 48, paddingBottom: 64 }}
    >
      {status.isMember ? (
        <ActiveMemberView currentPeriodEnd={status.currentPeriodEnd} />
      ) : (
        <SalesView />
      )}
      <MembershipActions isMember={status.isMember} />
    </main>
  );
}

function SalesView() {
  return (
    <>
      <h1
        style={{
          fontSize: 32,
          fontWeight: 500,
          letterSpacing: 2,
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        Bureau Membership
      </h1>
      <p
        style={{
          fontSize: 18,
          color: "#666",
          textAlign: "center",
          marginBottom: 40,
        }}
      >
        Exclusive judges. Expanded roster. $2.99 per month.
      </p>

      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <p style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
          Access to the full judge roster — 5 additional judges with distinct
          personalities, selectable per evaluation.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
          1 free appeal per month — request a re-evaluation at no additional
          cost.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
          Select your own panel — choose any 3 judges from the full roster of 8
          for each evaluation.
        </p>
      </div>

      <p
        style={{
          fontSize: 14,
          color: "#888",
          textAlign: "center",
          marginTop: 24,
        }}
      >
        Cancel anytime via the Stripe customer portal.
      </p>
    </>
  );
}

function ActiveMemberView({
  currentPeriodEnd,
}: {
  currentPeriodEnd: string | null;
}) {
  const renewalDate = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <>
      <h1
        style={{
          fontSize: 32,
          fontWeight: 500,
          letterSpacing: 2,
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        Bureau Membership
      </h1>
      <p
        style={{
          fontSize: 18,
          color: "var(--pink)",
          textAlign: "center",
          fontWeight: 500,
          marginBottom: 32,
        }}
      >
        Active
      </p>

      {renewalDate && (
        <p
          style={{
            fontSize: 14,
            color: "#666",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Next billing date: {renewalDate}
        </p>
      )}

      <p
        style={{
          fontSize: 16,
          lineHeight: 1.7,
          textAlign: "center",
          marginBottom: 32,
          maxWidth: 480,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        The Bureau recognizes your commitment to toast evaluation standards.
      </p>
    </>
  );
}
