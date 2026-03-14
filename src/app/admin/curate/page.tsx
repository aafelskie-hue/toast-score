"use client";

import { useState } from "react";

interface CurationPost {
  category: string;
  toastId: string;
  nickname: string;
  tqi: number;
  tier: string;
  imageDataUrl: string;
  caption: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  best: "BEST OF THE WEEK",
  criminal: "CRIMINAL REPORT",
  judges_pick: "JUDGE'S PICK",
};

export default function CuratePage() {
  const [key, setKey] = useState("");
  const [posts, setPosts] = useState<CurationPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleLoad() {
    if (!key.trim()) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    setPosts([]);

    try {
      const res = await fetch(`/api/curate?key=${encodeURIComponent(key)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setPosts(data.posts || []);
      if (data.message) setMessage(data.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function copyCaption(category: string, caption: string) {
    await navigator.clipboard.writeText(caption);
    setCopied(category);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <h1 className="text-2xl font-bold mb-6 text-neutral-900">
        Weekly Curation
      </h1>

      <div className="flex gap-3 mb-8">
        <input
          type="password"
          placeholder="Secret key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLoad()}
          className="border border-neutral-300 rounded px-3 py-2 text-sm w-64 text-neutral-900"
        />
        <button
          onClick={handleLoad}
          disabled={loading}
          className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load"}
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-4">{error}</p>
      )}

      {message && (
        <p className="text-neutral-500 text-sm mb-4">{message}</p>
      )}

      {posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.category}
              className="bg-white border border-neutral-200 rounded-lg p-4"
            >
              <h2 className="text-sm font-bold tracking-widest text-neutral-500 mb-3">
                {CATEGORY_LABELS[post.category] || post.category}
              </h2>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.imageDataUrl}
                alt={`${post.category} - ${post.nickname}`}
                className="w-full max-w-[360px] rounded mb-3"
              />

              <textarea
                readOnly
                value={post.caption}
                rows={6}
                className="w-full border border-neutral-200 rounded p-2 text-sm text-neutral-700 resize-none mb-2"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => copyCaption(post.category, post.caption)}
                  className="bg-neutral-100 text-neutral-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-neutral-200"
                >
                  {copied === post.category ? "Copied" : "Copy Caption"}
                </button>

                <a
                  href={post.imageDataUrl}
                  download={`toast-${post.category}-${post.toastId.slice(0, 8)}.png`}
                  className="bg-neutral-100 text-neutral-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-neutral-200"
                >
                  Save Image
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
