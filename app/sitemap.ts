import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://nersyantaiba.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes = [
    "",
    "/rooms",
    "/blog",
    "/privacy",
    "/terms",
    "/cancellation",
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}

