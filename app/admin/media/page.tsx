"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
import { Upload, ArrowLeft, ImageIcon, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminData } from "@/components/admin-data-provider";
import { useI18n } from "@/lib/i18n";

const IMAGE_EXT = /\.(jpe?g|png|gif|webp)$/i;
function isImageFile(file: File): boolean {
  if (file.type?.startsWith("image/")) return true;
  return IMAGE_EXT.test(file.name);
}
function getImageType(file: File): string {
  if (file.type?.startsWith("image/")) return file.type;
  const ext = (file.name.match(/\.([a-z]+)$/i)?.[1] ?? "").toLowerCase();
  const map: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp" };
  return map[ext] ?? "image/jpeg";
}

export default function AdminMediaPage() {
  const { t } = useI18n();
  const { data, addMedia, deleteMedia } = useAdminData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    e.target.value = "";

    const imageFiles = Array.from(files).filter(isImageFile);
    if (!imageFiles.length) {
      setUploadError("Please select image files (JPEG, PNG, GIF, WebP).");
      return;
    }

    setUploadError(null);
    setUploadSuccess(null);
    setUploading(true);

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const uploadUrl = `${baseUrl}/api/admin/upload`;

    try {
      const uploaded: { name: string; url: string; type: string }[] = [];
      for (const file of imageFiles) {
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_") || "image";
        const pathname = `media/${Date.now()}-${safeName}`;
        const contentType = getImageType(file);
        const blob = await upload(pathname, file, {
          access: "public",
          handleUploadUrl: uploadUrl,
          contentType,
        });
        uploaded.push({ name: file.name, url: blob.url, type: contentType });
        addMedia({ name: file.name, url: blob.url, type: contentType });
      }
      if (uploaded.length > 0) {
        setUploadSuccess(
          uploaded.length === 1
            ? `"${uploaded[0].name}" uploaded.`
            : `${uploaded.length} images uploaded.`
        );
        setTimeout(() => setUploadSuccess(null), 4000);
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      let msg = err.message;
      if (msg.includes("503") || msg.includes("Blob storage not configured")) {
        msg = "Blob storage not configured. In Vercel: connect a Blob store to this project and add BLOB_READ_WRITE_TOKEN, then redeploy.";
      }
      setUploadError(msg);
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{t("admin.mediaTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("admin.imagesAndFiles")}</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2"
          disabled={uploading}
        >
          <Upload className="h-4 w-4" />
          {uploading ? t("admin.uploading") ?? "Uploading…" : t("admin.upload")}
        </Button>
      </div>

      {uploadError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p className="font-medium">Upload failed</p>
          <p className="mt-1">{uploadError}</p>
          <a
            href="/api/admin/upload"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs underline"
          >
            Check Blob config →
          </a>
        </div>
      )}
      {uploadSuccess && (
        <div className="rounded-md border border-green-500/50 bg-green-500/10 px-4 py-2 text-sm text-green-700 dark:text-green-400">
          {uploadSuccess}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.library")}</CardTitle>
          <CardDescription>{t("admin.uploadedMediaFiles")}</CardDescription>
        </CardHeader>
        <CardContent>
          {data.media.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm font-medium text-foreground">{t("admin.noMediaYet")}</p>
              <p className="text-xs text-muted-foreground">{t("admin.uploadImagesToUse")}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.media.map((item) => (
                <div
                  key={item.id}
                  className="group overflow-hidden rounded-lg border bg-muted/30"
                >
                  <div className="relative aspect-video">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute end-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => deleteMedia(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-2">
                    <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                  </div>
                </div>
              ))}
            </div>
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
