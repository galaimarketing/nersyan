"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { CurrencySymbol } from "@/components/currency-symbol";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminBooking } from "@/lib/admin-store";

function MyBookingsContent() {
  const { t, language, dir } = useI18n();
  const router = useRouter();
  const [bookings, setBookings] = useState<AdminBooking[] | null>(null);
  const [guestName, setGuestName] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (typeof window !== "undefined") {
        const userRaw = window.localStorage.getItem("nersian-user");
        if (!userRaw) {
          router.replace("/auth/signin?next=/my-bookings");
          return;
        }
      }
      try {
        const res = await fetch("/api/admin/data", { cache: "no-store" });
        if (!res.ok) {
          setBookings([]);
          return;
        }
        const data = (await res.json()) as { bookings?: AdminBooking[]; guests?: { id: string; name: string }[] };

        const user = JSON.parse(window.localStorage.getItem("nersian-user") ?? "{}") as { email?: string };
        const email = user.email;

        // Filter by signed-in user email (stable across refresh)
        let filtered = (data.bookings ?? []).filter((b) => (email ? b.email === email : true));
        if (filtered.length > 0) setGuestName(filtered[0].guestName);

        setBookings(filtered);
      } catch {
        setBookings([]);
      }
    }

    load();
  }, []);

  const hasBookings = bookings != null && bookings.length > 0;

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />
      <main className="pb-20 pt-32">
        <div className="mx-auto max-w-3xl px-6 lg:px-12">
          <h1 className="mb-1 text-3xl font-bold text-foreground md:text-4xl">
            {t("myBookings.title")}
          </h1>
          {guestName && (
            <p className="mb-1 text-lg font-semibold text-[var(--ring)]">
              {language === "ar" ? `مرحباً ${guestName}` : `Welcome, ${guestName}`}
            </p>
          )}
          <p className="mb-8 text-sm text-muted-foreground">
            {t("myBookings.subtitle")}
          </p>

          <div className="space-y-6">
            {!bookings && (
              <div className="rounded-2xl border border-border bg-card/70 p-6 text-sm text-muted-foreground shadow-sm backdrop-blur-sm">
                {t("general.loading")}
              </div>
            )}

            {bookings && hasBookings && (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-border bg-card/80 p-4 text-sm shadow-sm backdrop-blur-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {language === "ar" ? "رقم الحجز" : "Booking ID"}
                        </p>
                        <p className="font-semibold text-foreground">{b.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {language === "ar" ? "المبلغ" : "Amount"}
                        </p>
                        <p className="font-semibold text-primary">
                          {b.amount.toLocaleString()} <CurrencySymbol />
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {language === "ar" ? "الغرفة" : "Room"}
                        </p>
                        <p>
                          {b.room} · #{b.roomNumber}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {language === "ar" ? "التواريخ" : "Dates"}
                        </p>
                        <p>
                          {b.checkIn} → {b.checkOut}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {language === "ar" ? "الضيوف" : "Guests"}
                        </p>
                        <p>{b.guests}</p>
                      </div>
                    </div>
                    {b.status && (
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {language === "ar" ? "الحالة:" : "Status:"} {b.status}
                        </span>
                        <span>
                          {language === "ar" ? "تم الإنشاء:" : "Created:"} {b.createdAt}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {bookings && !hasBookings && (
              <div className="rounded-2xl border border-border bg-card/70 p-6 shadow-sm backdrop-blur-sm">
                <p className="mb-3 text-sm text-muted-foreground">
                  {t("myBookings.empty")}
                </p>
                <p className="mb-6 text-sm text-muted-foreground">
                  {t("myBookings.help")}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/#contact">
                      {language === "ar" ? "تواصل معنا" : "Contact us"}
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/rooms">
                      {language === "ar" ? "متابعة الحجز" : "Start a new booking"}
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function MyBookingsPage() {
  return (
    <I18nProvider>
      <MyBookingsContent />
    </I18nProvider>
  );
}

