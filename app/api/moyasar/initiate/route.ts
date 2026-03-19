import { NextResponse } from "next/server";
import { addCustomerBookingToStore } from "@/lib/admin-store";

type InitiateBody = {
  token: string;
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

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json()) as InitiateBody;
  const token = body?.token;
  const payload = body?.payload;

  if (!token || !payload) {
    return NextResponse.json({ ok: false, error: "Missing token or payload" }, { status: 400 });
  }

  const secretKey = getEnv("MOYASAR_SECRET_KEY");
  if (!secretKey) {
    return NextResponse.json({ ok: false, error: "Moyasar secret key missing" }, { status: 500 });
  }

  // 1) Create pending booking
  const booking = await addCustomerBookingToStore({
    ...payload,
    status: "pending",
    paymentStatus: "pending",
  });
  if (!booking?.id) {
    return NextResponse.json({ ok: false, error: "Failed to create pending booking" }, { status: 400 });
  }

  // 2) Create Moyasar payment using the card token
  const url = new URL(req.url);
  const origin = url.origin;
  const callbackUrl = `${origin}/api/moyasar/callback?bookingId=${encodeURIComponent(booking.id)}`;

  const amount = Math.max(1, Math.round(booking.amount ?? payload.total ?? 0));

  const auth = Buffer.from(`${secretKey}:`).toString("base64");
  const moyasarRes = await fetch("https://api.moyasar.com/v1/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount,
      currency: "SAR",
      description: `${booking.guestName} - ${booking.room} #${booking.roomNumber} (${booking.id})`,
      callback_url: callbackUrl,
      source: { type: "token", token },
    }),
  });

  const moyasarJson = await moyasarRes.json().catch(() => null);
  if (!moyasarRes.ok || !moyasarJson || moyasarJson.status !== "initiated") {
    return NextResponse.json(
      { ok: false, error: moyasarJson?.source?.message ?? "Failed to initiate payment" },
      { status: 400 }
    );
  }

  const transactionUrl = moyasarJson?.source?.transaction_url;
  if (!transactionUrl) {
    return NextResponse.json({ ok: false, error: "Missing transaction_url" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, transaction_url: transactionUrl });
}

