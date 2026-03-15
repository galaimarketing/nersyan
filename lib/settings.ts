"use client";

import React from "react";
import { usePathname } from "next/navigation";
import type { AppSettings } from "@/lib/settings-types";
import { defaultAppSettings } from "@/lib/settings-types";

const STORAGE_KEY = "nersian-settings";
export type { AppSettings };

const defaults = defaultAppSettings;

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
    fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    }).catch(() => {});
  } catch {
    // ignore
  }
}

/** React hook: returns current settings and re-reads when the tab becomes visible or when the route changes (e.g. after saving in admin and navigating back). */
export function useSettings(): AppSettings {
  const pathname = usePathname();
  const [settings, setSettings] = React.useState<AppSettings>(defaults);

  React.useEffect(() => {
    const read = () => setSettings(loadSettings());
    const fromApi = () => {
      fetch("/api/settings")
        .then((res) => (res.ok ? res.json() : null))
        .then((api: AppSettings | null) => {
          if (api && typeof api.currency === "string") {
            setSettings({ ...defaults, ...api });
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(api));
            } catch {}
          } else read();
        })
        .catch(read);
    };
    fromApi();
    const onVisible = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") fromApi();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("storage", read);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("storage", read);
    };
  }, []);

  React.useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((api: AppSettings | null) => {
        if (api && typeof api.currency === "string") setSettings({ ...defaults, ...api });
      })
      .catch(() => {});
  }, [pathname]);

  return settings;
}
