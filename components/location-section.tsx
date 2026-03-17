"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";

const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4231.757077633158!2d39.585859!3d24.4759922!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15bdbf941d9aaacb%3A0x5dd562214a82d8be!2sNersyan%20Taiba%20Hotel%20Apartments!5e1!3m2!1sen!2ssa!4v1773271205521!5m2!1sen!2ssa";

export function LocationSection() {
  const { t, language, dir } = useI18n();
  const settings = useSettings();
  const contactEmail = settings.contactEmail ?? "info@nersiantaiba.com";
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapShouldLoad, setMapShouldLoad] = useState(false);

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setMapShouldLoad(true);
      },
      { rootMargin: "400px 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="location" className="bg-background py-20" dir={dir}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            {language === "ar" ? "موقعنا" : "Our Location"}
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            {language === "ar"
              ? "نقع على بعد دقائق قليلة من الحرم النبوي الشريف"
              : "We are located just minutes away from the Prophet's Holy Mosque"}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Map – starts loading when within 400px of viewport so it’s ready before you scroll to it */}
          <div ref={mapRef} className="relative aspect-video overflow-hidden rounded-2xl border border-border lg:aspect-auto lg:h-full">
            {mapShouldLoad && (
              <iframe
                src={MAP_EMBED_URL}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "300px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Hotel Location"
              />
            )}
          </div>

          {/* Contact Info */}
          <div className="flex flex-col justify-center gap-6">
            {/* Address */}
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-foreground">
                  {language === "ar" ? "العنوان" : "Address"}
                </h3>
                <p className="text-muted-foreground">
                  {language === "ar"
                    ? "نرسيان طيبة للشقق الفندقية، العنابس، المدينة المنورة 42312، المملكة العربية السعودية"
                    : "Nersyan Taiba Hotel Apartments, Al Anabis, Madinah 42312, Saudi Arabia"}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-foreground">
                  {language === "ar" ? "الهاتف" : "Phone"}
                </h3>
                <a href="tel:+966500000000" className="text-muted-foreground hover:text-primary hover:underline" dir="ltr">+966 50 000 0000</a>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-foreground">
                  {language === "ar" ? "البريد الإلكتروني" : "Email"}
                </h3>
                <a href={`mailto:${contactEmail}`} className="text-muted-foreground hover:text-primary hover:underline">{contactEmail}</a>
              </div>
            </div>

            {/* Hours */}
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-foreground">
                  {language === "ar" ? "ساعات العمل" : "Working Hours"}
                </h3>
                <p className="text-muted-foreground">
                  {language === "ar" ? "24 ساعة / 7 أيام" : "24/7"}
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-4 flex flex-row flex-wrap gap-3">
              <Button
                size="lg"
                className="h-12 w-full max-w-[220px] bg-[var(--ring)] text-primary-foreground shadow-md hover:bg-[var(--ring)]/90 hover:shadow-lg transition-all sm:w-auto sm:min-w-0"
                asChild
              >
                <Link href="/rooms">
                  <CalendarCheck className="me-2 h-5 w-5" />
                  {t("booking.bookNow")}
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full max-w-[220px] border-[var(--ring)] text-[var(--ring)] hover:bg-[var(--ring)]/5 sm:w-auto sm:min-w-0"
                asChild
              >
                <a
                  href="https://www.google.com/maps/place/Nersyan+Taiba+Hotel+Apartments/@24.4759922,39.585859,17z"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="me-2 h-5 w-5" />
                  {language === "ar" ? "إطلع على موقعنا" : "Visit our location"}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
