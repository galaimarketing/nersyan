"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BedDouble,
  Calendar,
  Users,
  Settings,
  FileText,
  Image as ImageIcon,
  LogOut,
  Bell,
  Languages,
  Laptop,
  Mail,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AdminDataProvider, useAdminData } from "@/components/admin-data-provider";
import { I18nProvider, useI18n, AdminLangSync } from "@/lib/i18n";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const sidebarItems = [
  { icon: LayoutDashboard, labelKey: "admin.panel", href: "/admin" },
  { icon: BedDouble, labelKey: "admin.rooms", href: "/admin/rooms" },
  { icon: Calendar, labelKey: "admin.bookingsTitle", href: "/admin/bookings" },
  { icon: Users, labelKey: "admin.guestsTitle", href: "/admin/guests" },
  { icon: Mail, labelKey: "admin.contactMessages", href: "/admin/contact" },
  { icon: Star, labelKey: "admin.reviews", href: "/admin/reviews" },
  { icon: FileText, labelKey: "admin.blogTitle", href: "/admin/blog" },
  { icon: ImageIcon, labelKey: "admin.mediaTitle", href: "/admin/media" },
  { icon: Settings, labelKey: "admin.settings", href: "/admin/settings" },
];

const logoIcon = (
  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg">
    <Image src="/logo.svg" alt="" width={20} height={20} className="object-contain" />
  </span>
);

function AdminSidebarLogo() {
  const { open } = useSidebar();
  const { dir, language } = useI18n();
  const brandText = language === "ar" ? "نرسيان طيبة" : "Nersyan Taiba";
  return (
    <div
      className={cn(
        "relative flex items-center gap-2 py-1 px-2 rounded-lg text-sm text-foreground z-20 w-full",
        dir === "rtl" ? "flex-row-reverse justify-end" : "justify-start"
      )}
    >
      <Link
        href="/admin"
        className={cn(
          "font-normal flex items-center gap-3 py-1 px-1 rounded-lg min-h-[2.5rem]",
          dir === "rtl" ? "flex-row-reverse justify-end" : "justify-start"
        )}
      >
        {dir === "rtl" ? (
          <>
            {open && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium text-foreground dark:text-white whitespace-pre"
              >
                {brandText}
              </motion.span>
            )}
            {logoIcon}
          </>
        ) : (
          <>
            {logoIcon}
            {open && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium text-foreground dark:text-white whitespace-pre"
              >
                {brandText}
              </motion.span>
            )}
          </>
        )}
        {/* Show brand text only when open; icon + arrow still visible when closed */}
      </Link>
    </div>
  );
}

