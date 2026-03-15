"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AdminDataProvider, useAdminData } from "@/components/admin-data-provider";
import { I18nProvider, useI18n, AdminLangSync } from "@/lib/i18n";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  useSidebar,
} from "@/components/ui/sidebar";

const sidebarItems = [
  { icon: LayoutDashboard, labelKey: "admin.panel", href: "/admin" },
  { icon: BedDouble, labelKey: "admin.rooms", href: "/admin/rooms" },
  { icon: Calendar, labelKey: "admin.bookingsTitle", href: "/admin/bookings" },
  { icon: Users, labelKey: "admin.guestsTitle", href: "/admin/guests" },
  { icon: FileText, labelKey: "admin.blogTitle", href: "/admin/blog" },
  { icon: ImageIcon, labelKey: "admin.mediaTitle", href: "/admin/media" },
  { icon: Settings, labelKey: "admin.settings", href: "/admin/settings" },
];

function AdminSidebarLogo() {
  const { open } = useSidebar();
  const { t, dir } = useI18n();
  if (!open) return <AdminSidebarLogoIcon />;
  const logoBlock = (
    <div className="h-5 w-6 bg-primary rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
  );
  const label = (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-medium text-foreground dark:text-white whitespace-pre"
    >
      {t("admin.panel")}
    </motion.span>
  );
  return (
    <Link
      href="/admin"
      className={cn(
        "font-normal flex items-center gap-2 text-sm text-foreground py-1 relative z-20",
        dir === "rtl" && "flex-row-reverse"
      )}
    >
      {logoBlock}
      {label}
    </Link>
  );
}

function AdminSidebarLogoIcon() {
  return (
    <Link
      href="/admin"
      className="font-normal flex space-x-2 items-center text-sm text-foreground py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-primary rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { t, language, setLanguage, dir } = useI18n();
  const { notifications } = useAdminData();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const unreadCount = (notifications ?? []).filter((n) => !n.read).length;

  useEffect(() => {
    if (pathname === "/admin/login") return;
    if (typeof window !== "undefined" && window.localStorage.getItem("admin-auth") !== "true") {
      router.replace("/admin/login");
    }
  }, [pathname, router]);

  const iconClass = "text-neutral-700 dark:text-neutral-200";
  const mainLinks = sidebarItems.map((item) => ({
    label: t(item.labelKey),
    href: item.href,
    icon: <item.icon className={iconClass} />,
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

  return (
    <div className={cn("flex min-h-screen bg-secondary/30", dir === "rtl" && "flex-row-reverse")} dir={dir}>
      <Sidebar open={open} setOpen={setOpen}>
        <div className="flex flex-1 min-w-0 flex-col md:flex-row">
          <SidebarBody className="flex flex-col justify-between gap-6 flex-shrink-0 border-e border-stone-200/80 dark:border-neutral-700">
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
                {/* Language and Notifications just under Settings */}
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

          <main className="flex-1 min-w-0 p-4 lg:p-6 overflow-auto">{children}</main>
        </div>
      </Sidebar>
    </div>
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
