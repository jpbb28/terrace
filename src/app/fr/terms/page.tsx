import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import TermsContent from "@/app/terms/TermsContent";

export const metadata: Metadata = {
  title: "Conditions et avertissement – Terrasse Season",
  description:
    "Conditions d'utilisation et avertissement sur l'exactitude des données de Terrasse Season.",
  alternates: {
    canonical: "https://terrasseseason.com/fr/terms",
    languages: {
      "en-CA": "https://terrasseseason.com/terms",
      "fr-CA": "https://terrasseseason.com/fr/terms",
      "x-default": "https://terrasseseason.com/terms",
    },
  },
};

export default function TermsPageFr() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav back="/fr" pageLang="fr" altHref="/terms" />
      <TermsContent />
    </div>
  );
}
