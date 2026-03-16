"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Upload, ArrowLeft, ImageIcon, Trash2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminData } from "@/components/admin-data-provider";
import { useI18n } from "@/lib/i18n";

const BLOB_HOST_SUFFIX = "blob.vercel-storage.com";
const SUPABASE_STORAGE_HOST = "supabase.co";

function isSupabaseUrl(url: string): boolean {
  try {
    return new URL(url).hostname.includes(SUPABASE_STORAGE_HOST);
  } catch {
    return false;
  }
}

function mediaSrc(url: string): string {
  if (!url?.startsWith("http")) return "";
  try {
    const u = new URL(url);
    if (u.hostname.includes(SUPABASE_STORAGE_HOST)) return url;
    if (u.hostname.endsWith(BLOB_HOST_SUFFIX)) {
      return `/api/admin/media?url=${encodeURIComponent(url)}`;
    }
  } catch {
    // ignore
  }
  return url;
}

const MAX_DATAURL_SIZE = 1024 * 1024; // 1MB: store inline so thumbnails show when Blob/proxy fails

function MediaThumbnail({ src, alt, dataUrl }: { src: string; alt: string; dataUrl?: string }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [proxyFailed, setProxyFailed] = useState(false);
  const [directFailed, setDirectFailed] = useState(false);
  const [loading, setLoading] = useState(!dataUrl);
  const proxyUrl = mediaSrc(src);
  const hasDataUrl = typeof dataUrl === "string" && dataUrl.startsWith("data:image");
  const useDirectUrl = isSupabaseUrl(src);
  const tryDirect = proxyFailed && src?.startsWith("http") && !useDirectUrl;
  const showPlaceholder = (proxyFailed && directFailed) || (proxyFailed && !tryDirect);

  useEffect(() => {
    if (hasDataUrl || useDirectUrl) {
      setLoading(false);
      return;
    }
    if (!proxyUrl || !src?.startsWith("http")) {
      setLoading(false);
      setProxyFailed(true);
      return;
    }
    setProxyFailed(false);
    setDirectFailed(false);
    setLoading(true);
    let revoked = false;
    fetch(proxyUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (revoked) return;
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setProxyFailed(false);
      })
      .catch(() => {
        if (!revoked) setProxyFailed(true);
      })
      .finally(() => {
        if (!revoked) setLoading(false);
      });
    return () => {
      revoked = true;
      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [src, proxyUrl, hasDataUrl, useDirectUrl]);

  const displaySrc = hasDataUrl ? dataUrl! : blobUrl;
  if (hasDataUrl && displaySrc) {
    return (
      <img
        src={displaySrc}
        alt={alt}
        className="h-full w-full object-cover object-center"
        loading="lazy"
      />
    );
  }
  if (directFailed && useDirectUrl) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-2 text-center text-muted-foreground">
        <ImageIcon className="h-12 w-12" />
        <a href={src} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary underline">
          Open image <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    );
  }
  if (useDirectUrl && src) {
    return (
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover object-center"
        loading="lazy"
        onError={() => setDirectFailed(true)}
      />
    );
  }
  if (!src?.startsWith("http")) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
        <ImageIcon className="h-12 w-12" />
        <span className="text-xs">No URL</span>
      </div>
    );
  }
  if (loading && !blobUrl && !tryDirect) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/30">
        <span className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (tryDirect && !directFailed) {
    return (
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover object-center"
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setDirectFailed(true)}
      />
    );
  }
  if (showPlaceholder) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-2 text-center text-muted-foreground">
        <ImageIcon className="h-12 w-12" />
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary underline"
        >
          Open image <ExternalLink className="h-3 w-3" />
        </a>
        <span className="text-[10px]">Re-upload to show thumbnail here</span>
      </div>
    );
  }
  if (blobUrl) {
    return (
      <img
        src={blobUrl}
        alt={alt}
        className="h-full w-full object-cover object-center"
        loading="lazy"
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted/30">
      <span className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

export default function AdminMediaPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();
  const { data, addMedia, deleteMedia } = useAdminData();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) {
      setUploadError("No file selected. Choose an image (e.g. .jpg).");
      setTimeout(() => setUploadError(null), 5000);
      return;
    }
    const fileList = Array.from(files);
    e.target.value = "";

    setUploadError(null);
    setUploadSuccess(null);
    setUploading(true);

    const uploadUrl = "/api/admin/upload";
    const uploaded: { name: string; url: string; type: string }[] = [];

    try {
      for (const file of fileList) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(uploadUrl, { method: "POST", body: formData, signal: controller.signal });
        clearTimeout(timeoutId);
        const json = (await res.json().catch(() => ({}))) as { ok?: boolean; files?: { name: string; url: string; type: string }[]; error?: string };
        if (!res.ok) {
          setUploadError(json.error || `Upload failed (${res.status}). Try a smaller image (under 4 MB).`);
          return;
        }
        if (json.files?.length) {
          for (const f of json.files) {
            uploaded.push(f);
            const dataUrl =
              file.size <= MAX_DATAURL_SIZE
                ? await new Promise<string | undefined>((resolve) => {
                    const r = new FileReader();
                    r.onload = () => resolve(typeof r.result === "string" ? r.result : undefined);
                    r.onerror = () => resolve(undefined);
                    r.readAsDataURL(file);
                  })
                : undefined;
            addMedia({ name: f.name, url: f.url, type: f.type, dataUrl });
          }
        }
      }
      if (uploaded.length > 0) {
        setUploadSuccess(
          uploaded.length === 1
            ? `"${uploaded[0].name}" uploaded.`
            : `${uploaded.length} images uploaded.`
        );
        setTimeout(() => setUploadSuccess(null), 6000);
      }
    } catch (e) {
      const isAbort = e instanceof Error && e.name === "AbortError";
      const msg = isAbort ? "Upload timed out (60s). Try a smaller image." : ((e instanceof Error ? e.message : null) || String(e) || "Upload failed. Check network.");
      setUploadError(msg);
      console.error("Upload error:", e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-[60vh] space-y-6">
      {uploading && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
          <span className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
          <span>{t("admin.uploading") ?? "Uploading…"}</span>
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{t("admin.mediaTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("admin.imagesAndFiles")}</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={uploading}
          className="sr-only"
          aria-label={t("admin.upload")}
        />
        <Button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {uploading ? (t("admin.uploading") ?? "Uploading…") : t("admin.upload")}
        </Button>
      </div>

      {uploadError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p className="font-medium">Upload failed</p>
          <p className="mt-1">{uploadError}</p>
          <p className="mt-2 text-xs opacity-90">
            Check .env.local: use Supabase (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY) and create a public “media” bucket in Supabase Storage.
          </p>
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
                  <div className="relative aspect-video min-h-[140px] bg-muted/50">
                    <MediaThumbnail src={item.url} alt={item.name} dataUrl={item.dataUrl} />
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
