"use client";

import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";

export default function SiteNav({
  back = "/",
  backLabel = "All terraces",
  backLabelFr = "Toutes les terrasses",
}: {
  back?: string;
  backLabel?: string;
  backLabelFr?: string;
}) {
  const { lang, setLang } = useLang();
  const label = lang === "fr" ? backLabelFr : backLabel;

  return (
    <nav className="border-b border-border px-5 py-3.5 flex items-center justify-between">
      <Link
        href={back}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {label}
      </Link>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setLang(lang === "en" ? "fr" : "en")}
          className="text-[11px] px-2.5 py-1 rounded-lg border border-border text-muted hover:text-foreground hover:border-border-strong transition-colors font-medium tracking-wide"
        >
          {lang === "en" ? "FR" : "EN"}
        </button>
        <Link href="/" className="flex items-center gap-2 group">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 32 32" fill="none">
            <polygon points="16,1 14,8 18,8" fill="#c45d3e"/>
            <polygon points="16,31 14,24 18,24" fill="#c45d3e"/>
            <polygon points="1,16 8,14 8,18" fill="#c45d3e"/>
            <polygon points="31,16 24,14 24,18" fill="#c45d3e"/>
            <polygon points="5.4,5.4 10.2,8.4 7.8,10.8" fill="#c45d3e"/>
            <polygon points="26.6,26.6 21.8,23.6 24.2,21.2" fill="#c45d3e"/>
            <polygon points="26.6,5.4 23.6,10.2 21.2,7.8" fill="#c45d3e"/>
            <polygon points="5.4,26.6 8.4,21.8 10.8,24.2" fill="#c45d3e"/>
            <circle cx="16" cy="16" r="6" fill="#c45d3e"/>
          </svg>
          <span className="font-display text-sm font-bold tracking-tight group-hover:text-accent transition-colors">
            Terrasse Season
          </span>
        </Link>
      </div>
    </nav>
  );
}
