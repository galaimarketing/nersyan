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

function applyStatusToBookings(
  bookings: NonNullable<Awaited<ReturnType<typeof getAdminData>>>["bookings"],
  bookingId: string,
  status: string
) {
  const s = status.toLowerCase();
  const paid = s === "paid";
  const isFailure =
    s === "failed" || s === "canceled" || s === "cancelled" || s === "expired" || s === "voided" || s === "refunded";
  return (bookings ?? []).map((b) => {
    if (b.id !== bookingId) return b;
    if (paid) return { ...b, status: "confirmed" as const, paymentStatus: "paid" as const };
    if (isFailure) return { ...b, status: "cancelled" as const, paymentStatus: "refunded" as const };
    return b;
  });
}

/**
 * Moyasar POSTs here when an invoice is paid (and possibly on other events).
 *
 * Hardened against forged calls:
 *  1. If MOYASAR_WEBHOOK_SECRET is set, the payload's `secret_token` must match.
 *  2. The booking status is taken from a fresh server-to-server fetch of the
 *     invoice from Moyasar's API — never from the (spoofable) request body.
 */
export async function POST(req: Request) {
  const secretKey = getEnv("MOYASAR_SECRET_KEY");
  if (!secretKey) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  let raw: Record<string, unknown>;
  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // 1) Shared-secret check (if configured in env + Moyasar dashboard).
  const webhookSecret = getEnv("MOYASAR_WEBHOOK_SECRET");
  if (webhookSecret) {
    const provided = typeof raw.secret_token === "string" ? raw.secret_token : "";
    if (provided !== webhookSecret) {
      return NextResponse.json({ ok: false, error: "bad secret_token" }, { status: 401 });
    }
  }

  // The invoice can arrive as raw, raw.invoice, or raw.data depending on event shape.
  const invoice = ("invoice" in raw
    ? (raw.invoice as InvoicePayload)
    : "data" in raw
      ? (raw.data as InvoicePayload)
      : (raw as InvoicePayload)) ?? {};

  const invoiceId = typeof invoice.id === "string" ? invoice.id.trim() : "";

  // 2) Authoritative status: re-fetch the invoice from Moyasar.
  let authoritativeStatus: string | undefined;
  let bookingId = invoice.metadata?.bookingId?.trim();

  if (invoiceId) {
    try {
      const auth = Buffer.from(`${secretKey}:`).toString("base64");
      const res = await fetch(`https://api.moyasar.com/v1/invoices/${invoiceId}`, {
        headers: { Authorization: `Basic ${auth}` },
        cache: "no-store",
      });
      const inv = (await res.json().catch(() => null)) as InvoicePayload | null;
      if (inv) {
        authoritativeStatus = inv.status;
        bookingId = inv.metadata?.bookingId?.trim() || bookingId;
      }
    } catch {
      // If the verification fetch fails, do not trust the body — skip.
      return NextResponse.json({ ok: false, error: "verification failed" }, { status: 502 });
    }
  }

  // Without a verified invoice we won't mutate anything.
  if (!invoiceId || authoritativeStatus === undefined) {
    return NextResponse.json({ ok: true, skipped: true });
  }
  if (!bookingId) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const data = await getAdminData();
  if (!data) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const nextBookings = applyStatusToBookings(data.bookings, bookingId, authoritativeStatus);
  await setAdminData({ ...data, bookings: nextBookings });
  return NextResponse.json({ ok: true });
}
