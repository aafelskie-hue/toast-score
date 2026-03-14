import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Toast Score — Official Toast Evaluation",
  description: "Submit your toast. Three AI judges rate it. The world watches.",
  icons: { icon: "/icon.svg" },
  metadataBase: new URL("https://www.toastscore.com"),
  openGraph: {
    title: "Toast Score — Official Toast Evaluation",
    description: "Submit your toast. Three AI judges rate it. The world watches.",
    images: [{ url: "/api/og/default", width: 1200, height: 630 }],
    type: "website",
    url: "https://www.toastscore.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Toast Score — Official Toast Evaluation",
    description: "Submit your toast. Three AI judges rate it. The world watches.",
    images: ["/api/og/default"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Nav />
        {children}
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
