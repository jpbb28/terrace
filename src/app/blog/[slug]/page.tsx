import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import { posts, getPost } from "@/data/posts";
import BlogPostContent from "./BlogPostContent";

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
        <SiteNav back="/blog" backLabel="Notes" backLabelFr="Notes" />
        <BlogPostContent post={post} />
      </div>
    </>
  );
}
