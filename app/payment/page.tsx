"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Apple, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const MOYASAR_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY ?? "";

  const [cardFormOpen, setCardFormOpen] = useState<"card" | "apple" | null>(null);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardMonth, setCardMonth] = useState("");
  const [cardYear, setCardYear] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [moyasarLoading, setMoyasarLoading] = useState(false);
  const [moyasarError, setMoyasarError] = useState<string | null>(null);

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
      setCardName(parsed.guestName ?? "");
    } catch {
      // ignore parse errors
    }
  }, []);

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
          // Ensure email (and name/phone if available) come from signed-in user
          if (userRaw) {
            try {
              const user = JSON.parse(userRaw) as { email?: string; fullName?: string; phone?: string };
              if (user.email) payload.guestEmail = user.email;
              if (user.fullName && !payload.guestName) payload.guestName = user.fullName;
              if (user.phone && !payload.guestPhone) payload.guestPhone = user.phone;
            } catch {
              // ignore malformed user data
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

  const createToken = async () => {
    if (!MOYASAR_PUBLISHABLE_KEY) throw new Error("Moyasar publishable key missing");
    const res = await fetch("https://api.moyasar.com/v1/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publishable_api_key: MOYASAR_PUBLISHABLE_KEY,
        save_only: true,
        name: cardName,
        number: cardNumber,
        month: cardMonth,
        year: cardYear,
        cvc: cardCvc,
      }),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(json?.source?.message ?? json?.message ?? "Tokenization failed");
    }
    if (!json?.token) throw new Error("Token missing");
    return json.token as string;
  };

  const handleMoyasarCardSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMoyasarError(null);
    if (!rawPayload) return;

    if (!cardName || !cardNumber || !cardMonth || !cardYear || !cardCvc) {
      setMoyasarError(language === "ar" ? "يرجى تعبئة بيانات البطاقة." : "Please fill card details.");
      return;
    }
    try {
      if (typeof window !== "undefined") {
        const userRaw = window.localStorage.getItem("nersian-user");
        if (!userRaw) {
          router.push("/auth/signin?next=/payment");
          return;
        }
        setMoyasarLoading(true);

        const payload = JSON.parse(rawPayload);
        const user = JSON.parse(userRaw) as { email?: string; fullName?: string; phone?: string };
        if (user.email) payload.guestEmail = user.email;
        if (user.fullName && !payload.guestName) payload.guestName = user.fullName;
        if (user.phone && !payload.guestPhone) payload.guestPhone = user.phone;

        // 1) Tokenize card in the browser
        const token = await createToken();

        // 2) Initiate payment (creates pending booking on server)
        const initRes = await fetch("/api/moyasar/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, payload }),
        });
        const initJson = await initRes.json();
        if (!initRes.ok) {
          throw new Error(initJson?.error ?? "Failed to initiate payment");
        }

        // Prevent duplicate booking creation if user returns
        window.localStorage.removeItem("nersian-pending-booking");

        // 3) Redirect to Moyasar transaction page
        window.location.href = initJson.transaction_url as string;
      }
    } catch (err) {
      setMoyasarError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setMoyasarLoading(false);
    }
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
              onClick={() => {
                setCardFormOpen("card");
                setMoyasarError(null);
              }}
              disabled={!booking}
            >
              <CreditCard className="h-5 w-5" />
              {language === "ar" ? "الدفع ببطاقة فيزا / ماستركارد" : "Pay with Visa / Mastercard"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex w-full items-center justify-center gap-3"
              onClick={() => {
                setCardFormOpen("apple");
                setMoyasarError(null);
              }}
              disabled={!booking}
            >
              <Apple className="h-5 w-5" />
              {language === "ar" ? "الدفع عبر Apple Pay" : "Pay with Apple Pay"}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="flex w-full items-center justify-center gap-3 border-dashed"
              onClick={handleOnArrival}
              disabled={!booking}
            >
              <MapPin className="h-5 w-5" />
              {language === "ar" ? "الدفع عند الوصول" : "Pay on arrival"}
            </Button>
          </div>

          {cardFormOpen && (
            <div className="rounded-2xl border bg-card/70 p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-foreground">
                  {language === "ar" ? "بيانات البطاقة" : "Card details"}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCardFormOpen(null)}
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </Button>
              </div>

              <form onSubmit={handleMoyasarCardSubmit} className="mt-4 grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="cardName">{language === "ar" ? "اسم حامل البطاقة" : "Card holder name"}</Label>
                  <Input id="cardName" value={cardName} onChange={(e) => setCardName(e.target.value)} autoComplete="cc-name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cardNumber">{language === "ar" ? "رقم البطاقة" : "Card number"}</Label>
                  <Input id="cardNumber" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} inputMode="numeric" autoComplete="cc-number" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="cardMonth">{language === "ar" ? "MM" : "Month"}</Label>
                    <Input id="cardMonth" value={cardMonth} onChange={(e) => setCardMonth(e.target.value)} inputMode="numeric" autoComplete="cc-exp-month" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cardYear">{language === "ar" ? "YY" : "Year"}</Label>
                    <Input id="cardYear" value={cardYear} onChange={(e) => setCardYear(e.target.value)} inputMode="numeric" autoComplete="cc-exp-year" />
                  </div>
                  <div className="grid gap-2 col-span-1">
                    <Label htmlFor="cardCvc">CVC</Label>
                    <Input id="cardCvc" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} inputMode="numeric" autoComplete="cc-csc" />
                  </div>
                </div>

                {moyasarError && (
                  <p className="text-sm text-destructive">{moyasarError}</p>
                )}

                <Button type="submit" disabled={moyasarLoading} className="mt-1">
                  {moyasarLoading ? (language === "ar" ? "جاري الإعداد..." : "Processing...") : (language === "ar" ? "ادفع الآن" : "Pay now")}
                </Button>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  {language === "ar" ? "المعلومات تُرسل إلى Moyasar مباشرةً" : "Card data is sent directly to Moyasar"}
                </div>
              </form>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground">
            {language === "ar"
              ? "الدفع عبر Moyasar آمن."
              : "Secure payments via Moyasar."}
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

