"use client";

import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";
import { posts } from "@/data/posts";

const loraStyle = { fontFamily: "var(--font-lora)" } as const;

function Ornament() {
  return (
    <div className="flex items-center gap-2 my-10">
      <div className="h-px flex-1 bg-border" />
      <div className="flex gap-1.5">
        <span className="block w-1 h-1 rounded-full bg-accent/40" />
        <span className="block w-1.5 h-1.5 rounded-full bg-accent" />
        <span className="block w-1 h-1 rounded-full bg-accent/40" />
      </div>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export default function BlogIndexContent() {
  const { lang } = useLang();

  const [featured, ...rest] = posts;

  return (
    <div className="max-w-[680px] mx-auto px-5 py-16">

      {/* Masthead */}
      <header className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.22em] text-accent font-semibold mb-5">
          Terrasse Season
        </p>
        <h1 className="font-display text-[2.6rem] md:text-[3.2rem] font-bold leading-[1.08] text-foreground mb-4">
          {lang === "fr" ? "Notes" : "Notes"}
        </h1>
        <div className="flex items-center gap-3">
          <div className="h-px w-10 bg-accent" />
          <div className="h-px flex-1 bg-border" />
        </div>
        <p className="mt-5 text-[16px] leading-[1.8] text-foreground/60" style={loraStyle}>
          {lang === "fr"
            ? "Guides et portraits de quartiers pour la saison de terrasse à Montréal."
            : "Guides and neighbourhood portraits for Montréal terrace season."}
        </p>
      </header>

      {/* Featured post */}
      <Link
        href={`/blog/${featured.slug}`}
        className="group block relative overflow-hidden rounded-2xl border border-border bg-card hover:border-accent/40 hover:bg-card-hover transition-all duration-300 p-8 md:p-10"
      >
        {/* Large background number */}
        <span
          className="absolute right-6 top-4 font-display text-[7rem] font-bold leading-none text-foreground/[0.04] select-none pointer-events-none"
          aria-hidden
        >
          01
        </span>

        <p className="text-[10px] uppercase tracking-[0.22em] text-accent font-semibold mb-5">
          {lang === "fr" ? featured.dateFr : featured.date}
        </p>

        <h2 className="font-display text-[1.85rem] md:text-[2.2rem] font-bold leading-[1.1] text-foreground group-hover:text-accent transition-colors duration-200 mb-5 pr-12">
          {lang === "fr" ? featured.titleFr : featured.title}
        </h2>

        <p className="text-[16px] leading-[1.8] text-foreground/65 mb-6" style={loraStyle}>
          {lang === "fr" ? featured.descriptionFr : featured.description}
        </p>

        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-accent font-semibold">
          {lang === "fr" ? "Lire" : "Read"}
          <svg
            className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </Link>

      <Ornament />

      {/* Remaining posts */}
      <div className="space-y-0">
        {rest.map((post, idx) => (
          <div key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex gap-6 md:gap-8 py-8 transition-all duration-200"
            >
              {/* Number column */}
              <div className="flex-none pt-1">
                <span className="font-display text-[1.6rem] font-bold text-foreground/10 group-hover:text-accent/20 transition-colors duration-200 select-none tabular-nums">
                  {String(idx + 2).padStart(2, "0")}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.22em] text-accent font-semibold mb-3">
                  {lang === "fr" ? post.dateFr : post.date}
                </p>
                <h2 className="font-display text-[1.35rem] font-bold leading-[1.2] text-foreground group-hover:text-accent transition-colors duration-200 mb-3">
                  {lang === "fr" ? post.titleFr : post.title}
                </h2>
                <p className="text-[15px] leading-[1.75] text-foreground/60" style={loraStyle}>
                  {lang === "fr" ? post.descriptionFr : post.description}
                </p>
                <span className="inline-flex items-center gap-1.5 mt-4 text-[10px] uppercase tracking-widest text-accent/70 group-hover:text-accent font-semibold transition-colors duration-200">
                  {lang === "fr" ? "Lire" : "Read"}
                  <svg
                    className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </Link>

            {idx < rest.length - 1 && (
              <div className="h-px bg-border" />
            )}
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mt-14">
        <div className="h-px bg-border mb-10" />
        <Link
          href="/"
          className="group flex items-center justify-between py-5 px-6 rounded-xl border border-border hover:border-accent/50 hover:bg-accent-soft transition-all duration-200"
        >
          <span className="font-display text-xl font-bold text-foreground group-hover:text-accent transition-colors">
            {lang === "fr" ? "Trouver une terrasse" : "Find a terrace"}
          </span>
          <svg
            className="w-5 h-5 text-accent transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
