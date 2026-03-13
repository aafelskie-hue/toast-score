"use client";

import { useState } from "react";
import { ToastRecord } from "@/lib/types";
import ToastCard from "./toast-card";

interface GallerySectionProps {
  initialData: { toasts: ToastRecord[]; total: number };
}

export default function GallerySection({ initialData }: GallerySectionProps) {
  const [toasts, setToasts] = useState(initialData.toasts);
  const [total, setTotal] = useState(initialData.total);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/gallery?sort=recent&limit=20&offset=${toasts.length}`
      );
      const data = await res.json();
      setToasts((prev) => [...prev, ...data.toasts]);
      setTotal(data.total);
    } catch {
      // keep existing data
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ marginTop: 40 }}>
      <h2 style={{ fontWeight: 500, fontSize: 20, marginBottom: 12 }}>
        Recent Submissions
      </h2>

      {toasts.length === 0 ? (
        <p style={{ color: "#666", fontStyle: "italic", fontSize: 14 }}>
          The gallery is empty. Someone should make toast.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-4">
          {toasts.map((toast) => (
            <ToastCard key={toast.id} toast={toast} />
          ))}
        </div>
      )}

      {toasts.length < total && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button
            onClick={loadMore}
            disabled={loading}
            style={{
              fontWeight: 500,
              fontSize: 14,
              padding: "8px 24px",
              borderRadius: 8,
              border: "1px solid #E5E5E5",
              backgroundColor: "transparent",
              cursor: loading ? "default" : "pointer",
              color: "var(--foreground)",
            }}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </section>
  );
}
