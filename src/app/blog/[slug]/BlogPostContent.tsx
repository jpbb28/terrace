"use client";

import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";
import type { Post, Block } from "@/data/posts";

const loraStyle = { fontFamily: "var(--font-lora)" } as const;

function renderInline(text: string) {
  const parts: React.ReactNode[] = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(
      <Link
        key={match.index}
        href={match[2]}
        className="text-accent underline underline-offset-2 hover:text-accent-hover transition-colors"
      >
        {match[1]}
      </Link>,
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 1 ? parts : text;
}

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

function LabeledBlock({
  block,
  i,
}: {
  block: Extract<Block, { t: "labeled" }>;
  i: number;
}) {
  return (
    <div key={i} className="my-8 pl-5 border-l-2 border-accent/40">
      <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold mb-2">
        {block.name}
      </p>
      <p
        className="text-[16px] leading-[1.8] text-foreground/75"
        style={loraStyle}
      >
        {renderInline(block.text)}
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
        {renderInline(block.text)}
      </p>
    );
  }
  return (
    <p
      key={i}
      className="text-[17px] leading-[1.85] text-foreground/80 mb-6"
      style={loraStyle}
    >
      {renderInline(block.text)}
    </p>
  );
}

function CalloutBlock({
  block,
  i,
}: {
  block: Extract<Block, { t: "callout" }>;
  i: number;
}) {
  return (
    <Link
      key={i}
      href={block.href}
      className="group my-8 flex items-center justify-between gap-4 rounded-xl border border-accent/25 bg-accent-soft px-5 py-4 transition-colors hover:border-accent/50 hover:bg-accent/10"
    >
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-accent font-semibold mb-1">
          {block.label}
        </p>
        <p className="text-sm text-foreground/70" style={loraStyle}>
          {block.text}
        </p>
      </div>
      <svg
        className="w-4 h-4 shrink-0 text-accent transition-transform duration-200 group-hover:translate-x-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

function renderBlock(block: Block, i: number, firstPIdx: number) {
  if (block.t === "divider") return <Divider key={i} i={i} />;
  if (block.t === "labeled")
    return <LabeledBlock key={i} block={block} i={i} />;
  if (block.t === "callout")
    return <CalloutBlock key={i} block={block} i={i} />;
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
        <h1 className="font-display text-[2.6rem] md:text-[3.2rem] font-bold leading-[1.08] mb-4 text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted mb-8">
          {lang === "fr"
            ? "Par l'équipe Terrasse Season"
            : "By the Terrasse Season team"}
        </p>
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
          href="/open"
          className="group flex items-center justify-between py-5 px-6 rounded-xl border border-border hover:border-accent/50 hover:bg-accent-soft transition-all duration-200"
        >
          <span className="font-display text-xl font-bold text-foreground group-hover:text-accent transition-colors">
            {lang === "fr"
              ? "Trouver une terrasse ouverte"
              : "Find an open terrace"}
          </span>
          <svg
            className="w-5 h-5 text-accent transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              d="M9 5l7 7-7 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </footer>
    </article>
  );
}
