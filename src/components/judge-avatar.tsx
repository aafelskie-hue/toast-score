import { JudgeName } from "@/lib/types";

type JudgeAvatarVariant = "default" | "muted" | "highlighted";

interface JudgeAvatarProps {
  judge: JudgeName;
  size?: number;
  variant?: JudgeAvatarVariant;
}

const VARIANT_COLORS: Record<JudgeAvatarVariant, { outline: string; accent: string; shapeFill: string }> = {
  default: { outline: "#111111", accent: "#D4537E", shapeFill: "#FFFFFF" },
  muted: { outline: "#B4B2A9", accent: "#B4B2A9", shapeFill: "#B4B2A9" },
  highlighted: { outline: "#D4537E", accent: "#D4537E", shapeFill: "#D4537E" },
};

interface SvgColorProps {
  size: number;
  outline: string;
  accent: string;
  shapeFill: string;
}

function JeanPierreSvg({ size, outline, accent, shapeFill }: SvgColorProps) {
  const stroke = size >= 64 ? 2 : 1;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#F5F5F5" stroke={outline} strokeWidth={stroke} />
      {/* Chef toque */}
      <ellipse cx="32" cy="40" rx="12" ry="4" fill={outline} />
      <rect x="22" y="24" width="20" height="16" rx="2" fill={shapeFill} stroke={outline} strokeWidth={stroke} />
      <ellipse cx="26" cy="24" rx="6" ry="8" fill={shapeFill} stroke={outline} strokeWidth={stroke} />
      <ellipse cx="38" cy="24" rx="6" ry="8" fill={shapeFill} stroke={outline} strokeWidth={stroke} />
      <ellipse cx="32" cy="22" rx="6" ry="9" fill={shapeFill} stroke={outline} strokeWidth={stroke} />
      {/* Pink band */}
      <rect x="22" y="36" width="20" height="3" rx="1" fill={accent} />
    </svg>
  );
}

function NanaSvg({ size, outline, accent, shapeFill }: SvgColorProps) {
  const stroke = size >= 64 ? 2 : 1;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#F5F5F5" stroke={outline} strokeWidth={stroke} />
      {/* Bun hairstyle */}
      <circle cx="32" cy="18" r="8" fill={shapeFill} stroke={outline} strokeWidth={stroke} />
      <path d="M24 22 Q24 30 32 32 Q40 30 40 22" fill={shapeFill} stroke={outline} strokeWidth={stroke} />
      {/* Reading glasses - pink frames */}
      <ellipse cx="26" cy="36" rx="7" ry="5" fill="none" stroke={accent} strokeWidth={stroke + 0.5} />
      <ellipse cx="38" cy="36" rx="7" ry="5" fill="none" stroke={accent} strokeWidth={stroke + 0.5} />
      <line x1="33" y1="36" x2="31" y2="36" stroke={accent} strokeWidth={stroke} />
      <line x1="19" y1="35" x2="16" y2="33" stroke={accent} strokeWidth={stroke} />
      <line x1="45" y1="35" x2="48" y2="33" stroke={accent} strokeWidth={stroke} />
    </svg>
  );
}

function ChadSvg({ size, outline, accent, shapeFill }: SvgColorProps) {
  const stroke = size >= 64 ? 2 : 1;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#F5F5F5" stroke={outline} strokeWidth={stroke} />
      {/* Wide shoulders */}
      <path d="M16 52 Q16 44 24 42 L40 42 Q48 44 48 52" fill={shapeFill} stroke={outline} strokeWidth={stroke} />
      {/* Head shape */}
      <circle cx="32" cy="30" r="10" fill={shapeFill} stroke={outline} strokeWidth={stroke} />
      {/* Backwards baseball cap */}
      <path d="M22 28 Q22 18 32 18 Q42 18 42 28" fill={shapeFill} stroke={outline} strokeWidth={stroke} />
      <rect x="22" y="26" width="20" height="3" rx="1" fill={outline} />
      {/* Pink brim (backwards) */}
      <path d="M38 27 Q44 24 48 27" fill={accent} stroke={accent} strokeWidth={stroke} />
    </svg>
  );
}

export default function JudgeAvatar({ judge, size = 40, variant = "default" }: JudgeAvatarProps) {
  const { outline, accent, shapeFill } = VARIANT_COLORS[variant];
  const colorProps = { size, outline, accent, shapeFill };

  switch (judge) {
    case "jp":
      return <JeanPierreSvg {...colorProps} />;
    case "nana":
      return <NanaSvg {...colorProps} />;
    case "chad":
      return <ChadSvg {...colorProps} />;
  }
}

export function getJudgeDisplayName(judge: JudgeName): string {
  switch (judge) {
    case "jp":
      return "Jean-Pierre";
    case "nana":
      return "Nana";
    case "chad":
      return "Chad";
  }
}

export function getWinningJudge(
  jpTqi: number | null,
  nanaTqi: number | null,
  chadTqi: number | null
): JudgeName | null {
  const entries: [JudgeName, number | null][] = [
    ["jp", jpTqi],
    ["nana", nanaTqi],
    ["chad", chadTqi],
  ];

  let winner: JudgeName | null = null;
  let best = -Infinity;

  for (const [name, tqi] of entries) {
    if (tqi !== null && tqi > best) {
      best = tqi;
      winner = name;
    }
  }

  return winner;
}

interface JudgeIconRowProps {
  jpTqi: number | null;
  nanaTqi: number | null;
  chadTqi: number | null;
  size?: number;
}

export function JudgeIconRow({ jpTqi, nanaTqi, chadTqi, size = 32 }: JudgeIconRowProps) {
  const winner = getWinningJudge(jpTqi, nanaTqi, chadTqi);
  const judges: [JudgeName, number | null][] = [
    ["jp", jpTqi],
    ["nana", nanaTqi],
    ["chad", chadTqi],
  ];

  return (
    <div style={{ display: "flex", gap: 4 }}>
      {judges.map(([name]) => (
        <JudgeAvatar
          key={name}
          judge={name}
          size={size}
          variant={winner === null ? "muted" : name === winner ? "highlighted" : "muted"}
        />
      ))}
    </div>
  );
}
