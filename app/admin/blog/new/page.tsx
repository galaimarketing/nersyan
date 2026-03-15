"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminData } from "@/components/admin-data-provider";
import { RichTextToolbar } from "@/components/rich-text-toolbar";
import { useI18n } from "@/lib/i18n";

function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "post";
}

export default function NewBlogPostPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { data, addBlogPost } = useAdminData();
  const [slug, setSlug] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [contentAr, setContentAr] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  const handleTitleEnChange = (v: string) => {
    setTitleEn(v);
    if (!slug || slug === slugify(titleEn)) setSlug(slugify(v));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSlug = slug.trim() || slugify(titleEn) || "post";
    if (data.blogPosts.some((p) => p.slug === finalSlug)) {
      alert(t("admin.postSlugExists"));
      return;
    }
    addBlogPost({
      slug: finalSlug,
      titleEn: titleEn.trim() || "Untitled",
      titleAr: titleAr.trim() || titleEn.trim() || "بدون عنوان",
      contentEn: contentEn.trim(),
      contentAr: contentAr.trim(),
      date: new Date().toISOString().slice(0, 10),
      status,
    });
    router.push("/admin/blog");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/blog">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("admin.newPostTitle")}</h1>
          <p className="text-muted-foreground">{t("admin.createBilingualPost")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.postDetails")}</CardTitle>
          <CardDescription>{t("admin.slugUsedInUrl")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="slug">{t("admin.urlSlug")}</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. my-first-post"
              />
              <p className="text-xs text-muted-foreground">Link: /blog/{slug || slugify(titleEn) || "post"}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="titleEn">{t("admin.titleEnglish")}</Label>
                <Input
                  id="titleEn"
                  value={titleEn}
                  onChange={(e) => handleTitleEnChange(e.target.value)}
                  placeholder="Post title in English"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="titleAr">{t("admin.titleArabic")}</Label>
                <Input
                  id="titleAr"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder="عنوان المقال بالعربية"
                  dir="rtl"
                  className="text-end"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t("admin.contentEnglish")}</Label>
              <RichTextToolbar
                textareaId="contentEn"
                value={contentEn}
                onChange={setContentEn}
                placeholder="Write content in English..."
                dir="ltr"
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("admin.contentArabic")}</Label>
              <RichTextToolbar
                textareaId="contentAr"
                value={contentAr}
                onChange={setContentAr}
                placeholder="اكتب المحتوى بالعربية..."
                dir="rtl"
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("admin.status")}</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "published")}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t("admin.draft")}</SelectItem>
                  <SelectItem value="published">{t("admin.published")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit">{t("admin.savePost")}</Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/blog">{t("admin.cancel")}</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
