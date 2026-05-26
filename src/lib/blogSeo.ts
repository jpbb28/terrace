import type { Metadata } from "next";
import type { Post } from "@/data/posts";
import type { Lang } from "@/lib/i18n";

const BASE = "https://terrasseseason.com";

export const blogPostUrl = (slug: string, lang: Lang) =>
  lang === "fr" ? `${BASE}/fr/blog/${slug}` : `${BASE}/blog/${slug}`;

export const blogIndexUrl = (lang: Lang) =>
  lang === "fr" ? `${BASE}/fr/blog` : `${BASE}/blog`;

const postLanguages = (slug: string) => ({
  "en-CA": blogPostUrl(slug, "en"),
  "fr-CA": blogPostUrl(slug, "fr"),
  "x-default": blogPostUrl(slug, "en"),
});

const indexLanguages = () => ({
  "en-CA": blogIndexUrl("en"),
  "fr-CA": blogIndexUrl("fr"),
  "x-default": blogIndexUrl("en"),
});

const INDEX_TITLE = "Notes – Terrasse Season";
const INDEX_DESC = {
  en: "Guides, neighbourhood breakdowns, and everything else worth knowing about Montréal terrace season.",
  fr: "Guides, portraits de quartiers et tout ce qu'il faut savoir sur la saison des terrasses à Montréal.",
};

export function buildBlogPostMetadata(post: Post, lang: Lang): Metadata {
  const title = lang === "fr" ? post.titleFr : post.title;
  const description = lang === "fr" ? post.descriptionFr : post.description;
  const url = blogPostUrl(post.slug, lang);
  return {
    title: `${title} – Terrasse Season`,
    description,
    alternates: { canonical: url, languages: postLanguages(post.slug) },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      locale: lang === "fr" ? "fr_CA" : "en_CA",
    },
  };
}

export function buildBlogPostJsonLd(post: Post, lang: Lang) {
  const title = lang === "fr" ? post.titleFr : post.title;
  const description = lang === "fr" ? post.descriptionFr : post.description;
  const url = blogPostUrl(post.slug, lang);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    inLanguage: lang === "fr" ? "fr-CA" : "en-CA",
    datePublished: post.dateIso,
    dateModified: post.dateIso,
    author: {
      "@type": "Organization",
      name: "Terrasse Season",
      url: BASE,
    },
    publisher: {
      "@type": "Organization",
      name: "Terrasse Season",
      url: BASE,
      logo: {
        "@type": "ImageObject",
        url: `${BASE}/icon-192x192.png`,
      },
    },
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

export function buildBlogIndexMetadata(lang: Lang): Metadata {
  const description = INDEX_DESC[lang];
  const url = blogIndexUrl(lang);
  return {
    title: INDEX_TITLE,
    description,
    alternates: { canonical: url, languages: indexLanguages() },
    openGraph: {
      title: INDEX_TITLE,
      description,
      url,
      locale: lang === "fr" ? "fr_CA" : "en_CA",
    },
  };
}

export function buildBlogIndexJsonLd(posts: Post[], lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: INDEX_TITLE,
    description: INDEX_DESC[lang],
    inLanguage: lang === "fr" ? "fr-CA" : "en-CA",
    url: blogIndexUrl(lang),
    publisher: {
      "@type": "Organization",
      name: "Terrasse Season",
      url: BASE,
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: lang === "fr" ? post.titleFr : post.title,
      description: lang === "fr" ? post.descriptionFr : post.description,
      datePublished: post.dateIso,
      dateModified: post.dateIso,
      url: blogPostUrl(post.slug, lang),
      author: {
        "@type": "Organization",
        name: "Terrasse Season",
        url: BASE,
      },
    })),
  };
}
