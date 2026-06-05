import { NextResponse } from "next/server";
import { getAdminData, setAdminData } from "@/lib/db";
import {
  sendEmail,
  getReceptionEmail,
  guestBookingConfirmedHtml,
  receptionNewBookingHtml,
} from "@/lib/email";

function getEnv(key: string): string | undefined {
  const v = process.env[key];
  if (typeof v !== "string") return undefined;
  return v.trim().replace(/^["']|["']$/g, "").replace(/\r?\n/g, "");
}

function getBasicAuth(secretKey: string) {
  const auth = Buffer.from(`${secretKey}:`).toString("base64");
  return `Basic ${auth}`;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * After paying on Moyasar's hosted invoice page, the customer is redirected here.
 * We verify invoice status when an id is present (Moyasar often appends ?id= like payments).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const bookingId = url.searchParams.get("bookingId") ?? "";
  const invoiceId = url.searchParams.get("id") ?? url.searchParams.get("invoice_id") ?? "";

  const secretKey = getEnv("MOYASAR_SECRET_KEY");

  if (secretKey && invoiceId && bookingId) {
    const moyasarRes = await fetch(`https://api.moyasar.com/v1/invoices/${invoiceId}`, {
      headers: { Authorization: getBasicAuth(secretKey) },
      cache: "no-store",
    });
    const inv = (await moyasarRes.json().catch(() => null)) as {
      status?: string;
      metadata?: Record<string, string>;
    } | null;

    const metaBooking = inv?.metadata?.bookingId?.trim();
    if (inv && metaBooking === bookingId) {
      const status = String(inv.status ?? "").toLowerCase();
      const paid = status === "paid";
      const isFailure =
        status === "failed" ||
        status === "canceled" ||
        status === "cancelled" ||
        status === "expired" ||
        status === "voided" ||
        status === "refunded";

      const data = await getAdminData();
      if (data) {
        const prev = (data.bookings ?? []).find((b) => b.id === bookingId);
        const wasPaid = String(prev?.paymentStatus ?? "").toLowerCase() === "paid";

        const nextBookings = (data.bookings ?? []).map((b) => {
          if (b.id !== bookingId) return b;
          if (paid) return { ...b, status: "confirmed" as const, paymentStatus: "paid" as const };
          if (isFailure) return { ...b, status: "cancelled" as const, paymentStatus: "refunded" as const };
          return b;
        });
        await setAdminData({ ...data, bookings: nextBookings });

        // Email once on the paid transition (webhook covers the case where the
        // customer never returns to this success URL).
        if (paid && !wasPaid && prev) {
          const b = {
            id: prev.id,
            guestName: prev.guestName,
            email: prev.email,
            phone: prev.phone,
            room: prev.room,
            roomNumber: prev.roomNumber,
            checkIn: prev.checkIn,
            checkOut: prev.checkOut,
            guests: prev.guests,
            amount: prev.amount,
            paymentStatus: "paid",
          };
          await Promise.allSettled([
            prev.email
              ? sendEmail({
                  to: prev.email,
                  subject: "تم تأكيد حجزك | Your booking is confirmed — نرسيان طيبة",
                  html: guestBookingConfirmedHtml(b),
                })
              : Promise.resolve(false),
            sendEmail({
              to: getReceptionEmail(),
              subject: `حجز جديد مدفوع | New paid booking — ${prev.id}`,
              html: receptionNewBookingHtml(b, "paid"),
              replyTo: prev.email || undefined,
            }),
          ]);
        }
      }
    }
  }

  return NextResponse.redirect(new URL("/my-bookings", url.origin));
}
