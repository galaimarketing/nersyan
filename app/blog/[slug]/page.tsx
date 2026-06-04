import type { Metadata } from "next";
import { getAdminData } from "@/lib/db";
import BlogPostClient from "./BlogPostClient";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.nersyantaiba.com").replace(/\/+$/, "");
const FALLBACK_OG = "/%D8%A7%D9%84%D9%85%D8%B3%D8%AC%D8%AF%20%D8%A7%D9%84%D9%86%D8%A8%D9%88%D9%8A.jpg";

function stripHtml(html: string, max = 160): string {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

async function findPost(slug: string) {
  try {
    const data = await getAdminData();
    return (data?.blogPosts ?? []).find((p) => p.slug === slug && p.status === "published") ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string }>;
}): Promise<Metadata> {
  const { slug = "" } = await params;
  const post = await findPost(slug);
  if (!post) {
    return { title: "المدونة", description: "مدونة نرسيان طيبة — نصائح وإقامة في المدينة المنورة." };
  }
  const title = post.titleAr || post.titleEn;
  const description = stripHtml(post.contentAr || post.contentEn || "");
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      publishedTime: post.date || undefined,
      images: [{ url: `${SITE_URL}${FALLBACK_OG}`, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug?: string }>;
}) {
  const { slug = "" } = await params;
  const post = await findPost(slug);

  const jsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.titleAr || post.titleEn,
        datePublished: post.date || undefined,
        author: { "@type": "Organization", name: "نرسيان طيبة" },
        publisher: {
          "@type": "Organization",
          name: "نرسيان طيبة",
          logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.svg` },
        },
        mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <BlogPostClient slug={slug} />
    </>
  );
}
