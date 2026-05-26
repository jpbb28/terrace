import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import BlogIndexContent from "@/app/blog/BlogIndexContent";
import { posts } from "@/data/posts";
import { buildBlogIndexMetadata, buildBlogIndexJsonLd } from "@/lib/blogSeo";

export const metadata: Metadata = buildBlogIndexMetadata("fr");

const jsonLd = buildBlogIndexJsonLd(posts, "fr");

export default function BlogIndexFr() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background">
        <SiteNav back="/fr" pageLang="fr" altHref="/blog" />
        <BlogIndexContent />
      </div>
    </>
  );
}
