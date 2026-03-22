import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getToastById, getAppealByToastId, getCertificateByToastId } from "@/lib/queries";
import { getMembershipStatus } from "@/lib/membership";
import type { JudgeName, JudgeVerdict } from "@/lib/types";
import { type JudgeId } from "@/lib/judges";
import VerdictCard from "@/components/verdict-card";
import ShareButton from "@/components/share-button";
import TierBadge from "@/components/tier-badge";
import AppealButton from "@/components/appeal-button";
import CertificateButton from "@/components/certificate-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface PageProps {
  params: Promise<{ id: string }>;
}

function getVerdictsFromToast(toast: Awaited<ReturnType<typeof getToastById>>): JudgeVerdict[] {
  if (!toast) return [];

  // Use verdicts JSONB if available
  if (toast.verdicts && Array.isArray(toast.verdicts) && toast.verdicts.length > 0) {
    return toast.verdicts;
  }

  // Fallback: build from flat columns (legacy rows)
  const verdicts: JudgeVerdict[] = [];
  const judges: { id: JudgeName; name: string }[] = [
    { id: "jp", name: "Jean-Pierre" },
    { id: "nana", name: "Nana" },
    { id: "chad", name: "Chad" },
  ];
  for (const j of judges) {
    const verdict = toast[`${j.id}_verdict` as keyof typeof toast] as string | null;
    const tqi = toast[`${j.id}_tqi` as keyof typeof toast] as number | null;
    const tier = toast[`${j.id}_tier` as keyof typeof toast] as string | null;
    const metrics = toast[`${j.id}_metrics` as keyof typeof toast] as typeof toast.jp_metrics | null;
    if (verdict && tqi !== null && tier && metrics) {
      verdicts.push({
        judge_id: j.id,
        judge_name: j.name,
        verdict,
        tqi,
        tier,
        metrics,
      });
    }
  }
  return verdicts;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const toast = await getToastById(id);

  if (!toast) {
    return { title: "Toast Not Found" };
  }

  const verdicts = getVerdictsFromToast(toast);
  const best = verdicts.reduce<JudgeVerdict | null>(
    (acc, v) => (!acc || v.tqi > acc.tqi ? v : acc),
    null
  );

  const verdictSnippet = best
    ? best.verdict.length > 80
      ? best.verdict.slice(0, 80) + "..."
      : best.verdict
    : "";
  const judgeName = best?.judge_name ?? "Unknown";
  const title = `${toast.nickname}'s toast scored ${toast.official_tqi.toFixed(2)} — ${toast.official_tier}`;
  const description = `${judgeName}: '${verdictSnippet}' | Rate your toast at toastscore.com`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: `/api/og/${id}`, width: 1200, height: 630 }],
      url: `https://www.toastscore.com/toast/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og/${id}`],
    },
  };
}

export default async function ToastPage({ params }: PageProps) {
  const { id } = await params;
  const [toast, appeal, certificate, membership] = await Promise.all([
    getToastById(id),
    getAppealByToastId(id),
    getCertificateByToastId(id),
    getMembershipStatus(),
  ]);

  if (!toast) {
    notFound();
  }

  const verdicts = getVerdictsFromToast(toast);

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
        className="grid grid-cols-1 md:grid-cols-3 items-start"
        style={{ gap: 16, marginTop: 32 }}
      >
        {verdicts.map((v, i) => (
          <VerdictCard
            key={v.judge_id}
            judge={v.judge_id as JudgeId}
            verdict={v.verdict}
            tqi={v.tqi}
            tier={v.tier}
            subMetrics={v.metrics}
            failed={false}
            animationDelay={i * 150}
            shareUrl={`/toast/${id}`}
            isWinner={false}
          />
        ))}
      </div>

      {/* Appeal section */}
      {appeal && (
        <div style={{ marginTop: 40 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: 1,
              textTransform: "uppercase",
              textAlign: "center",
              marginBottom: 16,
              color: "#888",
            }}
          >
            Appeal Verdict — {new Date(appeal.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h2>
          <div
            style={{
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 500 }}>
              {appeal.official_tqi.toFixed(2)}
            </span>
            <div style={{ marginTop: 4 }}>
              <TierBadge tier={appeal.official_tier} />
            </div>
          </div>
          <div
            className="grid grid-cols-1 md:grid-cols-3 items-start"
            style={{ gap: 16 }}
          >
            {appeal.verdicts.map((v, i) => (
              <VerdictCard
                key={`appeal-${v.judge_id}`}
                judge={v.judge_id as JudgeId}
                verdict={v.verdict}
                tqi={v.tqi}
                tier={v.tier}
                subMetrics={v.metrics}
                failed={false}
                animationDelay={i * 150}
                shareUrl={`/toast/${id}`}
                isWinner={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Appeal button */}
      <div style={{ marginTop: 24 }}>
        <AppealButton toastId={id} hasAppeal={!!appeal} />
      </div>

      {/* Certificate button */}
      <div style={{ marginTop: 16 }}>
        <CertificateButton
          toastId={id}
          hasCertificate={!!certificate}
          certificateUrl={
            certificate
              ? `/api/certificate/${id}?session_id=${certificate.stripe_session_id}`
              : null
          }
        />
      </div>

      {/* Membership teaser — hidden for active members */}
      {!membership.isMember && (
        <p
          style={{
            fontSize: 13,
            color: "#888",
            textAlign: "center",
            marginTop: 16,
            marginBottom: 0,
          }}
        >
          <a
            href="/membership"
            style={{ color: "var(--pink)", textDecoration: "none" }}
          >
            Members
          </a>
          {" "}unlock 5 additional judges.
        </p>
      )}

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
