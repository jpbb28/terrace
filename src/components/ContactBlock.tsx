"use client";

import { Mail } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

/**
 * Prominent email + Instagram contact card for the content pages (About, FAQ).
 * Forces --font-sans so it reads as a UI element even inside a serif
 * (.font-reading) prose container.
 */
export default function ContactBlock() {
  const fr = useLang().lang === "fr";
  const link =
    "flex items-center gap-2.5 text-[15px] font-medium text-foreground hover:text-accent transition-colors";
  return (
    <div className="not-prose font-sans rounded-xl border border-accent/25 bg-accent-soft/50 px-5 py-4">
      <p className="text-[11px] uppercase tracking-widest text-accent font-medium mb-3">
        {fr ? "Nous joindre" : "Get in touch"}
      </p>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <a href="mailto:hello@terrasseseason.com" className={link}>
          <Mail
            className="w-[18px] h-[18px] text-accent shrink-0"
            strokeWidth={2}
          />
          hello@terrasseseason.com
        </a>
        <a
          href="https://instagram.com/terrasseseason"
          target="_blank"
          rel="noopener noreferrer"
          className={link}
        >
          <InstagramIcon className="w-[18px] h-[18px] text-accent shrink-0" />
          @terrasseseason
        </a>
      </div>
    </div>
  );
}
