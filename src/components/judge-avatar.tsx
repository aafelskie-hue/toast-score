import { JudgeName } from "@/lib/types";

interface JudgeAvatarProps {
  judge: JudgeName;
  size?: number;
}

function JeanPierreSvg({ size }: { size: number }) {
  const stroke = size >= 64 ? 2 : 1;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#F5F5F5" stroke="#111111" strokeWidth={stroke} />
      {/* Chef toque */}
      <ellipse cx="32" cy="40" rx="12" ry="4" fill="#111111" />
      <rect x="22" y="24" width="20" height="16" rx="2" fill="#FFFFFF" stroke="#111111" strokeWidth={stroke} />
      <ellipse cx="26" cy="24" rx="6" ry="8" fill="#FFFFFF" stroke="#111111" strokeWidth={stroke} />
      <ellipse cx="38" cy="24" rx="6" ry="8" fill="#FFFFFF" stroke="#111111" strokeWidth={stroke} />
      <ellipse cx="32" cy="22" rx="6" ry="9" fill="#FFFFFF" stroke="#111111" strokeWidth={stroke} />
      {/* Pink band */}
      <rect x="22" y="36" width="20" height="3" rx="1" fill="#D4537E" />
    </svg>
  );
}

function NanaSvg({ size }: { size: number }) {
  const stroke = size >= 64 ? 2 : 1;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#F5F5F5" stroke="#111111" strokeWidth={stroke} />
      {/* Bun hairstyle */}
      <circle cx="32" cy="18" r="8" fill="#FFFFFF" stroke="#111111" strokeWidth={stroke} />
      <path d="M24 22 Q24 30 32 32 Q40 30 40 22" fill="#FFFFFF" stroke="#111111" strokeWidth={stroke} />
      {/* Reading glasses - pink frames */}
      <ellipse cx="26" cy="36" rx="7" ry="5" fill="none" stroke="#D4537E" strokeWidth={stroke + 0.5} />
      <ellipse cx="38" cy="36" rx="7" ry="5" fill="none" stroke="#D4537E" strokeWidth={stroke + 0.5} />
      <line x1="33" y1="36" x2="31" y2="36" stroke="#D4537E" strokeWidth={stroke} />
      <line x1="19" y1="35" x2="16" y2="33" stroke="#D4537E" strokeWidth={stroke} />
      <line x1="45" y1="35" x2="48" y2="33" stroke="#D4537E" strokeWidth={stroke} />
    </svg>
  );
}

function ChadSvg({ size }: { size: number }) {
  const stroke = size >= 64 ? 2 : 1;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#F5F5F5" stroke="#111111" strokeWidth={stroke} />
      {/* Wide shoulders */}
      <path d="M16 52 Q16 44 24 42 L40 42 Q48 44 48 52" fill="#FFFFFF" stroke="#111111" strokeWidth={stroke} />
      {/* Head shape */}
      <circle cx="32" cy="30" r="10" fill="#FFFFFF" stroke="#111111" strokeWidth={stroke} />
      {/* Backwards baseball cap */}
      <path d="M22 28 Q22 18 32 18 Q42 18 42 28" fill="#FFFFFF" stroke="#111111" strokeWidth={stroke} />
      <rect x="22" y="26" width="20" height="3" rx="1" fill="#111111" />
      {/* Pink brim (backwards) */}
      <path d="M38 27 Q44 24 48 27" fill="#D4537E" stroke="#D4537E" strokeWidth={stroke} />
    </svg>
  );
}

export default function JudgeAvatar({ judge, size = 40 }: JudgeAvatarProps) {
  switch (judge) {
    case "jp":
      return <JeanPierreSvg size={size} />;
    case "nana":
      return <NanaSvg size={size} />;
    case "chad":
      return <ChadSvg size={size} />;
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
