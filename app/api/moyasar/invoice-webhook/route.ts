import { NextResponse } from "next/server";
import { getAdminData, setAdminData } from "@/lib/db";

function getEnv(key: string): string | undefined {
  const v = process.env[key];
  if (typeof v !== "string") return undefined;
  return v.trim().replace(/^["']|["']$/g, "").replace(/\r?\n/g, "");
}

type InvoicePayload = {
  id?: string;
  status?: string;
  metadata?: Record<string, string>;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Moyasar POSTs here when an invoice is paid (and possibly on other events). */
export async function POST(req: Request) {
  const secretKey = getEnv("MOYASAR_SECRET_KEY");
  if (!secretKey) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  let invoice: InvoicePayload;
  try {
    const raw = (await req.json()) as unknown;
    invoice =
      raw && typeof raw === "object" && raw !== null && "invoice" in raw
        ? ((raw as { invoice: InvoicePayload }).invoice ?? {})
        : (raw as InvoicePayload);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const bookingId = invoice.metadata?.bookingId?.trim();
  if (!bookingId) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const status = String(invoice.status ?? "").toLowerCase();
  const paid = status === "paid";

  const isFailure =
    status === "failed" ||
    status === "canceled" ||
    status === "cancelled" ||
    status === "expired" ||
    status === "voided" ||
    status === "refunded";

  const data = await getAdminData();
  if (!data) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const nextBookings = (data.bookings ?? []).map((b) => {
    if (b.id !== bookingId) return b;
    if (paid) return { ...b, status: "confirmed" as const, paymentStatus: "paid" as const };
    if (isFailure) return { ...b, status: "cancelled" as const, paymentStatus: "refunded" as const };
    return b;
  });

  await setAdminData({ ...data, bookings: nextBookings });
  return NextResponse.json({ ok: true });
}
