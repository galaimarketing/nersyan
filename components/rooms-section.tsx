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
  const rooms = usePublicRooms();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsBookingOpen(true);
  };

  // Only show first 3 rooms on homepage
  const displayRooms = rooms.slice(0, 3);

  return (
    <section id="rooms" className="bg-background py-20" dir={dir}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section Header */}
        <div className="mb-12 text-center">
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayRooms.map((room) => (
            <RoomCard key={room.id} room={room} onBook={handleBookRoom} />
          ))}
        </div>

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
