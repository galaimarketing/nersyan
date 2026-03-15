"use client";

import React from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "nersian-settings";

export interface AppSettings {
  taxRatePercent: number;
  currency: string;
  hotelNameEn?: string;
  hotelNameAr?: string;
  contactEmail?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  newBookingAlerts?: boolean;
  checkinReminders?: boolean;
}

const defaults: AppSettings = {
  taxRatePercent: 15,
  currency: "SAR",
  hotelNameEn: "Nersian Taiba",
  hotelNameAr: "نرسيان طيبة",
  contactEmail: "info@nersiantaiba.com",
  seoTitle: "Nersian Taiba Hotel | نرسيان طيبة - Hotels in Madinah",
  seoDescription: "Luxurious hotel accommodation near Al-Masjid an-Nabawi in Madinah, Saudi Arabia.",
  seoKeywords: "Hotels in Madinah, Nersian Taiba, فنادق المدينة المنورة, نرسيان طيبة",
  newBookingAlerts: true,
  checkinReminders: true,
};

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      taxRatePercent: typeof parsed.taxRatePercent === "number" ? parsed.taxRatePercent : defaults.taxRatePercent,
      currency: parsed.currency ?? defaults.currency,
      hotelNameEn: parsed.hotelNameEn ?? defaults.hotelNameEn,
      hotelNameAr: parsed.hotelNameAr ?? defaults.hotelNameAr,
      contactEmail: parsed.contactEmail ?? defaults.contactEmail,
      seoTitle: parsed.seoTitle ?? defaults.seoTitle,
      seoDescription: parsed.seoDescription ?? defaults.seoDescription,
      seoKeywords: parsed.seoKeywords ?? defaults.seoKeywords,
      newBookingAlerts: parsed.newBookingAlerts ?? defaults.newBookingAlerts,
      checkinReminders: parsed.checkinReminders ?? defaults.checkinReminders,
    };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings: Partial<AppSettings>): void {
  if (typeof window === "undefined") return;
  try {
    const current = loadSettings();
    const next = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

/** React hook: returns current settings and re-reads when the tab becomes visible or when the route changes (e.g. after saving in admin and navigating back). */
export function useSettings(): AppSettings {
  const pathname = usePathname();
  const [settings, setSettings] = React.useState<AppSettings>(defaults);

  React.useEffect(() => {
    setSettings(loadSettings());
  }, [pathname]);

  React.useEffect(() => {
    const read = () => setSettings(loadSettings());
    read();
    const onVisible = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") read();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("storage", read);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("storage", read);
    };
  }, []);

  return settings;
}
