import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import { posts } from "@/data/posts";

export const metadata: Metadata = {
  title: "Notes – Terrasse Season",
  description: "Guides, neighbourhood breakdowns, and everything else worth knowing about Montréal terrasse season.",
  alternates: { canonical: "https://terrasseseason.com/blog" },
  openGraph: {
    title: "Notes – Terrasse Season",
    description: "Guides and neighbourhood breakdowns for Montréal terrasse season.",
    url: "https://terrasseseason.com/blog",
  },
};

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="max-w-2xl mx-auto px-5 py-12">
        <p className="text-[11px] uppercase tracking-widest text-accent font-medium mb-2">
          Terrasse Season
        </p>
        <h1 className="font-display text-3xl font-bold mb-2">Notes</h1>
        <p className="text-sm text-muted mb-10">
          Guides and neighbourhood breakdowns for Montréal terrasse season.
        </p>

        <div className="space-y-px">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block py-6 border-b border-border first:border-t hover:bg-foreground/[0.02] -mx-3 px-3 rounded-lg transition-colors"
            >
              <p className="text-[11px] uppercase tracking-wider text-muted mb-1.5">{post.date}</p>
              <h2 className="font-display text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-foreground/70 leading-relaxed">{post.description}</p>
              <p className="text-xs text-accent mt-3 font-medium">Read →</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
