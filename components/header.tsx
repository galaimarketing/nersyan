"use client";

import * as React from "react";
import Link from "next/link";
import { useScroll, motion } from "framer-motion";
import { Menu, X, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useI18n, LanguageToggle } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";

const Logo = ({ className }: { className?: string }) => {
  const { language } = useI18n();
  const settings = useSettings();
  const name = language === "ar" ? (settings.hotelNameAr ?? "نرسيان طيبة") : (settings.hotelNameEn ?? "Nersian Taiba");
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 1080 1080"
        className="h-5 w-5 text-current"
        fill="currentColor"
        aria-hidden
      >
        <rect x="113.3" y="111.5" width="175.3" height="164.8" />
        <path d="M288.6,694.1v-390.5H113.3l2.4,478.4c0,95.7,78.5,173.2,175.3,173.2h0v-.3h273.8s1,0,1,0h174.3V384.1c0-45-37-81.6-82.5-81.6h-92.8v521.3h-171.3s-104.9,11-104.9-129.8Z" />
        <path d="M790.6,111.6h0c0,0-1.4,0-1.4,0,0,0-.1,0-.2,0h0s-278.4,0-278.4,0h0s-12,0-12,0h-163.4v578.5c0,45,37,90,82.5,90h92.8V242.6h170.3s100.3,6.7,110.5,109.1v616.8h175.3l-2.4-683.7c0-95.1-77.6-172.3-173.7-173.1Z" />
      </svg>
      <span className="text-lg font-semibold">{name}</span>
    </div>
  );
};

export function Header() {
  const { t, dir, language } = useI18n();
  const [menuState, setMenuState] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const { scrollYProgress } = useScroll();

  React.useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setScrolled(latest > 0.05);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const menuItems = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.rooms"), href: "/rooms" },
    { name: t("nav.blog"), href: "/blog" },
    { name: t("nav.amenities"), href: "/#amenities" },
    { name: t("nav.location"), href: "/#location" },
    { name: t("nav.contact"), href: "/#contact" },
  ];

  return (
    <header dir={dir}>
      <nav data-state={menuState && "active"} className="group fixed z-20 w-full pt-2">
        <div
          className={cn(
            "mx-auto max-w-7xl rounded-3xl px-6 transition-all duration-300 lg:px-12",
            scrolled && "bg-background/80 backdrop-blur-2xl"
          )}
        >
          <motion.div
            className={cn(
              "relative flex flex-wrap items-center justify-between gap-6 py-3 duration-200 lg:gap-0 lg:py-6",
              scrolled && "lg:py-4"
            )}
          >
            <div className="flex w-full items-center justify-between gap-12 lg:w-auto">
              <Link href="/" aria-label="home" className="flex items-center space-x-2">
                <Logo className={scrolled ? "text-foreground" : "text-white"} />
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu
                  className={cn(
                    "m-auto size-6 duration-200",
                    scrolled ? "text-foreground" : "text-white",
                    menuState && "rotate-180 scale-0 opacity-0"
                  )}
                />
                <X
                  className={cn(
                    "absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200",
                    scrolled ? "text-foreground" : "text-white",
                    menuState && "rotate-0 scale-100 opacity-100"
                  )}
                />
              </button>

              <div className="hidden lg:block">
                <ul className="flex gap-8 text-sm">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className={cn(
                          "block duration-150",
                          scrolled
                            ? "text-muted-foreground hover:text-foreground"
                            : "text-white hover:text-white/80"
                        )}
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              className={cn(
                "bg-background mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent",
                menuState && "block lg:flex"
              )}
            >
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-foreground block duration-150"
                        onClick={() => setMenuState(false)}
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col items-center gap-3 sm:flex-row md:w-fit">
                <LanguageToggle />
                <Button
                  asChild
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full"
                >
                  <Link href="/my-bookings" aria-label={language === "ar" ? "حسابي" : "My account"}>
                    <User className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </nav>
    </header>
  );
}
