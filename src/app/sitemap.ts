import { MetadataRoute } from "next";
import { terraces } from "@/data/terraces";
import { posts } from "@/data/posts";
import { slugify } from "@/lib/utils";

const BASE = "https://terrasseseason.com";

type ChangeFreq = MetadataRoute.Sitemap[number]["changeFrequency"];

export default function sitemap(): MetadataRoute.Sitemap {
  const buildDate = new Date();

  // Emit an English + French entry for a page pair, each carrying hreflang
  // alternates so search engines treat them as language variants of one page.
  const pair = (
    enPath: string,
    frPath: string,
    opts: {
      lastModified?: Date;
      changeFrequency?: ChangeFreq;
      priority?: number;
    } = {},
  ): MetadataRoute.Sitemap => {
    const en = `${BASE}${enPath}`;
    const fr = `${BASE}${frPath}`;
    const shared = {
      lastModified: opts.lastModified ?? buildDate,
      changeFrequency: opts.changeFrequency ?? "monthly",
      priority: opts.priority ?? 0.7,
      alternates: { languages: { "en-CA": en, "fr-CA": fr } },
    };
    return [
      { url: en, ...shared },
      { url: fr, ...shared },
    ];
  };

  const staticPages: MetadataRoute.Sitemap = [
    ...pair("", "/fr", { changeFrequency: "weekly", priority: 1 }),
    ...pair("/blog", "/fr/blog", { changeFrequency: "weekly", priority: 0.8 }),
    ...pair("/about", "/fr/about", { priority: 0.5 }),
    ...pair("/faq", "/fr/faq", { priority: 0.6 }),
    ...pair("/terms", "/fr/terms", { priority: 0.3 }),
  ];

  const blogPages: MetadataRoute.Sitemap = posts.flatMap((p) =>
    pair(`/blog/${p.slug}`, `/fr/blog/${p.slug}`, {
      lastModified: new Date(p.dateIso),
      priority: 0.8,
    }),
  );

  const terracePages: MetadataRoute.Sitemap = terraces.flatMap((t) => {
    const slug = slugify(t.name);
    return pair(`/terraces/${slug}`, `/fr/terraces/${slug}`, { priority: 0.7 });
  });

  return [...staticPages, ...blogPages, ...terracePages];
}
