import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import TermsContent from "./TermsContent";

export const metadata: Metadata = {
  title: "Terms & Disclaimer – Terrasse Season",
  description: "Terms of use and accuracy disclaimer for Terrasse Season.",
  alternates: { canonical: "https://terrasseseason.com/terms" },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <TermsContent />
    </div>
  );
}
