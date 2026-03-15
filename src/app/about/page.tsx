import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About – Terrasse Season",
  description: "Terrasse Season is a directory of outdoor dining spots across Montréal. Who built it, how the data works, and how to contribute.",
  alternates: { canonical: "https://terrasseseason.com/about" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <AboutContent />
    </div>
  );
}
