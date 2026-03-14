import { JudgeName, ToastRecord } from "@/lib/types";

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
  const showDetail = size >= 40;
  return (
    <svg width={size} height={size} viewBox="-30 -30 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="jp-clip">
          <circle cx="0" cy="0" r="30" />
        </clipPath>
      </defs>
      <g clipPath="url(#jp-clip)">
        <circle cx="0" cy="0" r="30" fill="#F5F5F5" />
        {/* Shoulders/coat */}
        <path d="M-30 18 Q-30 10 -16 8 L16 8 Q30 10 30 18 L30 34 L-30 34Z" fill={outline} />
        {/* Coat collar V */}
        <path d="M-6 8 L0 18 L6 8" fill="none" stroke={shapeFill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Neck */}
        <rect x="-7" y="2" width="14" height="10" rx="3" fill={outline} />
        {/* Head */}
        <ellipse cx="0" cy="-4" rx="14" ry="13" fill={outline} />
        {/* Toque body */}
        <path d="M-14 -8 L-13 -36 Q-12 -42 0 -44 Q12 -42 13 -36 L14 -8Z" fill={outline} />
        {/* Toque pleat lines (detail only) */}
        {showDetail && (
          <>
            <line x1="-5" y1="-38" x2="-5" y2="-12" stroke={outline} strokeWidth="0.5" opacity="0.4" />
            <line x1="0" y1="-40" x2="0" y2="-12" stroke={outline} strokeWidth="0.5" opacity="0.4" />
            <line x1="5" y1="-38" x2="5" y2="-12" stroke={outline} strokeWidth="0.5" opacity="0.4" />
          </>
        )}
        {/* Toque top puff */}
        <ellipse cx="0" cy="-44" rx="10" ry="5" fill={outline} />
        {/* Toque band (accent) */}
        <rect x="-14" y="-10" width="28" height="5" rx="1" fill={accent} />
      </g>
    </svg>
  );
}

