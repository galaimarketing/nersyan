"use client";

import Link from "next/link";
import { useI18n, I18nProvider } from "@/lib/i18n";
import { usePublicBlogPosts } from "@/lib/public-blog";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

function BlogListContent() {
  const { language, dir } = useI18n();
  const posts = usePublicBlogPosts();

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />
      <main className="mx-auto max-w-3xl px-6 pb-20 pt-32">
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          {language === "ar" ? "المدونة" : "Blog"}
        </h1>
        <p className="mb-8 text-muted-foreground">
          {language === "ar"
            ? "آخر المقالات والأخبار"
            : "Latest articles and updates"}
        </p>
        {posts.length === 0 ? (
          <div className="rounded-xl border border-dashed py-16 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              {language === "ar" ? "لا توجد مقالات منشورة بعد." : "No published posts yet."}
            </p>
          </div>
        ) : (
          <ul className="space-y-6">
            {posts.map((post) => {
              const title = language === "ar" ? (post.titleAr || post.titleEn) : (post.titleEn || post.titleAr);
              return (
                <li key={post.id}>
                  <article className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md">
                    <Link href={`/blog/${post.slug}`} className="block">
                      <h2 className="text-xl font-semibold text-foreground hover:text-primary">
                        {title}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">{post.date}</p>
                    </Link>
                    <Button variant="outline" size="sm" className="mt-4" asChild>
                      <Link href={`/blog/${post.slug}`}>
                        {language === "ar" ? "اقرأ المزيد" : "Read more"}
                      </Link>
                    </Button>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function BlogPage() {
  return (
    <I18nProvider>
      <BlogListContent />
    </I18nProvider>
  );
}
