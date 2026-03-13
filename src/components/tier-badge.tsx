const TIER_COLORS: Record<string, string> = {
  Legendary: "var(--tier-legendary)",
  Golden: "var(--tier-golden)",
  Respectable: "var(--tier-respectable)",
  Questionable: "var(--tier-questionable)",
  Concerning: "var(--tier-concerning)",
  Criminal: "var(--tier-criminal)",
};

export default function TierBadge({ tier }: { tier: string }) {
  const color = TIER_COLORS[tier] || "var(--black)";
  return (
    <span
      style={{
        textTransform: "uppercase",
        letterSpacing: 1.5,
        fontSize: 12,
        fontWeight: 500,
        color,
        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
        padding: "2px 8px",
        borderRadius: 4,
      }}
    >
      {tier}
    </span>
  );
}
