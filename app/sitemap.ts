import type { MetadataRoute } from "next";
import { getAdminData } from "@/lib/db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://www.nersyantaiba.com";

export const revalidate = 3600; // refresh hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/rooms`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/cancellation`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Per-room and per-post URLs — the pages that actually rank.
  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const data = await getAdminData();
    const rooms = (data?.rooms ?? []).map((r) => ({
      url: `${SITE_URL}/rooms/${r.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
    const posts = (data?.blogPosts ?? [])
      .filter((p) => p.status === "published" && p.slug)
      .map((p) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: p.date ? new Date(p.date) : now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));
    dynamicRoutes = [...rooms, ...posts];
  } catch {
    // If the DB is unavailable, still return the static routes.
  }

  return [...staticRoutes, ...dynamicRoutes];
}
