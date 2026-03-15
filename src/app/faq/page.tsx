import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import FaqContent from "./FaqContent";

export const metadata: Metadata = {
  title: "FAQ – Terrasse Season",
  description: "Common questions about Montréal terrasse season: when they open, dog-friendly rules, heated terrasses, how the hours work, and more.",
  alternates: { canonical: "https://terrasseseason.com/faq" },
  openGraph: {
    title: "FAQ – Terrasse Season",
    description: "Common questions about Montréal terrasse season.",
    url: "https://terrasseseason.com/faq",
  },
};

const faqsForSchema = [
  {
    q: "When do Montréal terrasses open for the season?",
    a: "The traditional start is Victoria Day weekend, the third Monday of May. Most spots open around then, though some heated or covered terrasses operate year-round or through the shoulder seasons.",
  },
  {
    q: "What's the difference between a terrasse and a patio?",
    a: "Nothing, really. \"Terrasse\" is the French/Québec term; \"patio\" is the English one. In practice, Montréalers use both interchangeably.",
  },
  {
    q: "Do I need a reservation to sit on a terrasse?",
    a: "It depends entirely on the spot. Neighbourhood cafés and casual bistros usually don't take terrasse reservations. Popular restaurants and rooftop bars in July and August can fill up fast.",
  },
  {
    q: "How do I find dog-friendly terrasses?",
    a: "Use the dog-friendly filter on the map. Always worth calling ahead to confirm.",
  },
  {
    q: "Are there terrasses open in winter or year-round?",
    a: "Some. Heated and covered terrasses can run well into October or November, and a handful operate through the winter.",
  },
  {
    q: "What do \"covered\" and \"heated\" mean?",
    a: "Covered means the terrasse has a roof or canopy structure overhead. Heated means the terrasse has outdoor heating (infrared heaters, fire pits, or similar).",
  },
  {
    q: "How accurate is the information on this site?",
    a: "We do our best. Data is sourced from published lists and verified where possible. Hours come from Google Places and are updated seasonally.",
  },
  {
    q: "How do I suggest a new terrasse or report an error?",
    a: "To add a missing terrasse, use the suggest form. To correct something on an existing listing, use the Edit button on that terrasse's page.",
  },
  {
    q: "Why does some information appear missing for certain terrasses?",
    a: "If a detail isn't shown, it means we don't have a confirmed source for it. Not that the answer is no.",
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqsForSchema.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background">
        <SiteNav />
        <FaqContent />
      </div>
    </>
  );
}
