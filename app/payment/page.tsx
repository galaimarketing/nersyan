"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, MapPin, ShieldCheck, BedDouble, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { CurrencySymbol } from "@/components/currency-symbol";

const MADINAH_IMG = "/%D8%A7%D9%84%D9%85%D8%B3%D8%AC%D8%AF%20%D8%A7%D9%84%D9%86%D8%A8%D9%88%D9%8A.jpg";

interface PendingBooking {
  roomId: string;
  roomName: string;
  total: number;
  guests: number;
  language: "ar" | "en";
}

function PaymentContent() {
  const { language, dir } = useI18n();
  const ar = language === "ar";
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
      if (!res.ok) throw new Error(json?.error ?? (ar ? "تعذّر بدء الدفع" : "Failed to start payment"));
      if (!json?.url) throw new Error(ar ? "لم يتم إنشاء رابط الدفع" : "No payment link returned");
      window.localStorage.removeItem("nersian-pending-booking");
      window.location.href = json.url as string;
    } catch (e) {
      setInvoiceError(e instanceof Error ? e.message : ar ? "فشل الدفع" : "Payment failed");
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
          try {
            const user = JSON.parse(userRaw) as { email?: string; fullName?: string; phone?: string };
            if (user.email) payload.guestEmail = user.email;
            if (user.fullName && !payload.guestName) payload.guestName = user.fullName;
            if (user.phone && !payload.guestPhone) payload.guestPhone = user.phone;
          } catch {
            // ignore
          }
          payload.status = "pending";
          payload.paymentStatus = "pending";
          await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload }),
          });
        } catch {
          // ignore
        }
        window.localStorage.removeItem("nersian-pending-booking");
      }
      window.alert(ar ? "تم تأكيد حجزك. يمكنك الدفع عند الوصول." : "Your booking is confirmed. You can pay on arrival.");
    }
    router.push("/my-bookings");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f1ec] px-4 py-10" dir={dir}>
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        {/* Madinah image side */}
        <div className="relative hidden min-h-[420px] md:block">
          <img src={MADINAH_IMG} alt="المسجد النبوي" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3d2f24]/90 via-[#3d2f24]/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-7 text-white">
            <p className="text-lg font-bold">نرسيان طيبة</p>
            <p className="mt-1 text-sm text-white/90">
              {ar ? "إقامة فاخرة على بُعد خطوات من المسجد النبوي" : "Luxury stays steps from the Prophet's Mosque"}
            </p>
          </div>
        </div>

        {/* Payment side */}
        <div className="flex flex-col p-7 sm:p-9">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#2c2420]">{ar ? "إتمام الدفع" : "Complete payment"}</h1>
            <p className="mt-2 text-sm text-[#6b6258]">
              {ar
                ? "ادفع الآن بأمان عبر بوابة Moyasar، أو اختر الدفع عند الوصول."
                : "Pay securely now via Moyasar, or choose to pay on arrival."}
            </p>
          </div>

          {booking ? (
            <div className="mb-6 rounded-2xl border border-[#ece5da] bg-[#faf8f4] p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--ring)]/10 text-[var(--ring)]">
                  <BedDouble className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-[#2c2420]">{booking.roomName}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-[#8a8178]">
                    <Users className="h-3.5 w-3.5" />
                    {booking.guests} {ar ? "ضيف" : "guests"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between border-t border-[#ece5da] pt-4">
                <span className="text-sm text-[#6b6258]">{ar ? "الإجمالي" : "Total"}</span>
                <span className="text-xl font-bold text-[var(--ring)]">
                  {booking.total} <CurrencySymbol />
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-6 rounded-2xl border border-dashed border-[#ddd3c6] bg-[#faf8f4] p-5 text-center text-sm text-[#8a8178]">
              {ar ? "لا توجد عملية حجز حالية. يرجى اختيار غرفة أولاً." : "No active booking found. Please select a room first."}
            </div>
          )}

          {invoiceError && <p className="mb-4 text-center text-sm text-destructive">{invoiceError}</p>}

          <div className="space-y-3">
            <Button
              size="lg"
              className="flex w-full items-center justify-center gap-2 bg-[var(--ring)] text-white shadow-md hover:bg-[var(--ring)]/90"
              onClick={startMoyasarInvoice}
              disabled={!booking || invoiceLoading}
            >
              {invoiceLoading ? (
                ar ? "جاري التحضير..." : "Preparing..."
              ) : (
                <>
                  <ExternalLink className="h-5 w-5" />
                  {ar ? "ادفع الآن" : "Pay now"}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex w-full items-center justify-center gap-2"
              onClick={handleOnArrival}
              disabled={!booking || invoiceLoading}
            >
              <MapPin className="h-5 w-5" />
              {ar ? "الدفع عند الوصول" : "Pay on arrival"}
            </Button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#8a8178]">
            <ShieldCheck className="h-4 w-4 text-[#1f9d55]" />
            <span>{ar ? "دفع آمن · mada · Visa · Mastercard" : "Secure payment · mada · Visa · Mastercard"}</span>
          </div>

          <div className="mt-4 text-center">
            <Link href="/rooms" className="text-xs text-[var(--ring)] hover:underline">
              {ar ? "العودة للغرف" : "Back to rooms"}
            </Link>
          </div>
        </div>
      </div>
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
