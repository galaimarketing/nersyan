import { NextResponse } from "next/server";
import { getAdminData } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import type { AdminBooking } from "@/lib/admin-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Returns ONLY the requesting customer's bookings — the full admin dataset never
 * leaves the server. Replaces the old pattern where the client downloaded all of
 * /api/admin/data and filtered locally (which leaked every guest's PII).
 *
 * Identity resolution, strongest first:
 *  1. Supabase access token (Authorization: Bearer ...) — verified server-side.
 *     This is the only spoof-proof path (OAuth / future Supabase email auth).
 *  2. ?email= query param — best-effort, used by the legacy localStorage email
 *     login which has no server-verifiable session. Returns only that email's
 *     bookings (no mass dump), but cannot prove the caller owns that email.
 */
function toPublicBooking(b: AdminBooking) {
  return {
    id: b.id,
    room: b.room,
    roomNumber: b.roomNumber,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    guests: b.guests,
    amount: b.amount,
    status: b.status,
    paymentStatus: b.paymentStatus,
    createdAt: b.createdAt,
    guestName: b.guestName,
  };
}

async function emailFromBearer(req: Request): Promise<string | null> {
  const authz = req.headers.get("authorization") ?? "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7).trim() : "";
  if (!token) return null;
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user?.email) return null;
    return data.user.email.toLowerCase();
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  // 1) Prefer a verified Supabase identity.
  let email = await emailFromBearer(req);

  // 2) Fall back to the email query param (legacy localStorage login).
  if (!email) {
    const qp = new URL(req.url).searchParams.get("email");
    email = qp ? qp.trim().toLowerCase() : null;
  }

  if (!email) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }

  const data = await getAdminData();
  const bookings = (data?.bookings ?? [])
    .filter((b) => (b.email ?? "").toLowerCase() === email)
    .map(toPublicBooking);

  return NextResponse.json({ ok: true, bookings });
}
