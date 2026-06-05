import { NextResponse } from "next/server";
import { getAdminData, setAdminData } from "@/lib/db";
import { sendEmail, guestCheckoutHtml } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Today's date (YYYY-MM-DD) in the hotel timezone. */
function todayInRiyadh(): string {
  const tz = process.env.NEXT_PUBLIC_HOTEL_TIMEZONE || process.env.HOTEL_TIMEZONE || "Asia/Riyadh";
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
}

/**
 * Sends a warm checkout-day email (with a review CTA) to guests whose stay ends
 * today. Triggered by Vercel Cron at 15:00 Riyadh (one hour before the 16:00
 * checkout). Idempotent via booking.checkoutEmailSentAt.
 *
 * Protected by CRON_SECRET: Vercel Cron sends `Authorization: Bearer <secret>`.
 */
export async function GET(req: Request) {
  // Require a configured secret — never run open. Vercel Cron sends it
  // automatically as `Authorization: Bearer <CRON_SECRET>` when the env is set.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "cron not configured" }, { status: 503 });
  }
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const data = await getAdminData();
  if (!data) {
    return NextResponse.json({ ok: false, error: "no data" }, { status: 503 });
  }

  const today = todayInRiyadh();
  const nowIso = new Date().toISOString();

  const due = (data.bookings ?? []).filter((b) => {
    if (b.checkoutEmailSentAt) return false;
    if (!b.email) return false;
    if (b.checkOut !== today) return false;
    if (b.status === "cancelled") return false;
    // Only real, active stays (paid online, or confirmed by reception).
    return b.paymentStatus === "paid" || b.status === "confirmed";
  });

  let sent = 0;
  const sentIds = new Set<string>();
  for (const b of due) {
    const ok = await sendEmail({
      to: b.email,
      subject: "نتمنّى لك سفراً آمناً | Safe travels — نرسيان طيبة",
      html: guestCheckoutHtml({
        id: b.id,
        guestName: b.guestName,
        email: b.email,
        room: b.room,
        roomNumber: b.roomNumber,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        guests: b.guests,
        amount: b.amount,
      }),
    });
    if (ok) {
      sent += 1;
      sentIds.add(b.id);
    }
  }

  if (sentIds.size > 0) {
    const nextBookings = (data.bookings ?? []).map((b) =>
      sentIds.has(b.id) ? { ...b, checkoutEmailSentAt: nowIso } : b
    );
    await setAdminData({ ...data, bookings: nextBookings });
  }

  return NextResponse.json({ ok: true, date: today, due: due.length, sent });
}
