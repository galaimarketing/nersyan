"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Users, Wifi, Wind, Filter, Car, Sparkles } from "lucide-react";
import { RoomCard } from "@/components/room-card";
import { BookingDialog } from "@/components/booking-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n, I18nProvider } from "@/lib/i18n";
import { usePublicRooms } from "@/lib/public-rooms";
import type { Room } from "@/lib/rooms-data";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

function RoomsPageContent() {
  const { t, language, dir } = useI18n();
  const rooms = usePublicRooms();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [capacityFilter, setCapacityFilter] = useState<number | null>(null);

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsBookingOpen(true);
  };

  const filteredRooms = useMemo(() => {
    if (!capacityFilter) return rooms;
    return rooms.filter((room) => room.capacity >= capacityFilter);
  }, [rooms, capacityFilter]);

  const capacityOptions = [
    { value: null, labelAr: "جميع الغرف", labelEn: "All Rooms" },
    { value: 2, labelAr: "2+ أشخاص", labelEn: "2+ persons" },
    { value: 3, labelAr: "3+ أشخاص", labelEn: "3+ persons" },
    { value: 4, labelAr: "4+ أشخاص", labelEn: "4+ persons" },
    { value: 5, labelAr: "5+ أشخاص", labelEn: "5+ persons" },
    { value: 6, labelAr: "6+ أشخاص", labelEn: "6+ persons" },
  ];

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />
      
      <main className="pb-20 pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          {/* Back Button & Header */}
          <div className="mb-8">
            <Link href="/" className="group mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              {language === "ar" ? (
                <>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  {language === "ar" ? "العودة للرئيسية" : "Back to Home"}
                </>
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Back to Home
                </>
              )}
            </Link>
            
            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              {t("rooms.title")}
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              {language === "ar"
                ? "استعرض جميع غرفنا الفاخرة واختر الغرفة المناسبة لإقامتك. جميع الغرف تتضمن واي فاي مجاني، تكييف، وموقف سيارات مجاني."
                : "Browse all our luxury rooms and choose the perfect room for your stay. All rooms include free WiFi, AC, and free parking."}
            </p>
          </div>

          {/* All rooms include notice */}
          <div className="mb-8 inline-flex flex-wrap items-center gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Wifi className="h-4 w-4" />
              {language === "ar" ? "واي فاي مجاني في جميع الغرف" : "Free WiFi in all rooms"}
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Wind className="h-4 w-4" />
              {language === "ar" ? "تكييف في جميع الغرف" : "AC in all rooms"}
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Car className="h-4 w-4" />
              {language === "ar"
                ? "موقف سيارات مجاني لجميع الغرف"
                : "Free parking for all rooms"}
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              {language === "ar"
                ? "خدمة تنظيف الغرف مجاناً"
                : "Free housekeeping service"}
            </div>
          </div>

          {/* Filter */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {t("rooms.filterByCapacity")}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {capacityOptions.map((option) => (
                <Button
                  key={option.value ?? "all"}
                  variant={capacityFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCapacityFilter(option.value)}
                  className="gap-2"
                >
                  {option.value && <Users className="h-4 w-4" />}
                  {language === "ar" ? option.labelAr : option.labelEn}
                </Button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <Badge variant="secondary" className="text-sm">
              {language === "ar"
                ? `${filteredRooms.length} غرف متاحة`
                : `${filteredRooms.length} rooms available`}
            </Badge>
          </div>

          {/* Rooms Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} onBook={handleBookRoom} />
            ))}
          </div>

          {/* No Results */}
          {filteredRooms.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground">
                {language === "ar"
                  ? "لا توجد غرف متاحة بهذه السعة. جرب تقليل عدد الضيوف."
                  : "No rooms available with this capacity. Try reducing the number of guests."}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setCapacityFilter(null)}
              >
                {language === "ar" ? "عرض جميع الغرف" : "Show all rooms"}
              </Button>
            </div>
          )}

          {/* Price Note */}
          <div className="mt-12 flex justify-center">
            <div className="w-fit max-w-full rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-center dark:border-amber-900/40 dark:bg-amber-900/10">
              <p className="text-xs text-amber-700/90 dark:text-amber-300/80">
              {language === "ar"
                ? "ملاحظة: سعر الحجز يشمل الإقامة فقط. خدمات النقل (من وإلى المطار والحرم) والغسيل والمطعم متوفرة برسوم إضافية."
                : "Note: Room price includes accommodation only. Transportation (airport & mosque transfers), laundry, and restaurant services available at additional cost."}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Dialog */}
      {selectedRoom && (
        <BookingDialog
          room={selectedRoom}
          open={isBookingOpen}
          onOpenChange={setIsBookingOpen}
        />
      )}

      <Footer />
    </div>
  );
}

export default function RoomsPage() {
  return (
    <I18nProvider>
      <RoomsPageContent />
    </I18nProvider>
  );
}
