"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Users, Maximize, Car, Wifi, Wind } from "lucide-react";
import { usePublicRooms } from "@/lib/public-rooms";
import type { Room } from "@/lib/rooms-data";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BookingDialog } from "@/components/booking-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { CurrencySymbol } from "@/components/currency-symbol";

function RoomDetailsContent({ room }: { room: Room }) {
  const { t, language, dir } = useI18n();
  const [activeImage, setActiveImage] = useState(
    room.images && room.images.length > 0 ? room.images[0] : room.image
  );
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const name = language === "ar" ? room.nameAr : room.nameEn;
  const description = language === "ar" ? room.descriptionAr : room.descriptionEn;

  const galleryImages = room.images && room.images.length > 0 ? room.images : [room.image];

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />

      <main className="pb-20 pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          {/* Back link */}
          <div className="mb-6">
            <Link
              href="/rooms"
              className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {language === "ar" ? (
                <>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  {language === "ar" ? "العودة لجميع الغرف" : "Back to all rooms"}
                </>
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Back to all rooms
                </>
              )}
            </Link>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.7fr,1fr]">
            {/* Gallery */}
            <section>
              <div className="overflow-hidden rounded-3xl border border-border bg-card">
                <img
                  src={activeImage}
                  alt={name}
                  className="h-[360px] w-full object-cover md:h-[440px]"
                />
              </div>

              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {galleryImages.map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImage(src)}
                    className={`relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-2xl border ${
                      activeImage === src
                        ? "border-primary ring-2 ring-primary/40"
                        : "border-border"
                    }`}
                  >
                    <img
                      src={src}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </section>

            {/* Details & booking */}
            <section className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
                  {name}
                </h1>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {room.capacity}{" "}
                    {language === "ar"
                      ? room.capacity > 1
                        ? "أشخاص"
                        : "شخص"
                      : room.capacity > 1
                      ? "guests"
                      : "guest"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Maximize className="h-4 w-4" />
                  <span>{room.size} m²</span>
                </div>
                <Badge variant="secondary">
                  {language === "ar" ? "موقف سيارات مجاني" : "Free parking"}
                </Badge>
              </div>

              {/* Amenities quick list */}
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-foreground">
                  {language === "ar" ? "المزايا الرئيسية" : "Key amenities"}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                    <Wifi className="h-3 w-3" />
                    {language === "ar" ? "واي فاي مجاني" : "Free WiFi"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                    <Wind className="h-3 w-3" />
                    {language === "ar" ? "تكييف" : "AC"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                    <Car className="h-3 w-3" />
                    {language === "ar" ? "موقف سيارات مجاني" : "Free parking"}
                  </span>
                </div>
              </div>

              {/* Price and CTA */}
              <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {language === "ar" ? "السعر لليلة" : "Price per night"}
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {room.price} <CurrencySymbol />
                    <span className="ms-1 text-xs font-normal text-muted-foreground">
                      / {t("booking.perNight")}
                    </span>
                  </p>
                </div>
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => setIsBookingOpen(true)}
                  disabled={!room.available}
                >
                  {room.available ? t("booking.bookNow") : t("booking.booked")}
                </Button>
              </div>

              {/* Availability note */}
              {room.roomsLeft && room.roomsLeft <= 3 && (
                <p className="text-xs text-amber-600 dark:text-amber-300">
                  {language === "ar"
                    ? `متبقي ${room.roomsLeft} غرف فقط لهذا النوع من الغرف.`
                    : `Only ${room.roomsLeft} rooms of this type left.`}
                </p>
              )}
            </section>
          </div>
        </div>

        {/* Booking dialog */}
        <BookingDialog
          room={room}
          open={isBookingOpen}
          onOpenChange={setIsBookingOpen}
        />
      </main>

      <Footer />
    </div>
  );
}

export default function RoomDetailsPage({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const resolved = use(params);
  const id = typeof resolved.id === "string" ? resolved.id : "";
  const rooms = usePublicRooms();
  const room = rooms.find((r) => r.id === id);

  if (!room) {
    return (
      <I18nProvider>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
          <p className="mb-4 text-lg font-semibold text-foreground">
            الغرفة غير موجودة / Room not found
          </p>
          <Link href="/rooms" className="text-primary hover:underline">
            العودة لجميع الغرف / Back to all rooms
          </Link>
        </div>
      </I18nProvider>
    );
  }

  return (
    <I18nProvider>
      <RoomDetailsContent room={room} />
    </I18nProvider>
  );
}

