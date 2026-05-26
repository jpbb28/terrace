"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { localize } from "@/lib/localize";
import type { Lang } from "@/lib/i18n";

/**
 * The shared hamburger menu used by both the homepage header and SiteNav.
 * Owns its open/close state, outside-click and Escape handling. Renders the
 * standard site links (Blog, About, FAQ, Terms); pages inject page-specific
 * items (e.g. "My list", Instagram) via `renderTop`.
 */
export default function NavMenu({
  lang,
  size = "sm",
  showMap = false,
  renderTop,
}: {
  lang: Lang;
  // Button footprint: "sm" for desktop/sub-page bars, "md" for the mobile bar.
  size?: "sm" | "md";
  // Include a "Map / Carte" link back to the home view (sub-pages set this).
  showMap?: boolean;
  // Page-specific items rendered above the standard links. Receives `close`
  // so each item can dismiss the menu when clicked.
  renderTop?: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    function onPointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const lp = (p: string) => localize(lang, p);
  const btnSize = size === "md" ? "w-7 h-7 gap-[4px]" : "w-6 h-6 gap-[3.5px]";
  const barW = size === "md" ? "w-4" : "w-3.5";
  const item =
    "block w-full text-left px-4 py-2 text-xs text-foreground hover:bg-foreground/[0.04] transition-colors";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`${btnSize} flex flex-col items-center justify-center text-muted hover:text-foreground transition-colors cursor-pointer`}
        aria-label="Menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className={`${barW} h-px bg-current rounded-full`} />
        <span className={`${barW} h-px bg-current rounded-full`} />
        <span className={`${barW} h-px bg-current rounded-full`} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-lg py-1 min-w-[140px] z-50"
        >
          {renderTop && (
            <>
              {renderTop(close)}
              <div className="my-1 border-t border-border" />
            </>
          )}
          {showMap && (
            <Link href={lp("/")} onClick={close} className={item}>
              {lang === "fr" ? "Carte" : "Map"}
            </Link>
          )}
          <Link href={lp("/blog")} onClick={close} className={item}>
            {lang === "fr" ? "Notes" : "Blog"}
          </Link>
          <Link href={lp("/about")} onClick={close} className={item}>
            {lang === "fr" ? "À propos" : "About"}
          </Link>
          <Link href={lp("/faq")} onClick={close} className={item}>
            FAQ
          </Link>
          <Link href={lp("/terms")} onClick={close} className={item}>
            {lang === "fr" ? "Conditions" : "Terms"}
          </Link>
        </div>
      )}
    </div>
  );
}
