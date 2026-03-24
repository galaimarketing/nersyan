import { NextResponse } from "next/server";
import { getAdminData, hasDatabase, setAdminData } from "@/lib/db";
import { defaultAdminData, generateBookingId, generateId, normalizeAdminData } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

type IncomingBooking = {
  id?: string;
  guestId?: string;
  guestName?: string;
  email?: string;
  phone?: string;
  room?: string;
  roomNumber?: string;
  roomId?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  guests?: number;
  status?: string;
  amount?: number;
  paymentStatus?: string;
  createdAt?: string;
};

export async function POST(request: Request) {
  if (!hasDatabase()) {
    return NextResponse.json({ ok: false, error: "No database configured" }, { status: 503 });
  }

  let body: IncomingBooking;
  try {
    body = (await request.json()) as IncomingBooking;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const bookingId = String(body.id ?? "").trim() || generateBookingId();
  const createdAt = String(body.createdAt ?? "").trim() || new Date().toISOString().slice(0, 10);

  const one = normalizeAdminData({
    bookings: [{ ...body, id: bookingId, createdAt }],
  }).bookings[0];

  if (!one || !one.roomNumber || !one.checkIn || !one.checkOut) {
    return NextResponse.json({ ok: false, error: "Missing booking fields" }, { status: 400 });
  }

  const current = normalizeAdminData((await getAdminData()) ?? defaultAdminData);
  if ((current.bookings ?? []).some((b) => b.id === one.id)) {
    return NextResponse.json({ ok: true, booking: one, duplicate: true });
  }

  const next = {
    ...current,
    bookings: [...(current.bookings ?? []), one],
    notifications: [
      {
        id: `N${generateId().slice(0, 6).toUpperCase()}`,
        title: "New booking",
        message: `${one.guestName} - ${one.room} (${one.checkIn} → ${one.checkOut})`,
        time: new Date().toISOString(),
        read: false,
        type: "booking" as const,
        link: "/admin/bookings",
      },
      ...(current.notifications ?? []),
    ],
  };

  const ok = await setAdminData(next);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Failed to save booking" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, booking: one });
}

