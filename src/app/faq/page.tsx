import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import FaqContent from "./FaqContent";

export const metadata: Metadata = {
  title: "FAQ – Terrasse Season",
  description: "Common questions about Montréal terrace season: when they open, dog-friendly rules, heated terraces, how the hours work, and more.",
  alternates: { canonical: "https://terrasseseason.com/faq" },
  openGraph: {
    title: "FAQ – Terrasse Season",
    description: "Common questions about Montréal terrace season.",
    url: "https://terrasseseason.com/faq",
  },
};

const faqsForSchema = [
  {
    q: "When do Montréal terraces open for the season?",
    a: "The traditional start is Victoria Day weekend, the third Monday of May. Most spots open around then, though some heated or covered terraces operate year-round or through the shoulder seasons.",
  },
  {
    q: "What's the difference between a terrace and a patio?",
    a: "Nothing, really. \"Terrasse\" is the French/Québec term; \"patio\" is the English one. In practice, Montréalers use both interchangeably.",
  },
  {
    q: "Do I need a reservation to sit on a terrace?",
    a: "It depends entirely on the spot. Neighbourhood cafés and casual bistros usually don't take terrace reservations. Popular restaurants and rooftop bars in July and August can fill up fast.",
  },
  {
    q: "How do I find dog-friendly terraces?",
    a: "Use the dog-friendly filter on the map. Always worth calling ahead to confirm.",
  },
  {
    q: "Are there terraces open in winter or year-round?",
    a: "Some. Heated and covered terraces can run well into October or November, and a handful operate through the winter.",
  },
  {
    q: "What do \"covered\" and \"heated\" mean?",
    a: "Covered means the terrace has a roof or canopy structure overhead. Heated means the terrace has outdoor heating (infrared heaters, fire pits, or similar).",
  },
  {
    q: "How accurate is the information on this site?",
    a: "We do our best. Data is sourced from published lists and verified where possible. Hours come from Google Places and are updated seasonally.",
  },
  {
    q: "How do I suggest a new terrace or report an error?",
    a: "To add a missing terrace, use the suggest form. To correct something on an existing listing, use the Edit button on that terrace's page.",
  },
  {
    q: "Why does some information appear missing for certain terraces?",
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
