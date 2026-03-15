"use client";

import * as React from "react";
import { format, differenceInDays } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { CalendarIcon, Phone, User, Users } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/nested-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useI18n } from "@/lib/i18n";
import { CurrencySymbol } from "@/components/currency-symbol";
import { useRouter } from "next/navigation";
import { loadSettings } from "@/lib/settings";

interface Room {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  image: string;
}

interface BookingDialogProps {
  room: Room;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingDialog({ room, open, onOpenChange }: BookingDialogProps) {
  const { t, language, dir } = useI18n();
  const router = useRouter();
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [guests, setGuests] = React.useState(1);
  const [guestName, setGuestName] = React.useState("");
  const [guestPhone, setGuestPhone] = React.useState("");
  const [guestEmail, setGuestEmail] = React.useState("");
  const [taxRatePercent, setTaxRatePercent] = React.useState(15);

  React.useEffect(() => {
    const settings = loadSettings();
    setTaxRatePercent(settings.taxRatePercent);
  }, [open]);

  const locale = language === "ar" ? ar : enUS;
  const roomName = language === "ar" ? room.nameAr : room.nameEn;

  const rawNights =
    dateRange?.from && dateRange?.to
      ? differenceInDays(dateRange.to, dateRange.from)
      : dateRange?.from
      ? 1
      : 0;
  const nights = rawNights <= 0 && dateRange?.from ? 1 : rawNights;
  const subtotal = nights * room.price;
  const taxAmount = Math.round(subtotal * (taxRatePercent / 100));
  const total = subtotal + taxAmount;

  const handleSubmit = () => {
    if (typeof window !== "undefined") {
      const payload = {
        roomId: room.id,
        roomName,
        dateRange,
        guests,
        guestName,
        guestPhone,
        guestEmail,
        total,
        language,
      };
      window.localStorage.setItem("nersian-pending-booking", JSON.stringify(payload));
    }

    onOpenChange(false);
    router.push("/payment");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-xl" dir={dir}>
          <DialogHeader className="border-b p-6">
            <DialogTitle>{t("booking.bookNow")}</DialogTitle>
            <DialogDescription>
              {roomName} - {room.price} <CurrencySymbol /> / {t("booking.perNight")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-6 p-6">
            {/* Date Selection */}
            <div className="flex flex-col gap-2">
              <Label>{t("booking.selectDates")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-start font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="me-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "PPP", { locale })} -{" "}
                          {format(dateRange.to, "PPP", { locale })}
                        </>
                      ) : (
                        format(dateRange.from, "PPP", { locale })
                      )
                    ) : (
                      <span>{t("booking.selectDates")}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    disabled={{ before: new Date() }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Guests */}
            <div className="flex flex-col gap-2">
              <Label>{t("booking.guests")}</Label>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min={1}
                  max={6}
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                  className="w-24"
                />
              </div>
            </div>

            {/* Guest Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>{t("auth.fullName")}</Label>
                <div className="flex items-center gap-2 rounded-lg border px-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder={language === "ar" ? "محمد أحمد" : "John Doe"}
                    className="border-0 shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t("auth.phone")}</Label>
                <div className="flex items-center gap-2 rounded-lg border px-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+966 5XX XXX XXXX"
                    className="border-0 shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            {nights > 0 && (
              <div className="rounded-lg bg-secondary/50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span>{nights} {language === "ar" ? "ليالي" : "nights"} x {room.price} <CurrencySymbol /></span>
                  <span className="font-semibold">{subtotal} <CurrencySymbol /></span>
                </div>
                {taxRatePercent > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span>{t("payment.tax")} (+{taxRatePercent}%)</span>
                    <span>{taxAmount} <CurrencySymbol /></span>
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between border-t pt-2">
                  <span className="font-semibold">{t("payment.total")}</span>
                  <span className="text-lg font-bold text-primary">{total} <CurrencySymbol /></span>
                </div>
              </div>
            )}

            {/* Price Note */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-900/20">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                {language === "ar"
                  ? "السعر يشمل الإقامة فقط. خدمات النقل (المطار والحرم) والغسيل والمطعم غير مشمولة ومتوفرة برسوم إضافية."
                  : "Price includes accommodation only. Transportation (airport & mosque transfers), laundry, and restaurant services are not included and available at extra cost."}
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col items-center justify-between gap-2 border-t px-6 py-4 sm:flex-row">
            <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row">
              <DialogClose asChild>
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
                  {t("general.cancel")}
                </Button>
              </DialogClose>
              <Button 
                className="w-full sm:w-auto" 
                disabled={nights === 0 || !guestName}
                onClick={handleSubmit}
              >
                {t("payment.payNow")} - {total} <CurrencySymbol />
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
