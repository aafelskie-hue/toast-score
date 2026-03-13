import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getToastById } from "@/lib/queries";
import type { JudgeName } from "@/lib/types";
import VerdictCard from "@/components/verdict-card";
import ShareButton from "@/components/share-button";
import TierBadge from "@/components/tier-badge";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const toast = await getToastById(id);

  if (!toast) {
    return { title: "Toast Not Found" };
  }

  // Find the judge with the highest TQI for the description
  const judges: JudgeName[] = ["jp", "nana", "chad"];
  let bestVerdict = "";
  let bestTqi = -1;
  for (const j of judges) {
    const tqi = toast[`${j}_tqi` as keyof typeof toast] as number | null;
    const verdict = toast[`${j}_verdict` as keyof typeof toast] as
      | string
      | null;
    if (tqi !== null && tqi > bestTqi && verdict) {
      bestTqi = tqi;
      bestVerdict = verdict;
    }
  }

  const description =
    bestVerdict.length > 200
      ? bestVerdict.slice(0, 197) + "..."
      : bestVerdict;

  return {
    title: `Toast Score: ${toast.official_tqi.toFixed(2)} — ${toast.official_tier}`,
    description,
    openGraph: {
      title: `Toast Score: ${toast.official_tqi.toFixed(2)} — ${toast.official_tier}`,
      description,
      images: [{ url: toast.image_url }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Toast Score: ${toast.official_tqi.toFixed(2)} — ${toast.official_tier}`,
      description,
      images: [toast.image_url],
    },
  };
}

export default async function ToastPage({ params }: PageProps) {
  const { id } = await params;
  const toast = await getToastById(id);

  if (!toast) {
    notFound();
  }

  const judges: JudgeName[] = ["jp", "nana", "chad"];

  return (
    <main
      className="mx-auto px-4"
      style={{ maxWidth: 960, paddingTop: 24, paddingBottom: 48 }}
    >
      {/* Toast photo */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <img
          src={toast.image_url}
          alt={toast.nickname}
          style={{
            maxWidth: 400,
            width: "100%",
            borderRadius: 8,
            aspectRatio: "1 / 1",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Official TQI */}
      <div
        className="text-5xl md:text-7xl"
        style={{
          fontWeight: 500,
          lineHeight: 1,
          textAlign: "center",
          marginTop: 20,
        }}
      >
        {toast.official_tqi.toFixed(2)}
      </div>

      {/* Nickname */}
      <p style={{ fontSize: 16, color: "#666", textAlign: "center", marginTop: 8 }}>
        {toast.nickname}
      </p>

      {/* Tier Badge */}
      <div style={{ textAlign: "center", marginTop: 4 }}>
        <TierBadge tier={toast.official_tier} />
      </div>

      {/* Verdict Cards */}
      <div
        className="grid grid-cols-1 md:grid-cols-3"
        style={{ gap: 16, marginTop: 32 }}
      >
        {judges.map((judge, i) => {
          const verdict = toast[`${judge}_verdict` as keyof typeof toast] as
            | string
            | null;
          const tqi = toast[`${judge}_tqi` as keyof typeof toast] as
            | number
            | null;
          const tier = toast[`${judge}_tier` as keyof typeof toast] as
            | string
            | null;
          const metrics = toast[`${judge}_metrics` as keyof typeof toast] as
            | typeof toast.jp_metrics
            | null;

          return (
            <VerdictCard
              key={judge}
              judge={judge}
              verdict={verdict}
              tqi={tqi}
              tier={tier}
              subMetrics={metrics}
              failed={!verdict && !tqi}
              animationDelay={i * 150}
              shareUrl={`/toast/${id}`}
            />
          );
        })}
      </div>

      {/* Share All */}
      <ShareButton
        title={`Toast Score — Official TQI: ${toast.official_tqi.toFixed(2)}`}
        text={`Three judges. Three verdicts. One toast. Official TQI: ${toast.official_tqi.toFixed(2)}.`}
        url={`/toast/${id}`}
        variant="standalone"
      />

      {/* CTA */}
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <Link
          href="/submit"
          style={{
            display: "inline-block",
            backgroundColor: "var(--pink)",
            color: "#FFFFFF",
            borderRadius: 12,
            padding: "12px 32px",
            fontWeight: 500,
            fontSize: 16,
            textDecoration: "none",
          }}
        >
          Rate Your Own Toast
        </Link>
      </div>
    </main>
  );
}
