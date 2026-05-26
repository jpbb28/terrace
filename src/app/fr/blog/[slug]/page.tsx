import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import { posts, getPost } from "@/data/posts";
import { buildBlogPostMetadata, buildBlogPostJsonLd } from "@/lib/blogSeo";
import BlogPostContent from "@/app/blog/[slug]/BlogPostContent";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return buildBlogPostMetadata(post, "fr");
}

export default async function BlogPostFr({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const jsonLd = buildBlogPostJsonLd(post, "fr");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background">
        <SiteNav
          back="/fr/blog"
          backLabel="Notes"
          backLabelFr="Notes"
          pageLang="fr"
          altHref={`/blog/${slug}`}
        />
        <BlogPostContent post={post} />
      </div>
    </>
  );
}
