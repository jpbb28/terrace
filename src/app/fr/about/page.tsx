import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import AboutContent from "@/app/about/AboutContent";

export const metadata: Metadata = {
  title: "À propos – Terrasse Season",
  description:
    "Terrasse Season est un répertoire des terrasses et patios de Montréal. Qui l'a créé, comment fonctionnent les données, et comment contribuer.",
  alternates: {
    canonical: "https://terrasseseason.com/fr/about",
    languages: {
      "en-CA": "https://terrasseseason.com/about",
      "fr-CA": "https://terrasseseason.com/fr/about",
      "x-default": "https://terrasseseason.com/about",
    },
  },
};

export default function AboutPageFr() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav back="/fr" pageLang="fr" altHref="/about" />
      <AboutContent />
    </div>
  );
}