// Fallback (not currently used, but kept for safety)
function AdminSidebarLogoIcon() {
  const { dir } = useI18n();
  return (
    <Link
      href="/admin"
      className={cn(
        "font-normal flex items-center justify-center gap-3 py-2 px-2 rounded-lg min-h-[2.5rem] text-sm text-foreground relative z-20 w-full",
        dir === "rtl" && "flex-row-reverse"
      )}
    >
      {logoIcon}
    </Link>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { t, language, setLanguage, dir } = useI18n();
  const { notifications, data } = useAdminData();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const unreadCount = (notifications ?? []).filter((n) => !n.read).length;
  const unreadContactCount = (data.contactMessages ?? []).filter((m) => !m.read).length;
  const unreadBookingCount = (notifications ?? []).filter((n) => !n.read && n.type === "booking").length;
  const [hasNewBookingsDot, setHasNewBookingsDot] = useState(false);

  // Dot source for Bookings icon: actual new booking rows (manual/admin-created included), not notifications.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "admin-bookings-last-seen-id";
    const newestBookingId = (data.bookings ?? []).reduce((max, b) => (!max || b.id > max ? b.id : max), "");

    if (!newestBookingId) {
      setHasNewBookingsDot(false);
      return;
    }

    if (pathname === "/admin/bookings") {
      window.localStorage.setItem(key, newestBookingId);
      setHasNewBookingsDot(false);
      return;
    }

    const seen = window.localStorage.getItem(key);
    if (!seen) {
      // Initialize baseline so existing old bookings don't show a permanent dot.
      window.localStorage.setItem(key, newestBookingId);
      setHasNewBookingsDot(false);
      return;
    }
    setHasNewBookingsDot(seen !== newestBookingId);
  }, [data.bookings, pathname]);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    if (typeof window !== "undefined" && window.localStorage.getItem("admin-auth") !== "true") {
      router.replace("/admin/login");
    }
  }, [pathname, router]);

  const iconClass = "text-neutral-700 dark:text-neutral-200";
  const iconWithBadge = (Icon: React.ComponentType<{ className?: string }>, count: number) => (
    <span className="relative inline-flex items-center justify-center">
      <Icon className={iconClass} />
      {count > 0 && (
        <span className="absolute -top-0.5 -end-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background dark:ring-neutral-900" />
      )}
    </span>
  );
  const mainLinks = sidebarItems.map((item) => ({
    label: t(item.labelKey),
    href: item.href,
    icon:
      item.href === "/admin/bookings"
        ? iconWithBadge(item.icon, hasNewBookingsDot || unreadBookingCount > 0 ? 1 : 0)
        : item.href === "/admin/contact"
          ? iconWithBadge(item.icon, unreadContactCount)
          : <item.icon className={iconClass} />,
  }));

  const notificationsLink = {
    label: t("admin.notifications"),
    href: "/admin/notifications",
    icon: (
      <span className="relative inline-flex items-center justify-center">
        <Bell className={iconClass} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </span>
    ),
  };

  const breadcrumbs = (() => {
    const parts = (pathname || "/admin").split("?")[0].split("/").filter(Boolean);
    if (parts.length === 0) return [];
    // Ensure starts with admin
    if (parts[0] !== "admin") return [];
    const mapLabel = (segment: string) => {
      switch (segment) {
        case "admin":
          return t("admin.panel");
        case "rooms":
          return t("admin.rooms");
        case "bookings":
          return t("admin.bookingsTitle");
        case "guests":
          return t("admin.guestsTitle");
        case "media":
          return t("admin.mediaTitle");
        case "blog":
          return t("admin.blogTitle");
        case "contact":
          return t("admin.contactMessages");
        case "reviews":
          return t("admin.reviews");
        case "settings":
          return t("admin.settings");
        case "notifications":
          return t("admin.notifications");
        case "login":
          return t("auth.signIn");
        default:
          return segment;
      }
    };
    const crumbs = parts.map((seg, idx) => ({
      href: "/" + parts.slice(0, idx + 1).join("/"),
      label: mapLabel(seg),
      isLast: idx === parts.length - 1,
    }));
    return crumbs;
  })();

  return (
    <>
      {/* Mobile: show "use desktop" message only */}
      <div
        className={cn(
          "flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-background p-6 text-center md:hidden print:hidden"
        )}
        dir={dir}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Laptop className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">{t("admin.useDesktopOnly")}</h2>
          <p className="text-sm text-muted-foreground">{t("admin.useDesktopOnlyHint")}</p>
        </div>
      </div>

      {/* Desktop: sidebar + main content */}
      <div
        className={cn(
          "hidden min-h-screen w-full items-stretch bg-background md:flex print:flex",
          dir === "rtl" && "flex-row-reverse"
        )}
        dir={dir}
      >
        <div className="print:hidden">
          <Sidebar open={open} setOpen={setOpen}>
            <SidebarBody className="flex min-h-screen flex-col justify-between gap-6 bg-background dark:bg-background">
              <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                <AdminSidebarLogo />
                <div className="mt-6 flex flex-col gap-1">
                  {mainLinks.map((link) => (
                    <SidebarLink
                      key={link.href}
                      link={link}
                      className={cn(
                        pathname === link.href &&
                          "bg-stone-200/80 text-foreground dark:bg-stone-700/50 dark:text-foreground"
                      )}
                      onClick={() => setOpen(false)}
                    />
                  ))}
                  <button
                    type="button"
                    className="flex items-center justify-start gap-3 py-2 px-2 rounded-lg min-h-[2.5rem] w-full text-left text-neutral-700 dark:text-neutral-200 hover:bg-stone-200/80 dark:hover:bg-stone-700/50"
                    onClick={() => {
                      const next = language === "ar" ? "en" : "ar";
                      setLanguage(next);
                      if (typeof window !== "undefined") window.localStorage.setItem("admin-lang", next);
                    }}
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg [&_svg]:size-5">
                      <Languages className={iconClass} />
                    </span>
                    <motion.span
                      animate={{ display: open ? "inline-block" : "none", opacity: open ? 1 : 0 }}
                      className="text-sm whitespace-pre overflow-hidden"
                    >
                      {language === "ar" ? "English" : "العربية"}
                    </motion.span>
                  </button>
                  <SidebarLink link={notificationsLink} onClick={() => setOpen(false)} />
                </div>
              </div>
              <div className="border-t border-stone-200/80 dark:border-neutral-700 pt-4 flex-shrink-0">
                <button
                  type="button"
                  className="flex w-full items-center justify-start gap-3 py-2 px-2 rounded-lg min-h-[2.5rem] text-neutral-700 dark:text-neutral-200 hover:bg-stone-200/80 dark:hover:bg-stone-700/50 text-sm"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.localStorage.removeItem("admin-auth");
                      router.push("/admin/login");
                    }
                  }}
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg [&_svg]:size-5">
                    <LogOut className={iconClass} />
                  </span>
                  <motion.span
                    animate={{ display: open ? "inline-block" : "none", opacity: open ? 1 : 0 }}
                    className="text-sm whitespace-pre overflow-hidden"
                  >
                    {t("admin.logout")}
                  </motion.span>
                </button>
              </div>
            </SidebarBody>
          </Sidebar>
        </div>
        <main
          className="flex min-w-0 flex-1 flex-col overflow-auto bg-background p-4 lg:p-6 print:p-0"
          aria-label="Main content"
        >
          {pathname !== "/admin/login" && (
            <div className="mb-4 flex items-center justify-between gap-3">
              <Breadcrumb>
                <BreadcrumbList className="text-xs sm:text-sm">
                  {breadcrumbs.map((c, idx) => (
                    <React.Fragment key={c.href}>
                      <BreadcrumbItem>
                        {c.isLast ? (
                          <BreadcrumbPage>{c.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link href={c.href}>{c.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {idx < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator>
                          {dir === "rtl" ? (
                            <ChevronLeft className="size-3.5" />
                          ) : (
                            <ChevronRight className="size-3.5" />
                          )}
                        </BreadcrumbSeparator>
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}
          {children}
        </main>
      </div>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminDataProvider>
      <I18nProvider>
        <AdminLangSync />
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </I18nProvider>
    </AdminDataProvider>
  );
}
