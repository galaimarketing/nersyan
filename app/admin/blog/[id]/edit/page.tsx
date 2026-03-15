"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
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

export default function EditBlogPostPage() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { data, getBlogPostById, updateBlogPost } = useAdminData();
  const post = getBlogPostById(id);

  const [slug, setSlug] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [contentAr, setContentAr] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  useEffect(() => {
    if (post) {
      setSlug(post.slug);
      setTitleEn(post.titleEn);
      setTitleAr(post.titleAr);
      setContentEn(post.contentEn);
      setContentAr(post.contentAr);
      setStatus(post.status);
    }
  }, [post]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;
    const finalSlug = slug.trim();
    const duplicate = data.blogPosts.find((p) => p.id !== id && p.slug === finalSlug);
    if (duplicate) {
      alert(t("admin.anotherPostUsesSlug"));
      return;
    }
    updateBlogPost(id, {
      slug: finalSlug,
      titleEn: titleEn.trim(),
      titleAr: titleAr.trim(),
      contentEn: contentEn.trim(),
      contentAr: contentAr.trim(),
      status,
    });
    router.push("/admin/blog");
  };

  if (!post) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">{t("admin.postNotFound")}</p>
        <Button variant="outline" asChild>
          <Link href="/admin/blog">{t("admin.backToBlog")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/blog">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("admin.editPost")}</h1>
          <p className="text-muted-foreground">{t("admin.updateBlogPost")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.postDetails")}</CardTitle>
          <CardDescription>URL: /blog/{slug || "(slug)"}</CardDescription>
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
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="titleEn">{t("admin.titleEnglish")}</Label>
                <Input
                  id="titleEn"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
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
                textareaId="contentEn-edit"
                value={contentEn}
                onChange={setContentEn}
                placeholder="Content in English..."
                dir="ltr"
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("admin.contentArabic")}</Label>
              <RichTextToolbar
                textareaId="contentAr-edit"
                value={contentAr}
                onChange={setContentAr}
                placeholder="المحتوى بالعربية..."
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
              <Button type="submit">{t("admin.saveChanges")}</Button>
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
