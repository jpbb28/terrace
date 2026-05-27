"use client";

import { useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import NavMenu from "@/components/NavMenu";
import { useLang } from "@/lib/LanguageContext";
import type { Lang } from "@/lib/i18n";

export default function SiteNav({
  pageLang,
  altHref,
}: {
  // Retained for backwards-compat with existing call sites. The home link is
  // now the left-aligned logo (derived from the page locale), so the old
  // back-arrow + these label props are no longer rendered.
  back?: string;
  backLabel?: string;
  backLabelFr?: string;
  // Locale of the current URL-routed page + the other-language URL, for the
  // language toggle. SiteNav is only mounted on locale-routed sub-pages.
  pageLang?: Lang;
  altHref?: string;
}) {
  const { lang, setLang } = useLang();
  const effLang = pageLang ?? lang;
  const home = effLang === "fr" ? "/fr" : "/";

  // Keep the client language in sync with a URL-routed page's locale, so
  // returning to the homepage reflects the chosen language.
  useEffect(() => {
    if (pageLang) setLang(pageLang);
    // setLang is recreated each render; intentionally only re-run on pageLang.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageLang]);

  // Language toggle: a Link to the other-language URL when we know it (always,
  // for current call sites); otherwise fall back to flipping client state.
  const desktopToggleClass =
    "text-[11px] px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-white transition-all font-semibold tracking-wide cursor-pointer";
  const mobileToggleClass =
    "text-[11px] px-3 py-1.5 rounded-lg border border-accent/40 text-accent hover:bg-accent hover:text-white transition-colors font-semibold tracking-wide";

  const langToggle = (className: string, label: string) =>
    altHref ? (
      <Link
        href={altHref}
        hrefLang={effLang === "en" ? "fr" : "en"}
        className={className}
      >
        {label}
      </Link>
    ) : (
      <button
        onClick={() => setLang(lang === "en" ? "fr" : "en")}
        className={className}
      >
        {label}
      </button>
    );

  return (
    <>
      {/* Desktop bar — mirrors the homepage header, minus the search pill */}
      <header className="hidden md:flex relative shrink-0 items-center gap-4 px-6 h-16 bg-background border-b border-border z-[1100]">
        <Link href={home} className="flex items-start gap-2.5 shrink-0 group">
          <div className="mt-[3px]">
            <Logo className="w-7 h-7 shrink-0" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight leading-none group-hover:text-accent transition-colors">
              Terrasse Season
            </h1>
            <p className="text-[10px] text-muted tracking-wide mt-0.5">
              {effLang === "fr"
                ? "Le guide des terrasses de Montréal"
                : "Montreal's terrace guide"}
            </p>
          </div>
        </Link>

        {/* Season open CTA */}
        <Link
          href="/open"
          className="shrink-0 text-xs px-4 py-2 rounded-full bg-green-700 text-white hover:bg-green-800 transition-colors font-medium whitespace-nowrap shadow-sm"
        >
          {effLang === "fr"
            ? "Terrasses ouvertes cette saison"
            : "What's open this season?"}
        </Link>

        {/* Spacer where the homepage's search pill sits */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/submit"
            className="text-xs px-4 py-1.5 rounded-full bg-accent text-white hover:bg-accent-hover transition-colors font-medium whitespace-nowrap"
          >
            {effLang === "fr" ? "Soumettre une terrasse" : "Submit a terrace"}
          </Link>
          {langToggle(
            desktopToggleClass,
            effLang === "en" ? "Français" : "English",
          )}
          <div className="w-px h-4 bg-border shrink-0 ml-1" />
          <a
            href="https://instagram.com/terrasseseason"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted hover:text-foreground transition-colors whitespace-nowrap"
          >
            @terrasseseason
          </a>
          <NavMenu lang={effLang} size="sm" />
        </div>
      </header>

      {/* Mobile bar — mirrors the homepage mobile header row */}
      <div className="md:hidden px-4 pt-3 pb-2 bg-background border-b border-border">
        <div className="flex items-center justify-between">
          <Link href={home} className="flex items-center gap-2">
            <Logo className="w-6 h-6 shrink-0" />
            <div>
              <h1 className="font-display text-base font-bold tracking-tight leading-none">
                Terrasse Season
              </h1>
              <p className="text-[9px] text-muted tracking-wide mt-0.5">
                {effLang === "fr"
                  ? "Les terrasses de Montréal"
                  : "Montreal's terrace guide"}
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/submit"
              className="text-[11px] px-2.5 py-1 rounded-lg border border-border text-muted"
            >
              {effLang === "fr" ? "Soumettre" : "Submit"}
            </Link>
            {langToggle(mobileToggleClass, effLang === "en" ? "FR" : "EN")}
            <NavMenu
              lang={effLang}
              size="md"
              renderTop={(close) => (
                <a
                  href="https://instagram.com/terrasseseason"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className="block px-4 py-2 text-xs text-accent font-medium hover:bg-foreground/[0.04] transition-colors"
                >
                  @terrasseseason
                </a>
              )}
            />
          </div>
        </div>
      </div>
    </>
  );
}
