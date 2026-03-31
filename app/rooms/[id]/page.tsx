"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Maximize,
  Car,
  Wifi,
  Wind,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
  const galleryImages = room.images && room.images.length > 0 ? room.images : [room.image];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [room.id]);

  useEffect(() => {
    const activeThumb = thumbnailRefs.current[activeImageIndex];
    activeThumb?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeImageIndex]);

  const discountExpiresAtMs = room.discountExpiresAt ? new Date(room.discountExpiresAt).getTime() : null;
  const hasDiscount =
    room.originalPrice != null &&
    room.originalPrice > room.price &&
    (discountExpiresAtMs == null || discountExpiresAtMs > Date.now());

  const name = language === "ar" ? room.nameAr : room.nameEn;
  const description = language === "ar" ? room.descriptionAr : room.descriptionEn;

  const activeImage = galleryImages[Math.min(activeImageIndex, galleryImages.length - 1)] ?? room.image;
  const hasManyImages = galleryImages.length > 1;

  const goPrevImage = () => {
    if (!hasManyImages) return;
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const goNextImage = () => {
    if (!hasManyImages) return;
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background" dir={dir}>
      <Header />

      <main className="pb-20 pt-24 sm:pt-28 lg:pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
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

          <div className="grid gap-6 lg:gap-10 lg:grid-cols-[1.7fr,1fr]">
            {/* Gallery */}
            <section className="min-w-0">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card sm:rounded-3xl">
                <img
                  src={activeImage}
                  alt={name}
                  className="h-[240px] w-full object-cover sm:h-[320px] md:h-[440px]"
                />
                {hasManyImages && (
                  <>
                    <button
                      type="button"
                      onClick={goPrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60"
                      aria-label={language === "ar" ? "الصورة السابقة" : "Previous image"}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={goNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60"
                      aria-label={language === "ar" ? "الصورة التالية" : "Next image"}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2 py-1 text-xs text-white">
                      {activeImageIndex + 1}/{galleryImages.length}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 max-w-full grid grid-flow-col auto-cols-[5.25rem] gap-2 overflow-x-auto overscroll-x-contain pb-2 snap-x snap-mandatory sm:auto-cols-[7rem] sm:gap-3">
                {galleryImages.map((src, index) => (
                  <button
                    key={`${src}-${index}`}
                    type="button"
                    ref={(el) => {
                      thumbnailRefs.current[index] = el;
                    }}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative h-16 w-full snap-start overflow-hidden rounded-xl border sm:h-20 sm:rounded-2xl ${
                      activeImageIndex === index
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
            <section className="min-w-0 space-y-6 rounded-2xl border border-border bg-card p-4 shadow-sm sm:rounded-3xl sm:p-6">
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
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-primary">
                      {room.price} <CurrencySymbol />
                      <span className="ms-1 text-xs font-normal text-muted-foreground">
                        / {t("booking.perNight")}
                      </span>
                    </p>
                    {hasDiscount && (
                      <p className="text-sm text-muted-foreground line-through">
                        {room.originalPrice} <CurrencySymbol />
                      </p>
                    )}
                  </div>
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
  const { rooms, loading } = usePublicRooms();
  const room = rooms.find((r) => r.id === id);

  if (loading) {
    return (
      <I18nProvider>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        </div>
      </I18nProvider>
    );
  }

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

