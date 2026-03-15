"use client";

import Link from "next/link";
import { Plus, FileText, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminData } from "@/components/admin-data-provider";
import { useI18n } from "@/lib/i18n";

export default function AdminBlogPage() {
  const { t } = useI18n();
  const { data } = useAdminData();
  const posts = data.blogPosts;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{t("admin.blogTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("admin.manageBlogPosts")}</p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new" className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t("admin.newPost")}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.posts")}</CardTitle>
          <CardDescription>{t("admin.allBlogEntries")}</CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm font-medium text-foreground">{t("admin.noPostsYet")}</p>
              <p className="text-xs text-muted-foreground">{t("admin.createFirstPost")}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{post.titleEn || post.titleAr}</p>
                      <p className="text-sm text-muted-foreground">
                        /blog/{post.slug} · {post.date} · {post.status}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/blog/${post.id}/edit`}>{t("admin.edit")}</Link>
                  </Button>
                  {post.status === "published" && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">{t("admin.view")}</Link>
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Button variant="outline" asChild>
        <Link href="/admin" className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("admin.backToDashboard")}
        </Link>
      </Button>
    </div>
  );
}
