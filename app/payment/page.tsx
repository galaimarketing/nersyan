"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Apple, MapPin } from "lucide-react";
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

  useEffect(() => {
    if (typeof window === "undefined") return;
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
      // ignore parse errors
    }
  }, []);

  const handlePay = async (method: "card" | "apple" | "on-arrival") => {
    if (typeof window !== "undefined") {
      if (rawPayload) {
        try {
          const payload = JSON.parse(rawPayload);
          await addCustomerBookingToStore(payload);
        } catch {
          // ignore
        }
        window.localStorage.removeItem("nersian-pending-booking");
      }
      if (method === "on-arrival") {
        window.alert(
          language === "ar"
            ? "تم تأكيد حجزك. يمكنك الدفع عند الوصول."
            : "Your booking is confirmed. You can pay on arrival."
        );
      } else {
        window.alert(
          language === "ar"
            ? "تمت عملية الدفع بنجاح (تجريبيًا)."
            : "Payment completed successfully (demo)."
        );
      }
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              {language === "ar" ? "الدفع" : "Payment"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === "ar"
                ? "اختر طريقة الدفع لإتمام الحجز."
                : "Choose a payment method to complete your booking."}
            </p>
          </div>

          {booking ? (
            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "الغرفة" : "Room"}
                  </p>
                  <p className="text-base font-medium text-foreground">
                    {booking.roomName}
                  </p>
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

          <div className="space-y-3">
            <Button
              variant="outline"
              size="lg"
              className="flex w-full items-center justify-center gap-3"
              onClick={() => handlePay("card")}
              disabled={!booking}
            >
              <CreditCard className="h-5 w-5" />
              {language === "ar" ? "الدفع ببطاقة فيزا / ماستركارد" : "Pay with Visa / Mastercard"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex w-full items-center justify-center gap-3"
              onClick={() => handlePay("apple")}
              disabled={!booking}
            >
              <Apple className="h-5 w-5" />
              {language === "ar" ? "الدفع عبر Apple Pay" : "Pay with Apple Pay"}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="flex w-full items-center justify-center gap-3 border-dashed"
              onClick={() => handlePay("on-arrival")}
              disabled={!booking}
            >
              <MapPin className="h-5 w-5" />
              {language === "ar" ? "الدفع عند الوصول" : "Pay on arrival"}
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {language === "ar"
              ? "هذه صفحة دفع تجريبية لأغراض العرض فقط."
              : "This is a demo payment page for preview purposes only."}
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

