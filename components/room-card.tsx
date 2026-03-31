"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Wifi, Wind, Car, Users, Maximize, BedDouble, Bath, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { CurrencySymbol } from "@/components/currency-symbol";
import type { Room } from "@/lib/rooms-data";

interface RoomCardProps {
  room: Room;
  onBook?: (room: Room) => void;
}

export function RoomCard({ room, onBook }: RoomCardProps) {
  const { t, language, dir } = useI18n();
  const [isHovered, setIsHovered] = useState(false);
  const images = room.images && room.images.length > 0 ? room.images : [room.image];
  const [activeIndex, setActiveIndex] = useState(0);
  const canSlide = images.length > 1;

  const goPrev = () => {
    if (!canSlide) return;
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goNext = () => {
    if (!canSlide) return;
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const hasDiscount = room.originalPrice != null && room.originalPrice > room.price;

  const name = language === "ar" ? room.nameAr : room.nameEn;
  const description = language === "ar" ? room.descriptionAr : room.descriptionEn;

  const amenityLabels: Record<string, { icon: React.ReactNode; labelAr: string; labelEn: string }> = {
    wifi: { icon: <Wifi className="h-4 w-4" />, labelAr: "واي فاي مجاني", labelEn: "Free WiFi" },
    ac: { icon: <Wind className="h-4 w-4" />, labelAr: "تكييف", labelEn: "AC" },
    parking: { icon: <Car className="h-4 w-4" />, labelAr: "موقف سيارات مجاني", labelEn: "Free parking" },
  };

  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      dir={dir}
    >
      {/* Image + link to details */}
      <Link href={`/rooms/${room.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <motion.img
            src={images[activeIndex] ?? room.image}
            alt={name}
            className="h-full w-full object-cover"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.4 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Image arrows */}
          {canSlide && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  goPrev();
                }}
                className="absolute start-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/85 p-1.5 text-foreground shadow-sm transition hover:bg-background"
                aria-label={language === "ar" ? "الصورة السابقة" : "Previous image"}
              >
                {dir === "rtl" ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  goNext();
                }}
                className="absolute end-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/85 p-1.5 text-foreground shadow-sm transition hover:bg-background"
                aria-label={language === "ar" ? "الصورة التالية" : "Next image"}
              >
                {dir === "rtl" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            </>
          )}

          {/* Dots (kept away from price badge) */}
          {canSlide && (
            <div className="absolute bottom-3 start-4 z-20 flex items-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveIndex(index);
                  }}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full bg-white/40 transition-colors",
                    index === activeIndex && "bg-white"
                  )}
                  aria-label={`Show image ${index + 1}`}
                />
              ))}
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute start-4 top-4 flex flex-col gap-2">
            {!room.available && (
              <Badge variant="secondary">{t("booking.booked")}</Badge>
            )}
          </div>

          {/* Price Tag */}
          <div className="absolute bottom-4 end-4 z-10 rounded-lg bg-background/90 px-3 py-2 backdrop-blur-sm">
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-bold text-primary">
                {room.price} <CurrencySymbol />
              </p>
              {hasDiscount && (
                <p className="text-sm text-muted-foreground line-through">
                  {room.originalPrice} <CurrencySymbol />
                </p>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{t("booking.perNight")}</p>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        <Link href={`/rooms/${room.id}`}>
          <h3 className="mb-2 text-xl font-semibold text-foreground hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{description}</p>

        {/* Room Info */}
        <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{room.capacity}</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="h-4 w-4" />
            <span>{room.size} m²</span>
          </div>
          <div className="flex items-center gap-1">
            <BedDouble className="h-4 w-4" />
            <span>{room.beds ?? 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{room.bathrooms ?? 0}</span>
          </div>
        </div>

        {/* Amenities - Always show WiFi, AC, and Parking */}
        <div className="mb-4 flex flex-wrap gap-2">
          {["wifi", "ac", "parking"].map((amenity) => {
            const amenityData = amenityLabels[amenity];
            return (
              <div
                key={amenity}
                className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
              >
                {amenityData.icon}
                <span>
                  {language === "ar" ? amenityData.labelAr : amenityData.labelEn}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <Button
          className="w-full bg-[var(--ring)] text-primary-foreground shadow-md hover:bg-[var(--ring)]/90 hover:shadow-lg transition-all"
          disabled={!room.available}
          onClick={() => onBook?.(room)}
        >
          {room.available ? t("booking.bookNow") : t("booking.booked")}
        </Button>
      </div>
    </motion.div>
  );
}
