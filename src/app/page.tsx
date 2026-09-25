import type { Metadata } from "next";
import { Navbar } from "./components/layout/Navbar";
import { Hero } from "./components/landing/Hero";
import { HowItWorks } from "./components/landing/HowItWorks";
import { PersonalShopper } from "./components/landing/PersonalShopper";
import { WhyOppapost } from "./components/landing/WhyOppapost";
import { FinalCta } from "./components/landing/FinalCta";
import { Footer } from "./components/layout/Footer";
import { ShippingSection } from "./components/landing/ShippingSection";


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
        <Hero />
        <HowItWorks />
        <PersonalShopper />
        <WhyOppapost />
        <ShippingSection />
        <FinalCta />
      </main>

      <Footer />
    </div>
  );
}
