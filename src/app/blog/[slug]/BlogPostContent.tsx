"use client";

import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";
import type { Post, Block } from "@/data/posts";

const loraStyle = { fontFamily: "var(--font-lora)" } as const;

function Divider({ i }: { i: number }) {
  return (
    <div key={i} className="my-14 flex items-center justify-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <div className="flex gap-2">
        <span className="block w-1 h-1 rounded-full bg-accent/40" />
        <span className="block w-1.5 h-1.5 rounded-full bg-accent" />
        <span className="block w-1 h-1 rounded-full bg-accent/40" />
      </div>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function LabeledBlock({ block, i }: { block: Extract<Block, { t: "labeled" }>; i: number }) {
  return (
    <div key={i} className="my-8 pl-5 border-l-2 border-accent/40">
      <p
        className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold mb-2"
      >
        {block.name}
      </p>
      <p
        className="text-[16px] leading-[1.8] text-foreground/75"
        style={loraStyle}
      >
        {block.text}
      </p>
    </div>
  );
}

function Paragraph({
  block,
  dropCap,
  i,
}: {
  block: Extract<Block, { t: "p" }>;
  dropCap: boolean;
  i: number;
}) {
  if (dropCap) {
    return (
      <p
        key={i}
        className="text-[17px] leading-[1.85] text-foreground/80 mb-6 [&::first-letter]:float-left [&::first-letter]:font-display [&::first-letter]:text-[4.2rem] [&::first-letter]:font-bold [&::first-letter]:text-accent [&::first-letter]:leading-[0.82] [&::first-letter]:mr-2 [&::first-letter]:mt-1"
        style={loraStyle}
      >
        {block.text}
      </p>
    );
  }
  return (
    <p
      key={i}
      className="text-[17px] leading-[1.85] text-foreground/80 mb-6"
      style={loraStyle}
    >
      {block.text}
    </p>
  );
}

function renderBlock(block: Block, i: number, firstPIdx: number) {
  if (block.t === "divider") return <Divider key={i} i={i} />;
  if (block.t === "labeled") return <LabeledBlock key={i} block={block} i={i} />;
  return <Paragraph key={i} block={block} dropCap={i === firstPIdx} i={i} />;
}

export default function BlogPostContent({ post }: { post: Post }) {
  const { lang } = useLang();

  const title = lang === "fr" ? post.titleFr : post.title;
  const date = lang === "fr" ? post.dateFr : post.date;
  const content = lang === "fr" ? post.contentFr : post.content;

  const firstPIdx = content.findIndex((b) => b.t === "p");

  return (
    <article className="max-w-[680px] mx-auto px-5 py-16">

      {/* Header */}
      <header className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.22em] text-accent font-semibold mb-5">
          {date}
        </p>
        <h1
          className="font-display text-[2.6rem] md:text-[3.2rem] font-bold leading-[1.08] mb-8 text-foreground"
        >
          {title}
        </h1>
        <div className="flex items-center gap-3">
          <div className="h-px w-10 bg-accent" />
          <div className="h-px flex-1 bg-border" />
        </div>
      </header>

      {/* Body */}
      <div className="mt-10">
        {content.map((block, i) => renderBlock(block, i, firstPIdx))}
      </div>

      {/* CTA */}
      <footer className="mt-16">
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
      </footer>
    </article>
  );
}
