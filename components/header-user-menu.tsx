"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, LogOut, CalendarDays, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n";
import { useAppUser } from "@/lib/use-app-user";
import { cn } from "@/lib/utils";

type HeaderUserMenuProps = {
  showSolidNav: boolean;
};

export function HeaderUserMenu({ showSolidNav }: HeaderUserMenuProps) {
  const { t, language, dir } = useI18n();
  const { user, loading, signOut } = useAppUser();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const triggerClass = cn(
    "rounded-full shrink-0",
    !showSolidNav &&
      "border-white/50 bg-white/15 text-white hover:bg-white/25 hover:text-white dark:border-white/50"
  );

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    if (pathname === "/my-bookings" || pathname.startsWith("/payment")) {
      router.push(`/auth/signin?next=${encodeURIComponent(pathname)}`);
    } else {
      router.push("/");
    }
    router.refresh();
  };

  const signInHref = `/auth/signin?next=${encodeURIComponent(pathname || "/")}`;
  const signUpHref = `/auth/signup?next=${encodeURIComponent(pathname || "/")}`;

  if (loading) {
    return (
      <Button variant="outline" size="icon-sm" className={triggerClass} disabled aria-busy>
        <User className="h-4 w-4 opacity-50" />
      </Button>
    );
  }

  if (!user?.email) {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon-sm" className={triggerClass} aria-label={t("nav.accountMenu")}>
            <User className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[12rem]" dir={dir}>
          <DropdownMenuLabel className="font-normal text-muted-foreground text-xs">
            {t("nav.guestPrompt")}
          </DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={signInHref} className="flex cursor-pointer items-center gap-2" onClick={() => setOpen(false)}>
              <LogIn className="h-4 w-4" />
              {t("auth.signIn")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={signUpHref} className="flex cursor-pointer items-center gap-2" onClick={() => setOpen(false)}>
              <UserPlus className="h-4 w-4" />
              {t("auth.signUp")}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const initial = user.email.charAt(0).toUpperCase();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2 rounded-full px-2.5", triggerClass)} aria-label={t("nav.accountMenu")}>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {user.fullName?.charAt(0)?.toUpperCase() ?? initial}
          </span>
          <span
            className={cn(
              "hidden max-w-[140px] truncate text-xs font-medium sm:inline",
              showSolidNav ? "text-foreground" : "text-white"
            )}
          >
            {user.email}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[16rem]" dir={dir}>
        <DropdownMenuLabel className="space-y-1 font-normal">
          {user.fullName ? <p className="text-sm font-semibold text-foreground">{user.fullName}</p> : null}
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          {user.phone ? <p className="text-xs text-muted-foreground">{user.phone}</p> : null}
          {user.provider ? (
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground/80">
              {language === "ar" ? "طريقة الدخول" : "Signed in via"}: {user.provider}
            </p>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/my-bookings" className="flex cursor-pointer items-center gap-2" onClick={() => setOpen(false)}>
            <CalendarDays className="h-4 w-4" />
            {t("nav.myBookings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={(e) => {
            e.preventDefault();
            void handleSignOut();
          }}
        >
          <LogOut className="h-4 w-4" />
          {t("nav.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
