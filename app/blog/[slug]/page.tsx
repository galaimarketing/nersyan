"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { usePublicBlogPostBySlug } from "@/lib/public-blog";

function BlogPostContent() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const { language, dir } = useI18n();
  const post = usePublicBlogPostBySlug(slug);

  useEffect(() => {
    if (post) {
      const title = language === "ar" ? (post.titleAr || post.titleEn) : (post.titleEn || post.titleAr);
      document.title = `${title} | Nersian Taiba`;
    }
  }, [post, language]);

  if (post === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <Header />
        <main className="mx-auto max-w-3xl px-6 py-32 text-center">
          <p className="text-lg font-medium text-foreground">
            {language === "ar" ? "المقال غير موجود" : "Post not found"}
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/blog">{language === "ar" ? "العودة للمدونة" : "Back to Blog"}</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const title = language === "ar" ? (post.titleAr || post.titleEn) : (post.titleEn || post.titleAr);
  const content = language === "ar" ? (post.contentAr || post.contentEn) : (post.contentEn || post.contentAr);
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />
      <main className="mx-auto max-w-3xl px-6 pb-20 pt-32">
        <div className="mb-6">
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {language === "ar" ? "← العودة للمدونة" : "← Back to Blog"}
          </Link>
        </div>
        <article
          className="max-w-none"
          dir={isRtl ? "rtl" : "ltr"}
          lang={language === "ar" ? "ar" : "en"}
        >
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{post.date}</p>
          </header>
          <div
            className="blog-body text-foreground"
            dir={isRtl ? "rtl" : "ltr"}
            dangerouslySetInnerHTML={{
              __html: content
                .replace(/<script/gi, "&lt;script")
                .replace(/<iframe/gi, "&lt;iframe")
                .replace(/on\w+=/gi, "data-noattr="),
            }}
          />
        </article>
      </main>
      <Footer />
    </div>
  );
}

export default function BlogSlugPage() {
  return (
    <I18nProvider>
      <BlogPostContent />
    </I18nProvider>
  );
}
