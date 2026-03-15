import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";

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

const faqs = [
  {
    q: "When do Montréal terrasses open for the season?",
    a: "The traditional start is Victoria Day weekend, the third Monday of May. Most spots open around then, though some heated or covered terrasses operate year-round or through the shoulder seasons. We've written a full seasonal breakdown in our guide.",
    link: { href: "/blog/when-do-montreal-terrasses-open", label: "When do terrasses open? →" },
  },
  {
    q: "What's the difference between a terrasse and a patio?",
    a: "Nothing, really. \"Terrasse\" is the French/Québec term; \"patio\" is the English one. In practice, Montréalers use both interchangeably. On this site we use terrasse because that's what most locals call it.",
  },
  {
    q: "Do I need a reservation to sit on a terrasse?",
    a: "It depends entirely on the spot. Neighbourhood cafés and casual bistros usually don't take terrasse reservations. First come, first served. Popular restaurants and rooftop bars in July and August can fill up fast, so calling ahead or checking their website is worth it. If you're going somewhere specific on a weekend evening in peak season, assume you'll need a reservation.",
  },
  {
    q: "How do I find dog-friendly terrasses?",
    a: "Use the dog-friendly filter on the map. We only mark a terrasse as dog-friendly when we have a confirmed source. Not just because it seems likely.",
    link: { href: "/dog-friendly-terrasses-montreal", label: "Read the dog-friendly guide →", blog: true },
  },
  {
    q: "Are there terrasses open in winter or year-round?",
    a: "Some. Heated and covered terrasses can run well into October or November, and a handful operate through the winter. Use the \"heated\" and \"covered\" filters on the map to find them. Hours are often reduced in the off-season, so calling ahead is a good idea.",
  },
  {
    q: "What do \"covered\" and \"heated\" mean?",
    a: "Covered means the terrasse has a roof or canopy structure overhead. How much protection that actually provides varies. Some are fully enclosed enough to sit through a downpour, others are just a pergola. Heated means the terrasse has outdoor heating (infrared heaters, fire pits, or similar). A spot can be one, both, or neither.",
  },
  {
    q: "How accurate is the information on this site?",
    a: "We do our best. Data is sourced from published lists and verified where possible. Hours come from Google Places and are updated seasonally. That said, the restaurant industry moves fast. Spots close, hours change, ownership pivots. Treat this as a reliable starting point, not a guarantee. Always worth a quick check on the restaurant's own social media before a dedicated trip.",
  },
  {
    q: "How do I suggest a new terrasse or report an error?",
    a: "Use the suggest form. It's linked at the top of every terrace page, or you can go there directly. We review everything that comes in.",
    link: { href: "/submit", label: "Suggest a terrasse →" },
  },
  {
    q: "Why does some information appear missing for certain terrasses?",
    a: "If a detail isn't shown, it means we don't have a confirmed source for it. Not that the answer is no. We'd rather show nothing than show something wrong. If you know the missing detail, find the terrasse on the map and use the Edit button on its page.",
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
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

        <div className="max-w-2xl mx-auto px-5 py-12">
          <p className="text-[11px] uppercase tracking-widest text-accent font-medium mb-2">
            FAQ
          </p>
          <h1 className="font-display text-3xl font-bold mb-2">Common questions</h1>
          <p className="text-sm text-muted mb-10">
            About Montréal terrasse season, the site, and how the data works.
          </p>

          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <div key={i} className="py-6 border-b border-border first:border-t">
                <h2 className="font-semibold text-foreground mb-2 text-base">{faq.q}</h2>
                <p className="text-sm text-foreground/70 leading-relaxed">{faq.a}</p>
                {faq.link && (
                  <Link
                    href={faq.link.href}
                    className="inline-block mt-2 text-xs text-accent hover:underline font-medium"
                  >
                    {faq.link.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
