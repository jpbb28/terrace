import { MetadataRoute } from "next";
import { terraces } from "@/data/terraces";
import { slugify } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const terracePages: MetadataRoute.Sitemap = terraces.map((t) => ({
    url: `https://terrasseseason.com/terraces/${slugify(t.name)}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: "https://terrasseseason.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://terrasseseason.com/submit",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    ...terracePages,
  ];
}
