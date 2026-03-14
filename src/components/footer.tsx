import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        marginTop: 48,
        backgroundColor: "#F5F5F5",
      }}
    >
      <div
        style={{
          fontSize: 13,
          letterSpacing: "0.08em",
          fontWeight: 500,
        }}
      >
        <span style={{ color: "#111111" }}>TOAST</span>
        <span style={{ color: "var(--pink)" }}>SCORE</span>
      </div>
      <Link
        href="https://instagram.com/toastscore"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Toast Score on Instagram"
        className="footer-instagram"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="2"
            y="2"
            width="20"
            height="20"
            rx="5"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
          <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
        </svg>
      </Link>
    </footer>
  );
}
