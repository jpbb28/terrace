import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import BlogIndexContent from "./BlogIndexContent";
import { posts } from "@/data/posts";

export const metadata: Metadata = {
  title: "Notes – Terrasse Season",
  description: "Guides, neighbourhood breakdowns, and everything else worth knowing about Montréal terrace season.",
  alternates: { canonical: "https://terrasseseason.com/blog" },
  openGraph: {
    title: "Notes – Terrasse Season",
    description: "Guides and neighbourhood breakdowns for Montréal terrace season.",
    url: "https://terrasseseason.com/blog",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Notes – Terrasse Season",
  description: "Guides, neighbourhood breakdowns, and everything else worth knowing about Montréal terrace season.",
  url: "https://terrasseseason.com/blog",
  publisher: {
    "@type": "Organization",
    name: "Terrasse Season",
    url: "https://terrasseseason.com",
  },
  blogPost: posts.map((post) => ({
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.dateIso,
    dateModified: post.dateIso,
    url: `https://terrasseseason.com/blog/${post.slug}`,
    author: {
      "@type": "Organization",
      name: "Terrasse Season",
      url: "https://terrasseseason.com",
    },
  })),
};

export default function BlogIndex() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background">
        <SiteNav />
        <BlogIndexContent />
      </div>
    </>
  );
}
