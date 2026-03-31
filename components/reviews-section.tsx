"use client";

import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";

type PublicReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export function ReviewsSection() {
  const { t, dir } = useI18n();
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [sending, setSending] = useState(false);
  const [statusText, setStatusText] = useState("");

  useEffect(() => {
    fetch("/api/reviews", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: PublicReview[]) => setReviews(Array.isArray(rows) ? rows : []))
      .catch(() => setReviews([]));
  }, []);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [reviews.length]);

  const average = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  const visibleReviews = useMemo(() => {
    if (reviews.length <= 3) return reviews;
    return [0, 1, 2].map((offset) => reviews[(activeReviewIndex + offset) % reviews.length]);
  }, [activeReviewIndex, reviews]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;
    setSending(true);
    setStatusText("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), comment: comment.trim(), rating }),
      });
      if (!res.ok) throw new Error("failed");
      setName("");
      setComment("");
      setRating(5);
      setFormOpen(false);
      setStatusText(t("reviews.pendingNotice"));
    } catch {
      setStatusText(t("reviews.submitFailed"));
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="reviews" className="bg-background py-14" dir={dir}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">{t("reviews.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("reviews.subtitle")}</p>
          <div className="mt-4">
            <Button type="button" onClick={() => setFormOpen((v) => !v)}>
              {t("reviews.leaveReview")}
            </Button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {reviews.length > 0 ? `${average.toFixed(1)} / 5 • ${reviews.length}` : t("reviews.noReviews")}
          </p>
          {statusText ? <p className="mt-2 text-sm text-muted-foreground">{statusText}</p> : null}
        </div>

        <div className="space-y-6">
          {formOpen ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("reviews.leaveReview")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={submit} className="space-y-4">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("reviews.namePlaceholder")}
                    required
                  />
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setRating(v)}
                        className="rounded p-1"
                        aria-label={`rate-${v}`}
                      >
                        <Star
                          className={`h-5 w-5 ${v <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                        />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t("reviews.commentPlaceholder")}
                    rows={4}
                    required
                  />
                  <div className="flex items-center gap-2">
                    <Button type="submit" disabled={sending}>
                      {sending ? t("reviews.submitting") : t("reviews.submit")}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                      {t("general.cancel")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>{t("reviews.customerReviews")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("reviews.noReviews")}</p>
              ) : (
                visibleReviews.map((r) => (
                  <div key={r.id} className="rounded-lg border p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="font-medium text-foreground">{r.name}</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <Star
                            key={v}
                            className={`h-4 w-4 ${v <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.comment}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

