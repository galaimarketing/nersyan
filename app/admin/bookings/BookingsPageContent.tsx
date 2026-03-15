"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Calendar, Check, Filter, Inbox, BedDouble, User, Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAdminData } from "@/components/admin-data-provider";
import type { BookingStatus, PaymentStatus } from "@/lib/admin-store";
import { useI18n } from "@/lib/i18n";
import { CurrencySymbol } from "@/components/currency-symbol";

const statusKeyMap: Record<BookingStatus, string> = {
  pending: "admin.statusPending",
  confirmed: "admin.statusConfirmed",
  "checked-in": "admin.statusCheckedIn",
  "checked-out": "admin.statusCheckedOut",
  cancelled: "admin.statusCancelled",
};
const paymentKeyMap: Record<PaymentStatus, string> = {
  pending: "admin.statusPending",
  paid: "admin.paymentPaid",
  refunded: "admin.paymentRefunded",
};

export default function BookingsPageContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const guestId = searchParams.get("guest") ?? undefined;
  const { data, getGuestById, addBooking, addGuest, updateBooking } = useAdminData();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [newBookingOpen, setNewBookingOpen] = useState(false);
  const [guestMode, setGuestMode] = useState<"existing" | "new">("new");
  const [newGuestId, setNewGuestId] = useState("");
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestEmail, setNewGuestEmail] = useState("");
  const [newGuestPhone, setNewGuestPhone] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [newCheckIn, setNewCheckIn] = useState("");
  const [newCheckOut, setNewCheckOut] = useState("");
  const [newNights, setNewNights] = useState(1);
  const [newGuests, setNewGuests] = useState(1);
  const [newAmount, setNewAmount] = useState("");
  const [newStatus, setNewStatus] = useState<BookingStatus>("pending");
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>("pending");

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setNewBookingOpen(true);
      router.replace("/admin/bookings" + (guestId ? `?guest=${guestId}` : ""), { scroll: false });
    }
  }, [searchParams, router, guestId]);

  const selectedGuest = guestMode === "existing" && newGuestId ? getGuestById(newGuestId) : null;
  const canSubmit =
    (guestMode === "existing" && selectedGuest) ||
    (guestMode === "new" && newGuestName.trim());

  const guestFilter = guestId ? getGuestById(guestId) : null;
  const bookingsByGuest = useMemo(
    () =>
      guestId
        ? data.bookings.filter((b) => b.guestId === guestId)
        : data.bookings,
    [data.bookings, guestId]
  );

  const filteredBookings = bookingsByGuest.filter((booking) => {
    const matchesSearch =
      booking.guestName.toLowerCase().includes(search.toLowerCase()) ||
      booking.id.toLowerCase().includes(search.toLowerCase()) ||
      booking.room.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalBookings = data.bookings.length;
  const confirmedCount = data.bookings.filter((b) => b.status === "confirmed").length;
  const pendingCount = data.bookings.filter((b) => b.status === "pending").length;
  const revenue = data.bookings.filter((b) => b.paymentStatus === "paid").reduce((sum, b) => sum + b.amount, 0);

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.trim() || !newRoomNumber.trim() || !newCheckIn || !newCheckOut) return;
    const amount = parseInt(newAmount, 10) || 0;
    let guest = selectedGuest;
    if (guestMode === "new") {
      if (!newGuestName.trim()) return;
      guest = addGuest({
        name: newGuestName.trim(),
        email: newGuestEmail.trim(),
        phone: newGuestPhone.trim(),
      });
    }
    if (!guest) return;
    addBooking({
      guestId: guest.id,
      guestName: guest.name,
      email: guest.email,
      phone: guest.phone,
      room: newRoom.trim(),
      roomNumber: newRoomNumber.trim(),
      checkIn: newCheckIn,
      checkOut: newCheckOut,
      nights: newNights,
      guests: newGuests,
      status: newStatus,
      amount,
      paymentStatus: newPaymentStatus,
    });
    setNewGuestId("");
    setGuestMode("new");
    setNewGuestName("");
    setNewGuestEmail("");
    setNewGuestPhone("");
    setNewRoom("");
    setNewRoomNumber("");
    setNewCheckIn("");
    setNewCheckOut("");
    setNewNights(1);
    setNewGuests(1);
    setNewAmount("");
    setNewStatus("pending");
    setNewPaymentStatus("pending");
    setNewBookingOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("admin.bookingsTitle")}</h1>
          <p className="text-muted-foreground">{t("admin.manageReservations")}</p>
        </div>
        <Dialog open={newBookingOpen} onOpenChange={setNewBookingOpen}>
          <DialogTrigger asChild>
            <Button>
              <Calendar className="me-2 h-4 w-4" />
              {t("admin.newBooking")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("admin.newBooking")}</DialogTitle>
              <DialogDescription>{t("admin.createReservationForGuest")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBooking} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{t("admin.client")}</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={guestMode === "new" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGuestMode("new")}
                  >
                    {t("admin.newGuest")}
                  </Button>
                  <Button
                    type="button"
                    variant={guestMode === "existing" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGuestMode("existing")}
                  >
                    {t("admin.existingGuest")}
                  </Button>
                </div>
                {guestMode === "new" ? (
                  <div className="grid gap-2 rounded-lg border p-3">
                    <Input
                      placeholder={t("admin.fullName")}
                      value={newGuestName}
                      onChange={(e) => setNewGuestName(e.target.value)}
                      required={guestMode === "new"}
                    />
                    <Input
                      type="email"
                      placeholder={t("admin.email")}
                      value={newGuestEmail}
                      onChange={(e) => setNewGuestEmail(e.target.value)}
                    />
                    <Input
                      placeholder={t("admin.phone")}
                      value={newGuestPhone}
                      onChange={(e) => setNewGuestPhone(e.target.value)}
                    />
                  </div>
                ) : (
                  <Select value={newGuestId} onValueChange={setNewGuestId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("admin.selectGuest")} />
                    </SelectTrigger>
                    <SelectContent>
                      {data.guests.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name} ({g.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="room">{t("admin.roomType")}</Label>
                  <Input
                    id="room"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    placeholder="e.g. Deluxe"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="roomNumber">{t("admin.roomNumber")}</Label>
                  <Input
                    id="roomNumber"
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    placeholder="e.g. 101"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="checkIn">{t("admin.checkIn")}</Label>
                  <Input
                    id="checkIn"
                    type="date"
                    value={newCheckIn}
                    onChange={(e) => setNewCheckIn(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="checkOut">{t("admin.checkOut")}</Label>
                  <Input
                    id="checkOut"
                    type="date"
                    value={newCheckOut}
                    onChange={(e) => setNewCheckOut(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nights">{t("admin.nights")}</Label>
                  <Input
                    id="nights"
                    type="number"
                    min={1}
                    value={newNights}
                    onChange={(e) => setNewNights(parseInt(e.target.value, 10) || 1)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="guests">{t("admin.guestsCount")}</Label>
                  <Input
                    id="guests"
                    type="number"
                    min={1}
                    value={newGuests}
                    onChange={(e) => setNewGuests(parseInt(e.target.value, 10) || 1)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">{t("admin.amount")}</Label>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t("admin.status")}</Label>
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as BookingStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{t("admin.statusPending")}</SelectItem>
                      <SelectItem value="confirmed">{t("admin.statusConfirmed")}</SelectItem>
                      <SelectItem value="checked-in">{t("admin.statusCheckedIn")}</SelectItem>
                      <SelectItem value="checked-out">{t("admin.statusCheckedOut")}</SelectItem>
                      <SelectItem value="cancelled">{t("admin.statusCancelled")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>{t("admin.payment")}</Label>
                  <Select value={newPaymentStatus} onValueChange={(v) => setNewPaymentStatus(v as PaymentStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{t("admin.statusPending")}</SelectItem>
                      <SelectItem value="paid">{t("admin.paymentPaid")}</SelectItem>
                      <SelectItem value="refunded">{t("admin.paymentRefunded")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setNewBookingOpen(false)}>
                  {t("admin.cancel")}
                </Button>
                <Button type="submit" disabled={!canSubmit}>
                  {t("admin.createBookingButton")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("admin.totalBookings")}</p>
              <p className="text-2xl font-bold">{totalBookings}</p>
            </div>
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("admin.confirmed")}</p>
              <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
            </div>
            <Check className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("admin.pending")}</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <Filter className="h-8 w-8 text-yellow-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("admin.revenue")}</p>
              <p className="text-2xl font-bold text-primary">
                {revenue.toLocaleString()} <CurrencySymbol />
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {guestFilter && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-foreground">{t("admin.guestAndBookedRooms")}</h3>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/bookings">{t("admin.showAllBookings")}</Link>
              </Button>
            </div>
            <div className="mb-6 grid gap-2 rounded-lg border bg-background/50 p-4 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{guestFilter.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{guestFilter.email || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{guestFilter.phone || "—"}</span>
              </div>
            </div>
            <p className="mb-3 text-sm font-medium text-foreground">{t("admin.bookedRooms")}</p>
            <div className="space-y-4">
              {bookingsByGuest.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("admin.noBookingsForGuest")}</p>
              ) : (
                bookingsByGuest.map((booking) => {
                  const roomRecord = data.rooms.find(
                    (r) => r.number.trim() === booking.roomNumber.trim()
                  );
                  return (
                    <div
                      key={booking.id}
                      className="flex flex-wrap items-start justify-between gap-4 rounded-xl border bg-background p-4"
                    >
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-xs font-medium uppercase text-muted-foreground">{t("admin.roomLabel")}</p>
                          <p className="font-medium">{booking.room} · #{booking.roomNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-muted-foreground">{t("admin.checkInCheckOut")}</p>
                          <p className="text-sm">{booking.checkIn} → {booking.checkOut}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-muted-foreground">{t("admin.nightsGuests")}</p>
                          <p className="text-sm">{booking.nights} · {booking.guests}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-muted-foreground">{t("admin.amountPayment")}</p>
                          <p className="text-sm">{booking.amount.toLocaleString()} <CurrencySymbol /> · {t(paymentKeyMap[booking.paymentStatus as PaymentStatus])}</p>
                        </div>
                      </div>
                      {roomRecord && (
                        <div className="flex items-center gap-2 rounded-lg border border-dashed p-2">
                          <BedDouble className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {roomRecord.type}, {roomRecord.price} <CurrencySymbol /> · {t("admin.capacity")} {roomRecord.capacity} {t("admin.capacityGuests")}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("admin.searchBookingsPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ps-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t("admin.filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.allStatuses")}</SelectItem>
                <SelectItem value="confirmed">{t("admin.statusConfirmed")}</SelectItem>
                <SelectItem value="pending">{t("admin.statusPending")}</SelectItem>
                <SelectItem value="cancelled">{t("admin.statusCancelled")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[10%] text-start">{t("admin.bookingId")}</TableHead>
                <TableHead className="w-[18%] text-start">{t("admin.guest")}</TableHead>
                <TableHead className="w-[18%] text-start">{t("admin.roomLabel")}</TableHead>
                <TableHead className="w-[18%] text-start">{t("admin.dates")}</TableHead>
                <TableHead className="w-[10%] text-center whitespace-normal">
                  {t("admin.payment")}
                </TableHead>
                <TableHead className="w-[10%] text-end">{t("admin.amount")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Inbox className="h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-2 text-sm font-medium text-foreground">{t("admin.noBookingsYet")}</p>
                      <p className="text-xs text-muted-foreground">{t("admin.createBookingToGetStarted")}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="w-[10%] text-start font-medium">{booking.id}</TableCell>
                      <TableCell className="w-[18%] text-start">
                        <div>
                          <p className="font-medium">{booking.guestName}</p>
                          <p className="text-xs text-muted-foreground truncate">{booking.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="w-[18%] text-start">
                        <div>
                          <p className="font-medium">{booking.room}</p>
                          <p className="text-xs text-muted-foreground">{t("admin.roomLabel")} {booking.roomNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell className="w-[18%] text-start text-sm">
                        <div className="flex flex-col gap-0.5">
                          <span>{booking.checkIn}</span>
                          <span className="text-muted-foreground">{booking.checkOut}</span>
                        </div>
                      </TableCell>
                      <TableCell className="w-[10%] text-center whitespace-normal text-xs sm:text-sm">
                        <Select
                          value={booking.paymentStatus}
                          onValueChange={(v) =>
                            updateBooking(booking.id, { paymentStatus: v as PaymentStatus })
                          }
                        >
                          <SelectTrigger className="h-8 w-full justify-center text-xs sm:text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">{t("admin.statusPending")}</SelectItem>
                            <SelectItem value="paid">{t("admin.paymentPaid")}</SelectItem>
                            <SelectItem value="refunded">{t("admin.paymentRefunded")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="w-[10%] text-end font-semibold">
                        {booking.amount.toLocaleString()} <CurrencySymbol />
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
