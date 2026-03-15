"use client";

import { Wifi, Wind, Coffee, Shirt, BusFront } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";

function BurgerIcon({ className, ...props }: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Top bun */}
      <path d="M4 8c0-2 1.5-4 4-4h8c2.5 0 4 2 4 4" />
      {/* Patty */}
      <path d="M4 12h16" />
      {/* Bottom bun */}
      <path d="M4 16c0 2 1.5 4 4 4h8c2.5 0 4-2 4-4" />
    </svg>
  );
}

export function FeaturesSection() {
  const { t, language, dir } = useI18n();
  const settings = useSettings();
  const siteName = language === "ar" ? (settings.hotelNameAr ?? "نرسيان طيبة") : (settings.hotelNameEn ?? "Nersian Taiba");

  const features = [
    {
      icon: Wifi,
      titleAr: "واي فاي مجاني",
      titleEn: "Free High-Speed WiFi",
      shortTitleAr: "واي فاي",
      shortTitleEn: "WiFi",
      descAr: "اتصال إنترنت عالي السرعة في جميع الغرف مجاناً",
      descEn: "Free high-speed WiFi in all rooms",
    },
    {
      icon: Wind,
      titleAr: "تكييف مركزي",
      titleEn: "Central AC",
      descAr: "تكييف هواء مركزي في جميع الغرف",
      descEn: "Air conditioning available in all rooms",
    },
    {
      icon: Shirt,
      titleAr: "خدمة الغسيل",
      titleEn: "Laundry Service",
      descAr: "خدمة غسيل وكي الملابس متوفرة",
      descEn: "Laundry and ironing services available",
    },
    {
      icon: Coffee,
      titleAr: "قهوة ومشروبات",
      titleEn: "Coffee & Beverages",
      shortTitleAr: "مقهى",
      shortTitleEn: "Coffee",
      descAr: "ركن مشروبات ساخنة متوفر للضيوف",
      descEn: "Hot beverage corner available for guests",
    },
    {
      icon: BurgerIcon,
      titleAr: "مطعم برجر",
      titleEn: "Burger Restaurant",
      descAr: "مطعم برجر يقدم وجبات على مدار اليوم",
      descEn: "Burger restaurant serving meals throughout the day",
    },
    {
      icon: BusFront,
      titleAr: "خدمة النقل",
      titleEn: "Transportation Service",
      descAr: "نقل من وإلى المطار والحرم",
      descEn: "Airport & Mosque transfers",
    },
  ];

  return (
    <section id="amenities" className="py-20" dir={dir}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            {language === "ar" ? `لماذا تختار ${siteName}؟` : `Why Choose ${siteName}?`}
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            {language === "ar"
              ? "نقدم لك تجربة إقامة استثنائية مع مرافق وخدمات متميزة"
              : "We offer you an exceptional stay experience with premium facilities and services"}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-6 lg:grid-cols-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center transition-all hover:border-primary/30 hover:shadow-lg sm:items-start sm:text-start"
            >
              <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-center text-sm font-semibold text-foreground sm:text-start sm:text-lg">
                {"shortTitleAr" in feature && feature.shortTitleAr ? (
                  <>
                    <span className="sm:hidden">
                      {language === "ar" ? feature.shortTitleAr : feature.shortTitleEn}
                    </span>
                    <span className="hidden sm:inline">
                      {language === "ar" ? feature.titleAr : feature.titleEn}
                    </span>
                  </>
                ) : (
                  language === "ar" ? feature.titleAr : feature.titleEn
                )}
              </h3>
              <p className="hidden text-sm text-muted-foreground sm:block">
                {language === "ar" ? feature.descAr : feature.descEn}
              </p>
            </div>
          ))}
        </div>

        {/* Price Note Banner */}
        <div className="mt-8 flex justify-center">
          <div className="w-fit max-w-full rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-center dark:border-amber-900/40 dark:bg-amber-900/10">
            <p className="text-xs text-amber-700/90 dark:text-amber-300/80">
              {language === "ar"
                ? "ملاحظة: سعر الحجز يشمل الإقامة فقط. خدمات النقل والغسيل والمطعم متوفرة برسوم إضافية."
                : "Note: Room price includes accommodation only. Transportation, laundry, and restaurant services available at additional cost."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
