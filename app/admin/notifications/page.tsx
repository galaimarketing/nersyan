"use client";

import Link from "next/link";
import { Bell, ArrowLeft, Inbox, Eye, Trash2, MailOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminData } from "@/components/admin-data-provider";
import { useI18n } from "@/lib/i18n";

export default function AdminNotificationsPage() {
  const { notifications, markNotificationRead, deleteNotification } = useAdminData();
  const { t, language, dir } = useI18n();

  const formatTime = (timeStr: string) => {
    try {
      const d = new Date(timeStr);
      return language === "ar"
        ? d.toLocaleDateString("ar-SA", { dateStyle: "short" }) + " " + d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
        : d.toLocaleDateString("en-US", { dateStyle: "short" }) + " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="space-y-6" dir={dir}>
      <div>
        <h2 className="text-2xl font-semibold text-foreground">{t("admin.notifications")}</h2>
        <p className="text-sm text-muted-foreground">{t("admin.notificationsDesc")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t("admin.recent")}
          </CardTitle>
          <CardDescription>{t("admin.markReadOrClear")}</CardDescription>
        </CardHeader>
        <CardContent>
          {!notifications || notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
              <Inbox className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm font-medium text-foreground">{t("admin.noNotifications")}</p>
              <p className="text-xs text-muted-foreground">{t("admin.alertsHere")}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`flex items-start justify-between rounded-lg border p-4 ${!n.read ? "bg-primary/5" : ""}`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {n.type === "booking" ? t("admin.newBooking") : n.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatTime(n.time)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {n.link && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                        aria-label={t("admin.view")}
                      >
                        <Link href={n.link}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    {!n.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() => markNotificationRead(n.id)}
                        aria-label={t("admin.markRead")}
                      >
                        <MailOpen className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteNotification(n.id)}
                      aria-label={t("admin.delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Button variant="outline" asChild>
        <Link href="/admin" className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("admin.backToDashboard")}
        </Link>
      </Button>
    </div>
  );
}
