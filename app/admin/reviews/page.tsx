"use client";

import { Check, Inbox, Star, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminData } from "@/components/admin-data-provider";
import { useI18n } from "@/lib/i18n";

export default function AdminReviewsPage() {
  const { data, updateReviewStatus } = useAdminData();
  const { t } = useI18n();
  const reviews = data.reviews ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">{t("admin.reviews")}</h2>
        <p className="text-sm text-muted-foreground">{t("admin.reviewsDesc")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.reviewModeration")}</CardTitle>
          <CardDescription>{t("admin.reviewModerationHelp")}</CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
              <Inbox className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm font-medium text-foreground">{t("admin.noReviewsYet")}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.createdAt}</p>
                    </div>
                    <Badge variant={r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : "secondary"}>
                      {r.status === "approved" ? t("admin.approved") : r.status === "rejected" ? t("admin.rejected") : t("admin.pending")}
                    </Badge>
                  </div>

                  <div className="mb-2 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <Star
                        key={v}
                        className={`h-4 w-4 ${v <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>

                  <p className="mb-3 text-sm text-muted-foreground">{r.comment}</p>

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => updateReviewStatus(r.id, "approved")}>
                      <Check className="me-1 h-4 w-4" />
                      {t("admin.approve")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateReviewStatus(r.id, "rejected")}>
                      <X className="me-1 h-4 w-4" />
                      {t("admin.reject")}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

