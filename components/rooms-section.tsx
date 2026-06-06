"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { RoomCard } from "@/components/room-card";
import { BookingDialog } from "@/components/booking-dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { usePublicRooms } from "@/lib/public-rooms";
import type { Room } from "@/lib/rooms-data";

export function RoomsSection() {
  const { t, language, dir } = useI18n();
  const { rooms } = usePublicRooms();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsBookingOpen(true);
  };

  // Show up to 6 rooms total; mobile shows first 4, large screens show all 6.
  const displayRooms = rooms.slice(0, 6);

  return (
    <section id="rooms" className="bg-background py-20" dir={dir}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ring)]">
            {language === "ar" ? "قرب الحرم النبوي" : "Near Al-Masjid an-Nabawi"}
          </p>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            {t("rooms.title")}
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            {language === "ar"
              ? "اختر من بين مجموعة متنوعة من الغرف الفاخرة المصممة لراحتك"
              : "Choose from a variety of luxury rooms designed for your comfort"}
          </p>
        </div>

        {/* Urgency Banner */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-full bg-accent/60 px-4 py-2 text-center shadow-sm">
            <p className="text-sm font-medium text-accent-foreground">
              {language === "ar"
                ? "تم حجز 5 غرف في آخر 24 ساعة - احجز الآن!"
                : "5 rooms booked in the last 24 hours - Book now!"}
            </p>
          </div>
        </div>

        {/* Rooms Grid */}
        {displayRooms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {language === "ar"
                ? "سيتم عرض الغرف المتاحة هنا قريباً. تواصل معنا للحجز المباشر."
                : "Available rooms will appear here soon. Contact us for direct booking."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayRooms.map((room, index) => (
              <div key={room.id} className={index >= 4 ? "hidden lg:block" : ""}>
                <RoomCard room={room} onBook={handleBookRoom} />
              </div>
            ))}
          </div>
        )}

        {/* See More Button */}
        <div className="mt-12 flex justify-center">
          <Link href="/rooms">
            <Button variant="outline" size="lg" className="group gap-2">
              {t("rooms.seeMore")}
              {language === "ar" ? (
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              ) : (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Booking Dialog */}
      {selectedRoom && (
        <BookingDialog
          room={selectedRoom}
          open={isBookingOpen}
          onOpenChange={setIsBookingOpen}
        />
      )}
    </section>
  );
}
