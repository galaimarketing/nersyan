"use client";

import { useState } from "react";
import { Phone, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { CurrencySymbol } from "@/components/currency-symbol";

export function StickyBookingBar() {
  const { t, language, dir } = useI18n();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 p-4 backdrop-blur-lg md:hidden"
      dir={dir}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {language === "ar" ? "من 250 " : "From 250 "}<CurrencySymbol />{language === "ar" ? " / الليلة" : " / night"}
          </p>
          <p className="text-xs text-muted-foreground">
            {language === "ar" ? "أفضل الأسعار مضمونة" : "Best price guaranteed"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="tel:+966508060816">
              <Phone className="h-4 w-4" />
            </a>
          </Button>
          <Button size="sm" asChild>
            <a href="#rooms">
              <CalendarDays className="me-1 h-4 w-4" />
              {t("hero.cta")}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
