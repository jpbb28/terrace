"use client";

import { useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import NavMenu from "@/components/NavMenu";
import { useLang } from "@/lib/LanguageContext";
import type { Lang } from "@/lib/i18n";

export default function SiteNav({
  back = "/",
  backLabel = "All terraces",
  backLabelFr = "Toutes les terrasses",
  pageLang,
  altHref,
}: {
  back?: string;
  backLabel?: string;
  backLabelFr?: string;
  // When set (locale-routed pages like /terraces/[slug] and /fr/...), the
  // language button navigates to `altHref` (the other-language URL) instead of
  // flipping client state, and the client language is synced to the page.
  pageLang?: Lang;
  altHref?: string;
}) {
  const { lang, setLang } = useLang();
  const effLang = pageLang ?? lang;
  const label = effLang === "fr" ? backLabelFr : backLabel;
  const home = effLang === "fr" ? "/fr" : "/";

  // Keep the client-side language in sync with a URL-routed page's locale, so
  // returning to the homepage (and localStorage) reflects the chosen language.
  useEffect(() => {
    if (pageLang) setLang(pageLang);
    // setLang is recreated each render; intentionally only re-run on pageLang.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageLang]);

  return (
    <nav className="border-b border-border px-5 py-3.5 flex items-center justify-between">
      <Link
        href={back}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            d="M15 19l-7-7 7-7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {label}
      </Link>
      <div className="flex items-center gap-3">
        {pageLang && altHref ? (
          <Link
            href={altHref}
            hrefLang={pageLang === "en" ? "fr" : "en"}
            className="text-[11px] px-3 py-1.5 rounded-lg border border-accent/40 text-accent hover:bg-accent hover:text-white transition-colors font-semibold tracking-wide"
          >
            {pageLang === "en" ? "FR" : "EN"}
          </Link>
        ) : (
          <button
            onClick={() => setLang(lang === "en" ? "fr" : "en")}
            className="text-[11px] px-3 py-1.5 rounded-lg border border-accent/40 text-accent hover:bg-accent hover:text-white transition-colors font-semibold tracking-wide"
          >
            {lang === "en" ? "FR" : "EN"}
          </button>
        )}
        <Link href={home} className="flex items-center gap-2 group">
          <Logo className="w-5 h-5 shrink-0" />
          <span className="font-display text-sm font-bold tracking-tight group-hover:text-accent transition-colors">
            Terrasse Season
          </span>
        </Link>
        <NavMenu lang={effLang} size="sm" showMap />
      </div>
    </nav>
  );
}
