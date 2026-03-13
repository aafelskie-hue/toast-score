interface ToastStampProps {
  score: number | null;
  opacity?: number;
  height?: number;
  color?: string;
}

export default function ToastStamp({ score, opacity = 0.4, height = 100, color = "#111111" }: ToastStampProps) {
  const width = height * 0.8;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 80 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity, transform: "rotate(-2.5deg)" }}
    >
      {/* Outer border */}
      <rect x="2" y="2" width="76" height="96" rx="4" stroke={color} strokeWidth="4" fill="none" />
      {/* Inner border */}
      <rect x="6" y="6" width="68" height="88" rx="3" stroke={color} strokeWidth="1" fill="none" />
      {/* TOAST text */}
      <text
        x="40"
        y="30"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontWeight="500"
        fontSize="12"
        letterSpacing="3"
        fill={color}
        style={{ textTransform: "uppercase" }}
      >
        TOAST
      </text>
      {/* Top rule */}
      <line x1="14" y1="36" x2="66" y2="36" stroke={color} strokeWidth="1" />
      {/* Score number */}
      <text
        x="40"
        y="65"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontWeight="500"
        fontSize="22"
        fill={color}
      >
        {score !== null ? score.toFixed(2) : "--"}
      </text>
      {/* Bottom rule */}
      <line x1="14" y1="72" x2="66" y2="72" stroke={color} strokeWidth="1" />
      {/* SCORE text */}
      <text
        x="40"
        y="86"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontWeight="500"
        fontSize="10"
        letterSpacing="2"
        fill={color}
        style={{ textTransform: "uppercase" }}
      >
        SCORE
      </text>
    </svg>
  );
}
