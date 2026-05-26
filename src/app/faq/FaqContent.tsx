"use client";

import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";
import { faqsEn, faqsFr } from "@/data/faqs";

export default function FaqContent() {
  const { lang } = useLang();
  const faqs = lang === "fr" ? faqsFr : faqsEn;
  // Keep /blog answer-links within the current locale (/submit has no /fr route).
  const lp = (h: string) =>
    lang === "fr" && h.startsWith("/blog") ? `/fr${h}` : h;

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <p className="text-[11px] uppercase tracking-widest text-accent font-medium mb-2">
        FAQ
      </p>
      <h1 className="font-display text-3xl font-bold mb-2">
        {lang === "fr" ? "Questions fréquentes" : "Common questions"}
      </h1>
      <p className="text-sm text-muted mb-10">
        {lang === "fr"
          ? "Sur la saison de terrasse à Montréal, le site, et comment les données fonctionnent."
          : "About Montréal terrace season, the site, and how the data works."}
      </p>

      <div className="space-y-0">
        {faqs.map((faq, i) => (
          <div key={i} className="py-6 border-b border-border first:border-t">
            <h2 className="font-semibold text-foreground mb-2 text-base">
              {faq.q}
            </h2>
            <p className="text-sm text-foreground/70 leading-relaxed">
              {faq.a}
            </p>
            {faq.link && (
              <Link
                href={lp(faq.link.href)}
                className="inline-block mt-2 text-xs text-accent hover:underline font-medium"
              >
                {faq.link.label}
              </Link>
            )}
          </div>
        ))}
      </div>

      <p className="text-sm text-muted mt-10">
        {lang === "fr" ? (
          <>
            Autre chose?{" "}
            <a
              href="mailto:hello@terrasseseason.com"
              className="text-accent hover:underline"
            >
              hello@terrasseseason.com
            </a>
          </>
        ) : (
          <>
            Something else?{" "}
            <a
              href="mailto:hello@terrasseseason.com"
              className="text-accent hover:underline"
            >
              hello@terrasseseason.com
            </a>
          </>
        )}
      </p>
    </div>
  );
}
