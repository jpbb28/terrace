import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import BlogIndexContent from "./BlogIndexContent";

export const metadata: Metadata = {
  title: "Notes – Terrasse Season",
  description: "Guides, neighbourhood breakdowns, and everything else worth knowing about Montréal terrasse season.",
  alternates: { canonical: "https://terrasseseason.com/blog" },
  openGraph: {
    title: "Notes – Terrasse Season",
    description: "Guides and neighbourhood breakdowns for Montréal terrasse season.",
    url: "https://terrasseseason.com/blog",
  },
};

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <BlogIndexContent />
    </div>
  );
}
