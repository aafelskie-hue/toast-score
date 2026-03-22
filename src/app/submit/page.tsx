"use client";

import { useState, useEffect } from "react";

export const dynamic = "force-dynamic";
import VerdictCard from "@/components/verdict-card";
import ShareButton from "@/components/share-button";
import TierBadge from "@/components/tier-badge";
import JudgeSelector from "@/components/judge-selector";
import { type JudgeId, FREE_JUDGE_IDS } from "@/lib/judges";
import { SubMetrics, JudgeVerdict } from "@/lib/types";

interface JudgeResultData {
  verdict: string;
  tqi: number;
  tier: string;
  sub_metrics: SubMetrics;
}

interface ToastResult {
  id: string;
  image_url: string;
  nickname: string;
  official_tqi: number;
  official_tier: string;
  judges: Record<string, JudgeResultData | null>;
  verdicts: JudgeVerdict[];
}

const LOADING_MESSAGES = [
  "Jean-Pierre is examining your crumb structure...",
  "Nana is putting on her reading glasses...",
  "Chad is doing pre-toast stretches...",
  "Marco is warming up his fury...",
  "Professor Crumb is consulting the literature...",
  "Auntie Mei is comparing this to hers...",
  "The Algorithm is running diagnostics...",
  "Detective Rye is investigating the scene...",
  "Consulting the bread sommelier...",
  "Checking if you've eaten today...",
  "Loading maximum hype...",
];

function LoadingOverlay() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: "var(--white)" }}
    >
      {/* Spinning toast */}
      <div
        className="mb-8"
        style={{ fontSize: 64, animation: "spin 2s linear infinite" }}
      >
        🍞
      </div>
      <p
        style={{
          fontSize: 18,
          fontWeight: 400,
          color: "var(--black)",
          textAlign: "center",
          maxWidth: 360,
          padding: "0 20px",
        }}
      >
        {LOADING_MESSAGES[messageIndex]}
      </p>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function SubmitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [nickname, setNickname] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToastResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedJudges, setSelectedJudges] = useState<JudgeId[]>([
    ...FREE_JUDGE_IDS,
  ]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : null);
    setResult(null);
    setError(null);
  }

  function resetForm() {
    setFile(null);
    setNickname("");
    setPreview(null);
    setResult(null);
    setError(null);
    setSelectedJudges([...FREE_JUDGE_IDS]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);
    if (nickname.trim()) {
      formData.append("nickname", nickname);
    }
    formData.append("judges", selectedJudges.join(","));

    try {
      const res = await fetch("/api/rate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {loading && <LoadingOverlay />}

      <main
        className="mx-auto px-4 py-8"
        style={{ maxWidth: 960 }}
      >
        {!result ? (
          <>
            <h1
              className="mb-6"
              style={{ fontSize: 32, fontWeight: 500 }}
            >
              Submit Your Toast
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4" style={{ maxWidth: 400 }}>
              <div>
                <label
                  className="block mb-1"
                  style={{ fontSize: 14, fontWeight: 500 }}
                >
                  Toast Image
                </label>
                <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
                  JPEG or PNG, max 5MB
                </p>
                <div className="flex gap-2">
                  <label
                    className="rounded-lg px-4 py-2 cursor-pointer"
                    style={{
                      backgroundColor: "var(--black)",
                      color: "var(--white)",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    Take Photo
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <label
                    className="rounded-lg px-4 py-2 cursor-pointer"
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      border: "1px solid #E5E5E5",
                    }}
                  >
                    Choose File
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {preview && (
                <div>
                  <img
                    src={preview}
                    alt="Preview"
                    className="rounded-lg"
                    style={{ maxWidth: 300, width: "100%" }}
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="nickname"
                  className="block mb-1"
                  style={{ fontSize: 14, fontWeight: 500 }}
                >
                  Nickname
                </label>
                <input
                  id="nickname"
                  type="text"
                  maxLength={20}
                  placeholder="Anonymous Toaster"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full rounded-lg px-3 py-2"
                  style={{
                    border: "1px solid #E5E5E5",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>

              <JudgeSelector onSelectionChange={setSelectedJudges} />

              <button
                type="submit"
                disabled={!file || loading || selectedJudges.length !== 3}
                className="rounded-lg px-6 py-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--black)",
                  color: "var(--white)",
                  fontSize: 14,
                  fontWeight: 500,
                  border: "none",
                }}
              >
                Rate My Toast
              </button>
            </form>

            {error && (
              <p className="mt-4" style={{ color: "var(--pink)", fontSize: 14 }}>
                {error}
              </p>
            )}
          </>
        ) : (
          <>
            {/* Results header — compact on mobile */}
            <div className="flex items-center gap-4 mb-4 md:flex-col md:text-center md:mb-8">
              <img
                src={result.image_url}
                alt="Your toast"
                className="rounded-lg shrink-0"
                style={{ width: 120, height: 120, objectFit: "cover" }}
              />
              <div>
                <div
                  className="text-4xl md:text-6xl"
                  style={{ fontWeight: 500, lineHeight: 1, marginBottom: 4 }}
                >
                  {result.official_tqi.toFixed(2)}
                </div>
                <TierBadge tier={result.official_tier} />
              </div>
            </div>

            {/* Verdict cards — dynamic from verdicts array */}
            <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-2 md:gap-3 mb-6 md:mb-8">
              {result.verdicts.map((v, index) => (
                <VerdictCard
                  key={v.judge_id}
                  judge={v.judge_id as JudgeId}
                  verdict={v.verdict}
                  tqi={v.tqi}
                  tier={v.tier}
                  subMetrics={v.metrics}
                  failed={false}
                  animationDelay={index * 200}
                  shareUrl={`/toast/${result.id}`}
                />
              ))}
              {/* Show failed judges that aren't in verdicts */}
              {Object.entries(result.judges)
                .filter(([id, data]) => data === null && !result.verdicts.some((v) => v.judge_id === id))
                .map(([id], index) => (
                  <VerdictCard
                    key={id}
                    judge={id as JudgeId}
                    verdict={null}
                    tqi={null}
                    tier={null}
                    subMetrics={null}
                    failed
                    animationDelay={(result.verdicts.length + index) * 200}
                    shareUrl={`/toast/${result.id}`}
                  />
                ))}
            </div>

            {/* Share All */}
            <ShareButton
              title={`Toast Score — Official TQI: ${result.official_tqi.toFixed(2)}`}
              text={`Three judges. Three verdicts. One toast. Official TQI: ${result.official_tqi.toFixed(2)}.`}
              url={`/toast/${result.id}`}
              variant="standalone"
            />

            {/* Rate another */}
            <div className="text-center">
              <button
                onClick={resetForm}
                className="rounded-lg px-6 py-3 cursor-pointer"
                style={{
                  backgroundColor: "var(--black)",
                  color: "var(--white)",
                  fontSize: 14,
                  fontWeight: 500,
                  border: "none",
                }}
              >
                Rate Another Toast
              </button>
            </div>
          </>
        )}
      </main>
    </>
  );
}
