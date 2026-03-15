"use client";

import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";
import type { Post, Block } from "@/data/posts";

function renderBlock(block: Block, i: number) {
  if (block.t === "divider") {
    return <hr key={i} className="border-border my-8" />;
  }
  if (block.t === "labeled") {
    return (
      <p key={i} className="text-base text-foreground/80 leading-relaxed mb-5">
        <span className="font-semibold text-foreground">{block.name}.</span>{" "}
        {block.text}
      </p>
    );
  }
  return (
    <p key={i} className="text-base text-foreground/80 leading-relaxed mb-5">
      {block.text}
    </p>
  );
}

export default function BlogPostContent({ post }: { post: Post }) {
  const { lang } = useLang();

  const title = lang === "fr" ? post.titleFr : post.title;
  const date = lang === "fr" ? post.dateFr : post.date;
  const content = lang === "fr" ? post.contentFr : post.content;

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <p className="text-[11px] uppercase tracking-widest text-accent font-medium mb-3">
        {date}
      </p>
      <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-8">
        {title}
      </h1>

      <div>
        {content.map((block, i) => renderBlock(block, i))}
      </div>

      <div className="mt-12 pt-8 border-t border-border">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-accent hover:underline font-medium"
        >
          {lang === "fr" ? "Trouver une terrasse" : "Find a terrasse"}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
