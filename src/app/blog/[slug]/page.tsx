import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import { posts, getPost, type Block } from "@/data/posts";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} – Terrasse Season`,
    description: post.description,
    alternates: { canonical: `https://terrasseseason.com/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://terrasseseason.com/blog/${slug}`,
    },
  };
}

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

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    publisher: {
      "@type": "Organization",
      name: "Terrasse Season",
      url: "https://terrasseseason.com",
    },
    url: `https://terrasseseason.com/blog/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background">
        <SiteNav back="/blog" backLabel="Notes" />

        <div className="max-w-2xl mx-auto px-5 py-10">
          <p className="text-[11px] uppercase tracking-widest text-accent font-medium mb-3">
            {post.date}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-8">
            {post.title}
          </h1>

          <div>
            {post.content.map((block, i) => renderBlock(block, i))}
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-accent hover:underline font-medium"
            >
              Find a terrasse
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
