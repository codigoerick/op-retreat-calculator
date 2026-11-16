import type { MetadataRoute } from "next";
import { INFO_ARTICLES, INFO_BASE_URL } from "@/data/info";

const LOCALES = ["en", "es"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = LOCALES.flatMap((locale) => [
    {
      url: `${INFO_BASE_URL}/${locale}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${INFO_BASE_URL}/${locale}/info`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ]);

  const articlePages: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    INFO_ARTICLES.map((article) => ({
      url: `${INFO_BASE_URL}/${locale}/info/${article.slug}`,
      lastModified: new Date(`${article.updatedAt}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  );

  return [...staticPages, ...articlePages];
}
