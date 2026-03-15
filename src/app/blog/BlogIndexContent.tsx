"use client";

import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";
import { posts } from "@/data/posts";

export default function BlogIndexContent() {
  const { lang } = useLang();

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <p className="text-[11px] uppercase tracking-widest text-accent font-medium mb-2">
        Terrasse Season
      </p>
      <h1 className="font-display text-3xl font-bold mb-2">
        {lang === "fr" ? "Notes" : "Notes"}
      </h1>
      <p className="text-sm text-muted mb-10">
        {lang === "fr"
          ? "Guides et portraits de quartiers pour la saison de terrasse à Montréal."
          : "Guides and neighbourhood breakdowns for Montréal terrasse season."}
      </p>

      <div className="space-y-px">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block py-6 border-b border-border first:border-t hover:bg-foreground/[0.02] -mx-3 px-3 rounded-lg transition-colors"
          >
            <p className="text-[11px] uppercase tracking-wider text-muted mb-1.5">
              {lang === "fr" ? post.dateFr : post.date}
            </p>
            <h2 className="font-display text-xl font-bold mb-2 group-hover:text-accent transition-colors">
              {lang === "fr" ? post.titleFr : post.title}
            </h2>
            <p className="text-sm text-foreground/70 leading-relaxed">
              {lang === "fr" ? post.descriptionFr : post.description}
            </p>
            <p className="text-xs text-accent mt-3 font-medium">
              {lang === "fr" ? "Lire →" : "Read →"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
