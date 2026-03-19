import { NextResponse } from "next/server";
import { getAdminData, setAdminData } from "@/lib/db";
import { mergeCustomerBookingIntoAdminData } from "@/lib/admin-store";

type InvoiceBody = {
  payload: {
    roomId: string;
    roomName: string;
    dateRange?: { from?: string; to?: string };
    guests?: number;
    guestName?: string;
    guestPhone?: string;
    guestEmail?: string;
    total?: number;
    language?: string;
    status?: string;
    paymentStatus?: string;
  };
};

function getEnv(key: string): string | undefined {
  const v = process.env[key];
  if (typeof v !== "string") return undefined;
  return v.trim().replace(/^["']|["']$/g, "").replace(/\r?\n/g, "");
}

/** SAR amounts in our app are in riyals (e.g. 150). Moyasar invoices use halalah: 1 SAR = 100. */
function toAmountHalalah(sar: number): number {
  const n = Number(sar);
  if (!Number.isFinite(n) || n <= 0) return 100;
  return Math.max(100, Math.round(n * 100));
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json()) as InvoiceBody;
  const payload = body?.payload;

  if (!payload?.roomId) {
    return NextResponse.json({ ok: false, error: "Missing booking payload" }, { status: 400 });
  }

  const secretKey = getEnv("MOYASAR_SECRET_KEY");
  if (!secretKey) {
    return NextResponse.json({ ok: false, error: "Moyasar secret key missing" }, { status: 500 });
  }

  // Must use DB directly — addCustomerBookingToStore() uses fetch("/api/...") which fails in Route Handlers (no request base URL).
  const data = await getAdminData();
  if (!data) {
    return NextResponse.json(
      { ok: false, error: "Database unavailable. Check DATABASE_URL / POSTGRES_URL on the server." },
      { status: 503 }
    );
  }

  const merged = mergeCustomerBookingIntoAdminData(data, {
    ...payload,
    status: "pending",
    paymentStatus: "pending",
  });

  if (!merged) {
    return NextResponse.json(
      { ok: false, error: "Room not found for this booking. Try picking the room again from /rooms." },
      { status: 400 }
    );
  }

  const saved = await setAdminData(merged.nextData);
  if (!saved) {
    return NextResponse.json({ ok: false, error: "Failed to save booking" }, { status: 500 });
  }

  const booking = merged.booking;

  const url = new URL(req.url);
  const origin = url.origin;
  const amountHalalah = toAmountHalalah(booking.amount ?? payload.total ?? 0);

  const auth = Buffer.from(`${secretKey}:`).toString("base64");
  const moyasarRes = await fetch("https://api.moyasar.com/v1/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: amountHalalah,
      currency: "SAR",
      description: `Nersyan — ${booking.room} #${booking.roomNumber} — ${booking.guestName} (${booking.id})`,
      callback_url: `${origin}/api/moyasar/invoice-webhook`,
      success_url: `${origin}/api/moyasar/invoice-success?bookingId=${encodeURIComponent(booking.id)}`,
      back_url: `${origin}/payment`,
      metadata: { bookingId: booking.id },
    }),
  });

  const moyasarJson = (await moyasarRes.json().catch(() => null)) as { url?: string; message?: string } | null;
  if (!moyasarRes.ok || !moyasarJson?.url) {
    return NextResponse.json(
      { ok: false, error: moyasarJson?.message ?? "Failed to create Moyasar invoice" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, url: moyasarJson.url });
}
