"use client";

import { useState, useEffect } from "react";
import { type JudgeId, JUDGES, FREE_JUDGE_IDS, MEMBER_JUDGE_IDS, ALL_JUDGE_IDS } from "@/lib/judges";
import JudgeAvatar from "./judge-avatar";

interface JudgeSelectorProps {
  onSelectionChange: (judges: JudgeId[]) => void;
}

export default function JudgeSelector({ onSelectionChange }: JudgeSelectorProps) {
  const [isMember, setIsMember] = useState(false);
  const [selected, setSelected] = useState<Set<JudgeId>>(
    new Set(FREE_JUDGE_IDS)
  );
  const [tooltip, setTooltip] = useState<JudgeId | null>(null);

  useEffect(() => {
    fetch("/api/membership/status")
      .then((res) => res.json())
      .then((data) => setIsMember(data.isMember))
      .catch(() => setIsMember(false));
  }, []);

  function toggleJudge(id: JudgeId) {
    if (!isMember && MEMBER_JUDGE_IDS.includes(id)) {
      setTooltip(id);
      setTimeout(() => setTooltip(null), 3000);
      return;
    }

    const next = new Set(selected);
    if (next.has(id)) {
      // Allow deselecting down to 0 — submission is blocked unless exactly 3
      next.delete(id);
    } else {
      if (next.size >= 3) {
        // At capacity — can't add without deselecting first
        return;
      }
      next.add(id);
    }
    setSelected(next);
    onSelectionChange(Array.from(next));
  }

  // If not a member, don't show the selector (default 3 judges used)
  if (!isMember) {
    return (
      <div style={{ marginBottom: 8 }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "#888",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 8,
          }}
        >
          Your Panel
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {FREE_JUDGE_IDS.map((id) => (
            <JudgeCard key={id} id={id} isSelected locked={false} />
          ))}
          {MEMBER_JUDGE_IDS.map((id) => (
            <div key={id} style={{ position: "relative" }}>
              <JudgeCard
                id={id}
                isSelected={false}
                locked
                onClick={() => toggleJudge(id)}
              />
              {tooltip === id && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "var(--black)",
                    color: "#FFFFFF",
                    fontSize: 11,
                    padding: "6px 10px",
                    borderRadius: 6,
                    whiteSpace: "nowrap",
                    marginBottom: 4,
                    zIndex: 10,
                  }}
                >
                  <a
                    href="/membership"
                    style={{ color: "var(--pink)", textDecoration: "none" }}
                  >
                    Bureau Members only
                  </a>
                  . $2.99/mo.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <p
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "#888",
            textTransform: "uppercase",
            letterSpacing: 1,
            margin: 0,
          }}
        >
          Select Your Panel
        </p>
        <span
          style={{
            fontSize: 12,
            color: selected.size === 3 ? "#888" : "var(--pink)",
          }}
        >
          {selected.size} of 3 selected
        </span>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {ALL_JUDGE_IDS.map((id) => (
          <JudgeCard
            key={id}
            id={id}
            isSelected={selected.has(id)}
            locked={false}
            isMemberJudge={MEMBER_JUDGE_IDS.includes(id)}
            onClick={() => toggleJudge(id)}
          />
        ))}
      </div>
    </div>
  );
}

function JudgeCard({
  id,
  isSelected,
  locked,
  isMemberJudge = false,
  onClick,
}: {
  id: JudgeId;
  isSelected: boolean;
  locked: boolean;
  isMemberJudge?: boolean;
  onClick?: () => void;
}) {
  const judge = JUDGES[id];
  return (
    <button
      onClick={onClick}
      type="button"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 8,
        border: isSelected
          ? "2px solid var(--pink)"
          : "2px solid #E5E5E5",
        backgroundColor: locked ? "#F5F5F5" : "#FFFFFF",
        opacity: locked ? 0.5 : 1,
        cursor: onClick ? "pointer" : "default",
        minWidth: 0,
      }}
    >
      <JudgeAvatar
        judge={id}
        size={32}
        variant={isSelected ? "default" : "muted"}
      />
      <div style={{ textAlign: "left", minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {judge.displayName}
          {isMemberJudge && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 500,
                color: "var(--pink)",
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              MEMBER
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#888",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 120,
          }}
        >
          {judge.tagline}
        </div>
      </div>
    </button>
  );
}
