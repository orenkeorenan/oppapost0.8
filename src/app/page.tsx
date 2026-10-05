
import type { Metadata } from "next";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { LandingPage } from "./components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Korean Package Forwarding & Personal Shopper",
  description:
    "Get your own Korean address, consolidate packages in our warehouse, and ship worldwide. Personal Shopper service for stores you can't buy from.",

  openGraph: {
    title: "OPPAPOST — Korean Package Forwarding & Personal Shopper",
    description:
      "Get your own Korean address, consolidate packages in our warehouse, and ship worldwide. Personal Shopper service for stores you can't buy from.",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "OPPAPOST — Korean Package Forwarding & Personal Shopper",
    description:
      "Get your own Korean address, consolidate packages in our warehouse, and ship worldwide. Personal Shopper service for stores you can't buy from.",
  },
};


export default function Home() {
  return (
    <div className="site-page">
      <Navbar />

      <main>
        <LandingPage />
      </main>

      <Footer />
    </div>
  );
}