function NanaSvg({ size, outline, accent, shapeFill }: SvgColorProps) {
  const showDetail = size >= 40;
  const glassesStroke = size < 40 ? 3.0 : 2.2;
  const bridgeStroke = size < 40 ? 2.5 : 2.0;
  return (
    <svg width={size} height={size} viewBox="-30 -30 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="nana-clip">
          <circle cx="0" cy="0" r="30" />
        </clipPath>
      </defs>
      <g clipPath="url(#nana-clip)">
        <circle cx="0" cy="0" r="30" fill="#F5F5F5" />
        {/* Shoulders/cardigan */}
        <path d="M-30 16 Q-30 8 -18 6 L18 6 Q30 8 30 16 L30 34 L-30 34Z" fill={outline} />
        {/* Cardigan opening lines */}
        <path d="M-4 6 L-2 28" fill="none" stroke={shapeFill} strokeWidth="1" opacity="0.6" />
        <path d="M4 6 L2 28" fill="none" stroke={shapeFill} strokeWidth="1" opacity="0.6" />
        {/* Pearl necklace hint */}
        <circle cx="-4" cy="10" r="1.2" fill={shapeFill} opacity="0.5" />
        <circle cx="0" cy="11" r="1.2" fill={shapeFill} opacity="0.5" />
        <circle cx="4" cy="10" r="1.2" fill={shapeFill} opacity="0.5" />
        {/* Neck */}
        <rect x="-6" y="0" width="12" height="10" rx="3" fill={outline} />
        {/* Head */}
        <ellipse cx="0" cy="-6" rx="16" ry="14" fill={outline} />
        {/* Hair volume */}
        <ellipse cx="0" cy="-10" rx="18" ry="13" fill={outline} />
        {/* Hair texture lines (detail only) */}
        {showDetail && (
          <>
            <path d="M-14 -16 Q-8 -22 0 -22 Q8 -22 14 -16" fill="none" stroke={outline} strokeWidth="0.6" opacity="0.4" />
            <path d="M-12 -12 Q-6 -18 0 -18 Q6 -18 12 -12" fill="none" stroke={outline} strokeWidth="0.6" opacity="0.4" />
          </>
        )}
        {/* Bun */}
        <circle cx="0" cy="-26" r="8" fill={outline} />
        {/* Bun swirl detail (detail only) */}
        {showDetail && (
          <path d="M-3 -28 Q0 -32 3 -28 Q1 -24 -2 -26" fill="none" stroke={outline} strokeWidth="0.7" opacity="0.5" />
        )}
        {/* Hair pin (accent) */}
        <line x1="5" y1="-30" x2="8" y2="-22" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="5" cy="-30" r="1.5" fill={accent} />
        {/* Left lens — cat-eye (accent) */}
        <path d="M-14 -4 Q-14 -10 -9 -10 Q-4 -10 -4 -4 Q-4 1 -9 1 Q-14 1 -14 -4Z" fill="none" stroke={accent} strokeWidth={glassesStroke} />
        {/* Right lens — cat-eye (accent) */}
        <path d="M4 -4 Q4 -10 9 -10 Q14 -10 14 -4 Q14 1 9 1 Q4 1 4 -4Z" fill="none" stroke={accent} strokeWidth={glassesStroke} />
        {/* Bridge (accent) */}
        <path d="M-4 -5 Q0 -7 4 -5" fill="none" stroke={accent} strokeWidth={bridgeStroke} strokeLinecap="round" />
        {/* Cat-eye upticks (accent) */}
        <line x1="-14" y1="-6" x2="-17" y2="-9" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
        <line x1="14" y1="-6" x2="17" y2="-9" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function ChadSvg({ size, outline, accent, shapeFill }: SvgColorProps) {
  const showDetail = size >= 40;
  return (
    <svg width={size} height={size} viewBox="-30 -30 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="chad-clip">
          <circle cx="0" cy="0" r="30" />
        </clipPath>
      </defs>
      <g clipPath="url(#chad-clip)">
        <circle cx="0" cy="0" r="30" fill="#F5F5F5" />
        {/* Wide shoulders / tank top */}
        <path d="M-32 12 Q-30 4 -20 2 L20 2 Q30 4 32 12 L32 34 L-32 34Z" fill={outline} />
        {/* Tank top neckline */}
        <path d="M-10 2 Q-6 -2 0 0 Q6 -2 10 2" fill="none" stroke={shapeFill} strokeWidth="1.5" strokeLinecap="round" />
        {/* Thick neck */}
        <rect x="-9" y="-4" width="18" height="10" rx="4" fill={outline} />
        {/* Traps */}
        <path d="M-20 4 Q-14 -2 -9 0" fill={outline} stroke="none" />
        <path d="M20 4 Q14 -2 9 0" fill={outline} stroke="none" />
        {/* Head — squarer jaw */}
        <path d="M-13 -6 Q-14 -16 0 -18 Q14 -16 13 -6 Q12 2 0 4 Q-12 2 -13 -6Z" fill={outline} />
        {/* Cap crown (backwards) */}
        <path d="M-14 -14 Q-14 -26 0 -28 Q14 -26 14 -14Z" fill={outline} />
        {/* Cap structure line (detail only) */}
        {showDetail && (
          <path d="M-14 -14 L14 -14" stroke={outline} strokeWidth="0.8" opacity="0.5" />
        )}
        {/* Cap button */}
        <circle cx="0" cy="-28" r="2" fill={outline} opacity="0.7" />
        {/* Backwards brim (accent) */}
        <path d="M-14 -16 L-26 -14 L-26 -11 L-14 -12Z" fill={accent} />
        {/* Brim edge detail (detail only) */}
        {showDetail && (
          <line x1="-26" y1="-14" x2="-26" y2="-11" stroke={accent} strokeWidth="0.5" opacity="0.7" />
        )}
      </g>
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

// Tie-breaking: JP wins ties by iteration order. This matches the SQL
// CASE WHEN evaluation order in get_bottom_shelf RPC. Do not reorder.
export function getHarshestJudge(
  jpTqi: number | null,
  nanaTqi: number | null,
  chadTqi: number | null
): JudgeName | null {
  const entries: [JudgeName, number | null][] = [
    ["jp", jpTqi], ["nana", nanaTqi], ["chad", chadTqi],
  ];
  let harshest: JudgeName | null = null;
  let lowest = Infinity;
  for (const [name, tqi] of entries) {
    if (tqi !== null && tqi < lowest) {
      lowest = tqi;
      harshest = name;
    }
  }
  return harshest;
}

export function getJudgeVerdict(toast: ToastRecord, judge: JudgeName): string | null {
  switch (judge) {
    case "jp": return toast.jp_verdict;
    case "nana": return toast.nana_verdict;
    case "chad": return toast.chad_verdict;
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
  const judges: [JudgeName, number | null][] = [
    ["jp", jpTqi],
    ["nana", nanaTqi],
    ["chad", chadTqi],
  ];
  const anyScored = judges.some(([, tqi]) => tqi !== null);

  return (
    <div style={{ display: "flex", gap: 4 }}>
      {judges.map(([name, tqi]) => (
        <JudgeAvatar
          key={name}
          judge={name}
          size={size}
          variant={!anyScored ? "muted" : tqi !== null ? "default" : "muted"}
        />
      ))}
    </div>
  );
}
