import Link from "next/link";
import { getTopToastToday, getLeaderboard, getGallery } from "@/lib/queries";
import HeroSection from "@/components/hero-section";
import LeaderboardSection from "@/components/leaderboard-section";
import GallerySection from "@/components/gallery-section";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function Home() {
  const [topToast, leaderboardData, galleryData] = await Promise.all([
    getTopToastToday(),
    getLeaderboard("today", 20, 0),
    getGallery("recent", 20, 0),
  ]);

  return (
    <main className="mx-auto px-4 pb-20 md:pb-0" style={{ maxWidth: 960 }}>
      <HeroSection toast={topToast} />
      <LeaderboardSection initialData={leaderboardData} />
      <GallerySection initialData={galleryData} />

      {/* Mobile sticky CTA */}
      <div
        className="md:hidden"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.08)",
          padding: 16,
          zIndex: 50,
        }}
      >
        <Link
          href="/submit"
          style={{
            display: "block",
            backgroundColor: "var(--pink)",
            color: "#FFFFFF",
            borderRadius: 12,
            padding: "12px 0",
            fontWeight: 500,
            fontSize: 16,
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          Rate My Toast
        </Link>
      </div>
    </main>
  );
}
