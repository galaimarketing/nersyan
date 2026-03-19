"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Save, Globe, Bell, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { loadSettings, saveSettings } from "@/lib/settings";
import { CurrencySymbol } from "@/components/currency-symbol";

function snapshot(s: ReturnType<typeof loadSettings>) {
  return {
    totalHotelRooms: s.totalHotelRooms ?? 30,
    currency: s.currency,
    taxRatePercent: s.taxRatePercent,
    hotelNameEn: s.hotelNameEn ?? "Nersian Taiba",
    hotelNameAr: s.hotelNameAr ?? "نرسيان طيبة",
    contactEmail: s.contactEmail ?? "info@nersiantaiba.com",
    seoTitle: s.seoTitle ?? "",
    seoDescription: s.seoDescription ?? "",
    seoKeywords: s.seoKeywords ?? "",
    newBookingAlerts: s.newBookingAlerts ?? true,
    checkinReminders: s.checkinReminders ?? true,
  };
}

export default function AdminSettingsPage() {
  const { t, language } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState(false);
  const [totalHotelRooms, setTotalHotelRooms] = useState("30");
  const [currency, setCurrency] = useState("SAR");
  const [taxRate, setTaxRate] = useState("15");
  const [hotelNameEn, setHotelNameEn] = useState("Nersian Taiba");
  const [hotelNameAr, setHotelNameAr] = useState("نرسيان طيبة");
  const [contactEmail, setContactEmail] = useState("info@nersiantaiba.com");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [newBookingAlerts, setNewBookingAlerts] = useState(true);
  const [checkinReminders, setCheckinReminders] = useState(true);
  const initialRef = useRef<ReturnType<typeof snapshot> | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const pendingNavigateRef = useRef<string | null>(null);

  useEffect(() => {
    const s = loadSettings();
    const snap = snapshot(s);
    initialRef.current = snap;
    setTotalHotelRooms(String(s.totalHotelRooms ?? 30));
    setCurrency(s.currency);
    setTaxRate(String(s.taxRatePercent));
    setHotelNameEn(snap.hotelNameEn);
    setHotelNameAr(snap.hotelNameAr);
    setContactEmail(snap.contactEmail);
    setSeoTitle(snap.seoTitle);
    setSeoDescription(snap.seoDescription);
    setSeoKeywords(snap.seoKeywords);
    setNewBookingAlerts(snap.newBookingAlerts);
    setCheckinReminders(snap.checkinReminders);
  }, []);

  const currentSnapshot = useCallback(
    () => ({
      totalHotelRooms: (() => {
        const n = parseInt(totalHotelRooms, 10);
        return !isNaN(n) && n > 0 ? n : 30;
      })(),
      currency: currency.trim() || "SAR",
      taxRatePercent: (() => {
        const r = parseInt(taxRate, 10);
        return isNaN(r) || r < 0 ? 0 : r;
      })(),
      hotelNameEn: hotelNameEn.trim() || "Nersian Taiba",
      hotelNameAr: hotelNameAr.trim() || "نرسيان طيبة",
      contactEmail: contactEmail.trim() || "info@nersiantaiba.com",
      seoTitle: seoTitle.trim(),
      seoDescription: seoDescription.trim(),
      seoKeywords: seoKeywords.trim(),
      newBookingAlerts,
      checkinReminders,
    }),
    [
      totalHotelRooms,
      currency,
      taxRate,
      hotelNameEn,
      hotelNameAr,
      contactEmail,
      seoTitle,
      seoDescription,
      seoKeywords,
      newBookingAlerts,
      checkinReminders,
    ]
  );

  const hasUnsavedChanges =
    initialRef.current != null &&
    (() => {
      const cur = currentSnapshot();
      const init = initialRef.current!;
      return (
        cur.currency !== init.currency ||
        cur.totalHotelRooms !== init.totalHotelRooms ||
        cur.taxRatePercent !== init.taxRatePercent ||
        cur.hotelNameEn !== init.hotelNameEn ||
        cur.hotelNameAr !== init.hotelNameAr ||
        cur.contactEmail !== init.contactEmail ||
        cur.seoTitle !== init.seoTitle ||
        cur.seoDescription !== init.seoDescription ||
        cur.seoKeywords !== init.seoKeywords ||
        cur.newBookingAlerts !== init.newBookingAlerts ||
        cur.checkinReminders !== init.checkinReminders
      );
    })();

  const saveAll = useCallback(() => {
    const cur = currentSnapshot();
    saveSettings({
      totalHotelRooms: cur.totalHotelRooms,
      currency: cur.currency,
      taxRatePercent: cur.taxRatePercent,
      hotelNameEn: cur.hotelNameEn,
      hotelNameAr: cur.hotelNameAr,
      contactEmail: cur.contactEmail,
      seoTitle: cur.seoTitle,
      seoDescription: cur.seoDescription,
      seoKeywords: cur.seoKeywords,
      newBookingAlerts: cur.newBookingAlerts,
      checkinReminders: cur.checkinReminders,
    });
    initialRef.current = cur;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [currentSnapshot]);

  const doLeave = useCallback((url: string) => {
    pendingNavigateRef.current = null;
    setLeaveOpen(false);
    router.push(url);
  }, [router]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handleClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
      if (!link || !link.href) return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
      const current = pathname ?? "";
      const targetPath = href.startsWith("http") ? new URL(href).pathname : href.split("?")[0];
      if (targetPath === current) return;
      e.preventDefault();
      e.stopPropagation();
      pendingNavigateRef.current = href;
      setLeaveOpen(true);
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [hasUnsavedChanges, pathname]);

  const handleSaveAndLeave = () => {
    saveAll();
    const url = pendingNavigateRef.current;
    if (url) doLeave(url);
  };

  const leaveDialogTitle =
    language === "ar" ? "لديك تغييرات غير محفوظة" : "You have unsaved changes";
  const leaveDialogDesc =
    language === "ar"
      ? "هل تريد حفظ التغييرات قبل المغادرة؟"
      : "Do you want to save your changes before leaving?";
  const saveAndLeave = language === "ar" ? "حفظ والمغادرة" : "Save and leave";
  const leaveWithoutSaving = language === "ar" ? "مغادرة دون حفظ" : "Leave without saving";
  const cancel = language === "ar" ? "إلغاء" : "Cancel";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{t("admin.settingsPageTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("admin.settingsPageDesc")}</p>
        </div>
        <Button onClick={saveAll} className="w-fit gap-2" disabled={!hasUnsavedChanges}>
          <Save className="h-4 w-4" />
          {saved ? t("admin.saved") : t("admin.saveAll")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CurrencySymbol className="inline-block text-xl leading-none" />
            {t("admin.taxes")}
          </CardTitle>
          <CardDescription>{t("admin.taxesDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("admin.currency")}</Label>
              <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("admin.taxRate")}</Label>
              <Input
                type="number"
                min={0}
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t("admin.general")}
          </CardTitle>
          <CardDescription>{t("admin.generalDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("admin.hotelNameEn")}</Label>
            <Input value={hotelNameEn} onChange={(e) => setHotelNameEn(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("admin.hotelNameAr")}</Label>
            <Input value={hotelNameAr} onChange={(e) => setHotelNameAr(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("admin.contactEmail")}</Label>
            <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("admin.totalHotelRooms")}</Label>
            <Input
              type="number"
              min={1}
              value={totalHotelRooms}
              onChange={(e) => setTotalHotelRooms(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t("admin.totalHotelRoomsDesc")}</p>
          </div>
        </CardContent>
      </Card>

      <Card id="seo">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {t("admin.seo")}
          </CardTitle>
          <CardDescription>{t("admin.seoDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("admin.metaTitle")}</Label>
            <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Nersian Taiba Hotel | نرسيان طيبة - Hotels in Madinah" />
          </div>
          <div className="space-y-2">
            <Label>{t("admin.metaDescription")}</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Luxurious hotel accommodation near Al-Masjid an-Nabawi in Madinah, Saudi Arabia."
            />
          </div>
          <div className="space-y-2">
            <Label>{t("admin.metaKeywords")}</Label>
            <Input value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="Hotels in Madinah, Nersian Taiba, فنادق المدينة" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t("admin.notificationsCard")}
          </CardTitle>
          <CardDescription>{t("admin.notificationsCardDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
            <Label htmlFor="alerts" className="flex-1 cursor-pointer">{t("admin.newBookingAlerts")}</Label>
            <Switch id="alerts" checked={newBookingAlerts} onCheckedChange={setNewBookingAlerts} />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
            <Label htmlFor="reminders" className="flex-1 cursor-pointer">{t("admin.guestCheckinReminders")}</Label>
            <Switch id="reminders" checked={checkinReminders} onCheckedChange={setCheckinReminders} />
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" asChild>
        <Link href="/admin" className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("admin.backToDashboard")}
        </Link>
      </Button>

      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{leaveDialogTitle}</DialogTitle>
            <p className="text-sm text-muted-foreground">{leaveDialogDesc}</p>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setLeaveOpen(false)}>
              {cancel}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const url = pendingNavigateRef.current;
                if (url) doLeave(url);
              }}
            >
              {leaveWithoutSaving}
            </Button>
            <Button onClick={handleSaveAndLeave}>{saveAndLeave}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
