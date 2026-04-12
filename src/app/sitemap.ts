import { MetadataRoute } from "next";
import { terraces } from "@/data/terraces";
import { posts } from "@/data/posts";
import { slugify } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const terracePages: MetadataRoute.Sitemap = terraces.map((t) => ({
    url: `https://terrasseseason.com/terraces/${slugify(t.name)}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `https://terrasseseason.com/blog/${p.slug}`,
    lastModified: new Date(p.dateIso),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://terrasseseason.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://terrasseseason.com/blog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://terrasseseason.com/faq",
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: "https://terrasseseason.com/about",
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...blogPages,
    ...terracePages,
  ];
}
