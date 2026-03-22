import Link from "next/link";
import MembershipLink from "./membership-link";

export default function Nav() {
  return (
    <nav
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Link href="/" style={{ textDecoration: "none" }}>
        <span
          style={{
            fontWeight: 500,
            letterSpacing: 3,
            textTransform: "uppercase",
            fontSize: 16,
          }}
        >
          <span style={{ color: "#111111" }}>TOAST</span>
          <span style={{ color: "#D4537E" }}> SCORE</span>
        </span>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <MembershipLink />
        <Link
          href="/submit"
          style={{
            backgroundColor: "var(--pink)",
            color: "#FFFFFF",
            borderRadius: 12,
            padding: "8px 16px",
            fontWeight: 500,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Rate My Toast
        </Link>
      </div>
    </nav>
  );
}
