"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { CurrencySymbol } from "@/components/currency-symbol";
import { addCustomerBookingToStore } from "@/lib/admin-store";

interface PendingBooking {
  roomId: string;
  roomName: string;
  total: number;
  guests: number;
  language: "ar" | "en";
}

function PaymentContent() {
  const { language, dir } = useI18n();
  const router = useRouter();
  const [booking, setBooking] = useState<PendingBooking | null>(null);
  const [rawPayload, setRawPayload] = useState<string | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const userRaw = window.localStorage.getItem("nersian-user");
    if (!userRaw) {
      router.replace("/auth/signin?next=/payment");
      return;
    }
    const raw = window.localStorage.getItem("nersian-pending-booking");
    if (!raw) return;
    setRawPayload(raw);
    try {
      const parsed = JSON.parse(raw);
      setBooking({
        roomId: parsed.roomId,
        roomName: parsed.roomName,
        total: parsed.total,
        guests: parsed.guests,
        language: parsed.language,
      });
    } catch {
      // ignore
    }
  }, [router]);

  const startMoyasarInvoice = async () => {
    setInvoiceError(null);
    if (!rawPayload) return;
    const userRaw = window.localStorage.getItem("nersian-user");
    if (!userRaw) {
      router.push("/auth/signin?next=/payment");
      return;
    }
    try {
      setInvoiceLoading(true);
      const payload = JSON.parse(rawPayload);
      try {
        const user = JSON.parse(userRaw) as { email?: string; fullName?: string; phone?: string };
        if (user.email) payload.guestEmail = user.email;
        if (user.fullName && !payload.guestName) payload.guestName = user.fullName;
        if (user.phone && !payload.guestPhone) payload.guestPhone = user.phone;
      } catch {
        // ignore
      }

      const res = await fetch("/api/moyasar/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error ?? "Failed to start payment");
      }
      if (!json?.url) {
        throw new Error("No payment link returned");
      }
      window.localStorage.removeItem("nersian-pending-booking");
      window.location.href = json.url as string;
    } catch (e) {
      setInvoiceError(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleOnArrival = async () => {
    if (typeof window !== "undefined") {
      const userRaw = window.localStorage.getItem("nersian-user");
      if (!userRaw) {
        router.push("/auth/signin?next=/payment");
        return;
      }
      if (rawPayload) {
        try {
          const payload = JSON.parse(rawPayload);
          if (userRaw) {
            try {
              const user = JSON.parse(userRaw) as { email?: string; fullName?: string; phone?: string };
              if (user.email) payload.guestEmail = user.email;
              if (user.fullName && !payload.guestName) payload.guestName = user.fullName;
              if (user.phone && !payload.guestPhone) payload.guestPhone = user.phone;
            } catch {
              // ignore
            }
          }
          payload.status = "pending";
          payload.paymentStatus = "pending";
          await addCustomerBookingToStore(payload);
        } catch {
          // ignore
        }
        window.localStorage.removeItem("nersian-pending-booking");
      }
      window.alert(
        language === "ar"
          ? "تم تأكيد حجزك. يمكنك الدفع عند الوصول."
          : "Your booking is confirmed. You can pay on arrival."
      );
    }
    router.push("/my-bookings");
  };

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-foreground">
              {language === "ar" ? "الدفع" : "Payment"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === "ar"
                ? "ادفع عبر صفحة Moyasar الآمنة، أو اختر الدفع عند الوصول."
                : "Pay on Moyasar’s secure page, or choose pay on arrival."}
            </p>
          </div>

          {booking ? (
            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "الغرفة" : "Room"}
                  </p>
                  <p className="text-base font-medium text-foreground">{booking.roomName}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {language === "ar" ? "عدد الضيوف" : "Guests"}
                  </span>
                  <span className="font-medium">{booking.guests}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {language === "ar" ? "الإجمالي" : "Total"}
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {booking.total} <CurrencySymbol />
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              {language === "ar"
                ? "لا توجد عملية حجز حالية. يرجى اختيار غرفة أولاً."
                : "No active booking found. Please select a room first."}
            </p>
          )}

          {invoiceError && (
            <p className="text-center text-sm text-destructive">{invoiceError}</p>
          )}

          <div className="space-y-3">
            <Button
              variant="default"
              size="lg"
              className="flex w-full items-center justify-center gap-3"
              onClick={startMoyasarInvoice}
              disabled={!booking || invoiceLoading}
            >
              {invoiceLoading ? (
                language === "ar" ? "جاري التحضير..." : "Preparing..."
              ) : (
                <>
                  <ExternalLink className="h-5 w-5" />
                  {language === "ar" ? "الدفع عبر Moyasar" : "Pay on Moyasar"}
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="flex w-full items-center justify-center gap-3 border-dashed"
              onClick={handleOnArrival}
              disabled={!booking || invoiceLoading}
            >
              <MapPin className="h-5 w-5" />
              {language === "ar" ? "الدفع عند الوصول" : "Pay on arrival"}
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {language === "ar"
              ? "سيتم فتح صفحة دفع Moyasar في نفس النافذة."
              : "You’ll be taken to Moyasar’s checkout in this window."}
          </p>

          <div className="text-center">
            <Link href="/rooms" className="text-xs text-primary hover:underline">
              {language === "ar" ? "العودة للغرف" : "Back to rooms"}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <I18nProvider>
      <PaymentContent />
    </I18nProvider>
  );
}
