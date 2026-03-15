"use client";

import { useRef } from "react";
import Link from "next/link";
import { Upload, ArrowLeft, ImageIcon, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminData } from "@/components/admin-data-provider";
import { useI18n } from "@/lib/i18n";

export default function AdminMediaPage() {
  const { t } = useI18n();
  const { data, addMedia, deleteMedia } = useAdminData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        addMedia({ name: file.name, url, type: file.type });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
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
        >
          <Upload className="h-4 w-4" />
          {t("admin.upload")}
        </Button>
      </div>

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
