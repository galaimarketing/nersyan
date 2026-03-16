"use client";

import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";
import { Footer as UIFooter } from "@/components/ui/footer";

const SnapIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="currentColor"
    aria-hidden
  >
    <path d="M5.829 4.533c-.6 1.344-.363 3.752-.267 5.436-.648.359-1.48-.271-1.951-.271-.49 0-1.075.322-1.167.802-.066.346.089.85 1.201 1.289.43.17 1.453.37 1.69.928.333.784-1.71 4.403-4.918 4.931-.251.041-.43.265-.416.519.056.975 2.242 1.357 3.211 1.507.099.134.179.7.306 1.131.057.193.204.424.582.424.493 0 1.312-.38 2.738-.144 1.398.233 2.712 2.215 5.235 2.215 2.345 0 3.744-1.991 5.09-2.215.779-.129 1.448-.088 2.196.058.515.101.977.157 1.124-.349.129-.437.208-.992.305-1.123.96-.149 3.156-.53 3.211-1.505.014-.254-.165-.477-.416-.519-3.154-.52-5.259-4.128-4.918-4.931.236-.557 1.252-.755 1.69-.928.814-.321 1.222-.716 1.213-1.173-.011-.585-.715-.934-1.233-.934-.527 0-1.284.624-1.897.286.096-1.698.332-4.095-.267-5.438-1.135-2.543-3.66-3.829-6.184-3.829-2.508 0-5.014 1.268-6.158 3.833z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.61v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export function Footer() {
  const { t, language, dir } = useI18n();
  const settings = useSettings();
  const brandName = language === "ar" ? (settings.hotelNameAr ?? "نرسيان طيبة") : (settings.hotelNameEn ?? "Nersian Taiba");
  const contactEmail = settings.contactEmail ?? "info@nersiantaiba.com";

  const mainLinks = [
    { href: "/", label: language === "ar" ? "الرئيسية" : "Home" },
    { href: "/rooms", label: language === "ar" ? "الغرف" : "Rooms" },
    { href: "#amenities", label: language === "ar" ? "المرافق" : "Amenities" },
    { href: "#location", label: language === "ar" ? "الموقع" : "Location" },
    { href: "#contact", label: language === "ar" ? "تواصل معنا" : "Contact" },
  ];

  const legalLinks = [
    { href: "/privacy", label: language === "ar" ? "سياسة الخصوصية" : "Privacy Policy" },
    { href: "/terms", label: language === "ar" ? "الشروط والأحكام" : "Terms & Conditions" },
    { href: "/cancellation", label: language === "ar" ? "سياسة الإلغاء" : "Cancellation Policy" },
  ];

  return (
    <div dir={dir}>
      <UIFooter
        logo={
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary p-1.5">
            <svg
              viewBox="0 0 1080 1080"
              className="h-full w-full text-primary-foreground"
              fill="currentColor"
              aria-hidden
            >
              <rect x="113.3" y="111.5" width="175.3" height="164.8" />
              <path d="M288.6,694.1v-390.5H113.3l2.4,478.4c0,95.7,78.5,173.2,175.3,173.2h0v-.3h273.8s1,0,1,0h174.3V384.1c0-45-37-81.6-82.5-81.6h-92.8v521.3h-171.3s-104.9,11-104.9-129.8Z" />
              <path d="M790.6,111.6h0c0,0-1.4,0-1.4,0,0,0-.1,0-.2,0h0s-278.4,0-278.4,0h0s-12,0-12,0h-163.4v578.5c0,45,37,90,82.5,90h92.8V242.6h170.3s100.3,6.7,110.5,109.1v616.8h175.3l-2.4-683.7c0-95.1-77.6-172.3-173.7-173.1Z" />
            </svg>
          </div>
        }
        brandName={brandName}
        socialLinks={[
          {
            icon: <Instagram className="h-5 w-5" />,
            href: "https://www.instagram.com/nersiantaiba",
            label: "Instagram",
          },
          {
            icon: <TikTokIcon />,
            href: "https://www.tiktok.com/@nersiantaiba",
            label: "TikTok",
          },
          {
            icon: <SnapIcon />,
            href: "https://www.snapchat.com/add/nersiantaiba",
            label: "Snapchat",
          },
        ]}
        mainLinks={mainLinks}
        legalLinks={legalLinks}
        copyright={{
          text: `© ${new Date().getFullYear()} ${brandName}`,
          license: t("footer.rights"),
        }}
        extra={
          <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {language === "ar"
                  ? "نرسيان طيبة للشقق الفندقية، العنابس، المدينة المنورة 42312، المملكة العربية السعودية"
                  : "Nersyan Taiba Hotel Apartments, Al Anabis, Madinah 42312, Saudi Arabia"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              <span dir="ltr">+966 50 000 0000</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              <span>{contactEmail}</span>
            </div>
          </div>
        }
      />
    </div>
  );
}
