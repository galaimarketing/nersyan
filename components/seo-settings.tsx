"use client";

import { useEffect } from "react";
import { useSettings } from "@/lib/settings";

function ensureMeta(name: string, content: string): void {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function ensureMetaProperty(property: string, content: string): void {
  if (!content) return;
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Applies SEO from settings (client-side). Layout no longer outputs title/description so this is the only source. */
export function SeoSettings() {
  const settings = useSettings();

  useEffect(() => {
    if (typeof document === "undefined") return;
    const title = settings.seoTitle?.trim() || "Nersian Taiba Hotel | نرسيان طيبة - Hotels in Madinah";
    const description = settings.seoDescription?.trim() || "Luxurious hotel accommodation near Al-Masjid an-Nabawi in Madinah, Saudi Arabia.";
    const keywords = settings.seoKeywords?.trim() || "Hotels in Madinah, Nersian Taiba, فنادق المدينة المنورة, نرسيان طيبة";

    document.title = title;
    ensureMeta("description", description);
    ensureMeta("keywords", keywords);
    ensureMetaProperty("og:title", title);
    ensureMetaProperty("og:description", description);
  }, [settings.seoTitle, settings.seoDescription, settings.seoKeywords]);

  return null;
}
