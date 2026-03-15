"use client";

import { MapPin } from "lucide-react";
import { I18nProvider } from "@/lib/i18n";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { RoomsSection } from "@/components/rooms-section";
import { LocationHighlightSection } from "@/components/location-highlight-section";
import { FeaturesSection } from "@/components/features-section";
import { LocationSection } from "@/components/location-section";
import { ContactForm } from "@/components/contact-form";
import { Footer } from "@/components/footer";
import { StickyBookingBar } from "@/components/sticky-booking-bar";

export default function HomePage() {
  return (
    <I18nProvider>
      <div className="min-h-screen">
        <Header />
        <main>
          <HeroSection />
          <LocationHighlightSection
            id="masjid-nabawi"
            titleAr="3.9 كم من المسجد النبوي"
            titleEn="3.9km to Masjid an-Nabawi"
            descAr="موقع قريب من الحرم النبوي الشريف. إقامة مريحة على بعد دقائق من المسجد النبوي."
            descEn="Close proximity to the Prophet's Holy Mosque. A comfortable stay just minutes from Masjid an-Nabawi."
            image="/%D8%A7%D9%84%D9%85%D8%B3%D8%AC%D8%AF%20%D8%A7%D9%84%D9%86%D8%A8%D9%88%D9%8A.jpg"
            icon={<MapPin className="h-8 w-8 md:h-10 md:w-10" />}
          />
          <LocationHighlightSection
            id="masjid-qiblatayn"
            titleAr="1 كم من مسجد القبلتين"
            titleEn="1km to Masjid al-Qiblatayn"
            descAr="على بعد دقائق من مسجد القبلتين التاريخي. موقع فريد لزيارة أحد أقدم المساجد."
            descEn="Minutes away from the historic Qiblatayn Mosque. A unique location to visit one of the earliest mosques."
            image="/%D9%85%D8%B3%D8%AC%D8%AF%20%D8%A7%D9%84%D9%82%D8%A8%D9%84%D8%AA%D9%8A%D9%86.png"
            icon={<MapPin className="h-8 w-8 md:h-10 md:w-10" />}
            flipGradient
          />
          <RoomsSection />
          <FeaturesSection />
          <LocationSection />
          <ContactForm />
        </main>
        <Footer />
        <StickyBookingBar />
      </div>
    </I18nProvider>
  );
}
