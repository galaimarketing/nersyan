import { NextResponse } from "next/server";
import { getAdminData, setAdminData } from "@/lib/db";
import { mergeCustomerBookingIntoAdminData, type PendingBookingPayload } from "@/lib/admin-store";
import {
  sendEmail,
  getReceptionEmail,
  guestBookingReceivedHtml,
  receptionNewBookingHtml,
} from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Public endpoint for customers to create a booking WITHOUT payment
 * (e.g. "pay on arrival"). It merges the booking server-side, so customers
 * never need write access to /api/admin/data (which is admin-only).
 *
 * The merge only creates a booking against an existing room — it can't be used
 * to overwrite arbitrary admin data.
 */
type BookingBody = {
  payload?: Partial<PendingBookingPayload>;
};

export async function POST(req: Request) {
  let body: BookingBody;
  try {
    body = (await req.json()) as BookingBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body?.payload;
  if (!payload?.roomId) {
    return NextResponse.json({ ok: false, error: "Missing booking payload" }, { status: 400 });
  }

  const data = await getAdminData();
  if (!data) {
    return NextResponse.json(
      { ok: false, error: "Database unavailable" },
      { status: 503 }
    );
  }

  const merged = mergeCustomerBookingIntoAdminData(data, {
    ...payload,
    roomId: payload.roomId,
    roomName: payload.roomName ?? "",
    status: "pending",
    paymentStatus: "pending",
  });
  if (!merged) {
    return NextResponse.json(
      { ok: false, error: "Room not found for this booking" },
      { status: 400 }
    );
  }

  const saved = await setAdminData(merged.nextData);
  if (!saved) {
    return NextResponse.json({ ok: false, error: "Failed to save booking" }, { status: 500 });
  }

  // Notify guest + reception (best-effort — never block the booking on email).
  const bk = merged.booking;
  const emailData = {
    id: bk.id,
    guestName: bk.guestName,
    email: bk.email,
    phone: bk.phone,
    room: bk.room,
    roomNumber: bk.roomNumber,
    checkIn: bk.checkIn,
    checkOut: bk.checkOut,
    guests: bk.guests,
    amount: bk.amount,
    paymentStatus: "pending",
  };
  await Promise.allSettled([
    bk.email
      ? sendEmail({
          to: bk.email,
          subject: "تم استلام حجزك | Booking received — نرسيان طيبة",
          html: guestBookingReceivedHtml(emailData),
        })
      : Promise.resolve(false),
    sendEmail({
      to: getReceptionEmail(),
      subject: `حجز جديد (الدفع عند الوصول) | New booking (pay on arrival) — ${bk.id}`,
      html: receptionNewBookingHtml(emailData, "on_arrival"),
      replyTo: bk.email || undefined,
    }),
  ]);

  return NextResponse.json({ ok: true, bookingId: merged.booking.id });
}
