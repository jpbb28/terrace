import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import FaqContent from "@/app/faq/FaqContent";
import { faqsFr } from "@/data/faqs";

export const metadata: Metadata = {
  title: "FAQ – Terrasse Season",
  description:
    "Questions fréquentes sur la saison des terrasses à Montréal : quand elles ouvrent, les chiens, les terrasses chauffées, le fonctionnement des horaires et plus.",
  alternates: {
    canonical: "https://terrasseseason.com/fr/faq",
    languages: {
      "en-CA": "https://terrasseseason.com/faq",
      "fr-CA": "https://terrasseseason.com/fr/faq",
      "x-default": "https://terrasseseason.com/faq",
    },
  },
  openGraph: {
    title: "FAQ – Terrasse Season",
    description: "Questions fréquentes sur la saison des terrasses à Montréal.",
    url: "https://terrasseseason.com/fr/faq",
    locale: "fr_CA",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "fr-CA",
  mainEntity: faqsFr.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export default function FaqPageFr() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background">
        <SiteNav back="/fr" pageLang="fr" altHref="/faq" />
        <FaqContent />
      </div>
    </>
  );
}
