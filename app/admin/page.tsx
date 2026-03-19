"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  BedDouble,
  Calendar,
  Users,
  Search,
  ArrowUpRight,
  Inbox,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminData } from "@/components/admin-data-provider";
import { useI18n } from "@/lib/i18n";
import { CurrencySymbol } from "@/components/currency-symbol";
import { formatRoomNumberForLang, translatedAdminRoomType } from "@/lib/admin-room-display";
import { useSettings } from "@/lib/settings";

const statKeys = [
  { key: "admin.totalBookings", iconKey: "bookings", icon: Calendar },
  { key: "admin.revenueThisMonth", iconKey: "revenue", icon: null },
  { key: "admin.occupancyRate", iconKey: "occupancy", icon: BedDouble },
  { key: "admin.totalGuests", iconKey: "guests", icon: Users },
] as const;

export default function AdminDashboard() {
  const { t, language } = useI18n();
  const settings = useSettings();
  const { data, refetchFromApi } = useAdminData();

  useEffect(() => {
    void refetchFromApi();
  }, [refetchFromApi]);

  const totalBookings = data.bookings.length;
  const now = new Date();
  const thisMonth = now.getFullYear() * 100 + now.getMonth();
  const revenue = data.bookings
    .filter(
      (b) =>
        b.paymentStatus === "paid" &&
        b.status !== "cancelled" &&
        (() => {
          const [y, m] = b.createdAt.split("-").map(Number);
          return (y * 100 + (m - 1)) === thisMonth;
        })()
    )
    .reduce((sum, b) => sum + b.amount, 0);
  const occupiedRooms = data.rooms.filter((r) => r.status === "occupied").length;
  const occupancyDenominator = Math.max(1, settings.totalHotelRooms ?? 30);
  const occupancyRate = `${Math.round((occupiedRooms / occupancyDenominator) * 100)}%`;
  const totalGuests = data.bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + (Number.isFinite(b.guests) ? b.guests : 0), 0);

  const stats = [
    { title: t(statKeys[0].key), value: String(totalBookings), icon: statKeys[0].icon },
    { title: t(statKeys[1].key), value: <>{revenue.toLocaleString()} <CurrencySymbol /></>, icon: statKeys[1].icon },
    { title: t(statKeys[2].key), value: occupancyRate, icon: statKeys[2].icon },
    { title: t(statKeys[3].key), value: String(totalGuests), icon: statKeys[3].icon },
  ];

  const recentBookings = [...data.bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  const roomStatus = data.rooms;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  {stat.icon ? (
                    <stat.icon className="h-6 w-6 text-primary" />
                  ) : (
                    <CurrencySymbol className="inline-block text-2xl leading-none text-primary" />
                  )}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("admin.recentBookings")}</CardTitle>
              <CardDescription>{t("admin.latestBookingActivity")}</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/bookings">
                {t("admin.viewAll")}
                <ArrowUpRight className="ms-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
                <Inbox className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm font-medium text-foreground">{t("admin.noBookingsYet")}</p>
                <p className="text-xs text-muted-foreground">{t("admin.bookingsWillAppearHere")}</p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href="/admin/bookings">{t("admin.goToBookings")}</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((b, index) => (
                  <div
                    key={`${b.id}-${b.guestId}-${b.checkIn}-${b.checkOut}-${b.createdAt}-${index}`}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-foreground">{b.guestName}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.room}
                        {b.roomNumber ? ` · #${b.roomNumber}` : ""} · {b.checkIn} – {b.checkOut}
                      </p>
                    </div>
                    <span className="text-muted-foreground">{b.status}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Room Status */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("admin.roomStatus")}</CardTitle>
              <CardDescription>{t("admin.currentRoomAvailability")}</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/rooms">
                {t("admin.manage")}
                <ArrowUpRight className="ms-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {roomStatus.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
                <BedDouble className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm font-medium text-foreground">{t("admin.noRoomsYet")}</p>
                <p className="text-xs text-muted-foreground">{t("admin.addRoomsToSeeStatus")}</p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href="/admin/rooms">{t("admin.manageRooms")}</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {roomStatus.map((r) => {
                  const displayStatus = r.status;
                  const statusLabel =
                    displayStatus === "occupied"
                      ? t("admin.booked")
                      : displayStatus === "available"
                        ? t("admin.available")
                        : t("admin.maintenance");
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-lg border p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {t("admin.roomLabel")} {formatRoomNumberForLang(r.number, language)}
                        </p>
                        <p className="text-xs text-muted-foreground">{translatedAdminRoomType(t, r.type)}</p>
                      </div>
                      <span
                        className={
                          displayStatus === "available"
                            ? "text-green-600"
                            : displayStatus === "occupied"
                              ? "text-blue-600"
                              : "text-yellow-600"
                        }
                      >
                        {statusLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.quickActions")}</CardTitle>
          <CardDescription>{t("admin.commonAdminTasks")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button className="h-auto flex-col gap-2 py-6" variant="outline" asChild>
              <Link href="/admin/rooms">
                <BedDouble className="h-6 w-6" />
                <span>{t("admin.addNewRoom")}</span>
              </Link>
            </Button>
            <Button className="h-auto flex-col gap-2 py-6" variant="outline" asChild>
              <Link href="/admin/bookings?new=1">
                <Calendar className="h-6 w-6" />
                <span>{t("admin.createBooking")}</span>
              </Link>
            </Button>
            <Button className="h-auto flex-col gap-2 py-6" variant="outline" asChild>
              <Link href="/admin/guests">
                <Users className="h-6 w-6" />
                <span>{t("admin.guestsTitle")}</span>
              </Link>
            </Button>
            <Button className="h-auto flex-col gap-2 py-6" variant="outline" asChild>
              <Link href="/admin/settings#seo">
                <Search className="h-6 w-6" />
                <span>{t("admin.seoSettings")}</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
