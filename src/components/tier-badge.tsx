const TIER_COLORS: Record<string, [string, string]> = {
  Legendary: ["var(--tier-legendary)", "rgba(239, 200, 32, 0.12)"],
  Golden: ["var(--tier-golden)", "rgba(184, 150, 10, 0.12)"],
  Respectable: ["var(--tier-respectable)", "rgba(212, 83, 126, 0.12)"],
  Questionable: ["var(--tier-questionable)", "rgba(136, 135, 128, 0.12)"],
  Concerning: ["var(--tier-concerning)", "rgba(180, 178, 169, 0.12)"],
  Criminal: ["var(--tier-criminal)", "rgba(17, 17, 17, 0.12)"],
};

export default function TierBadge({ tier }: { tier: string }) {
  const [color, bg] = TIER_COLORS[tier] || ["var(--black)", "rgba(17, 17, 17, 0.12)"];
  return (
    <span
      style={{
        display: "inline-block",
        textTransform: "uppercase",
        letterSpacing: 1.5,
        fontSize: 12,
        fontWeight: 500,
        lineHeight: "12px",
        color,
        backgroundColor: bg,
        padding: "4px 8px",
        borderRadius: 4,
        verticalAlign: "top",
      }}
    >
      {tier}
    </span>
  );
}
