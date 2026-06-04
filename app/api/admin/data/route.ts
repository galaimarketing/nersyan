import { NextResponse } from "next/server";
import { getAdminData, setAdminData, hasDatabase } from "@/lib/db";
import type { AdminData } from "@/lib/admin-store";
import {
  defaultAdminData,
  normalizeAdminData,
  normalizeAndReconcileAdminData,
  reconcileRoomDiscountExpiries,
  reconcileRoomStatusesWithBookings,
} from "@/lib/admin-store";
import { isAuthedRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Admin-only: this returns the full dataset (all bookings + guest PII).
  // Customers use /api/my-bookings (their own bookings only); the public site
  // reads rooms via /api/rooms.
  if (!(await isAuthedRequest(request))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!hasDatabase()) {
    return NextResponse.json(normalizeAndReconcileAdminData(defaultAdminData), {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }
  const data = await getAdminData();
  if (data === null) {
    return NextResponse.json(normalizeAndReconcileAdminData(defaultAdminData), {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }
  const normalized = normalizeAdminData(data);
  const withStatuses = reconcileRoomStatusesWithBookings(normalized);
  const withDiscountExpiries = reconcileRoomDiscountExpiries(withStatuses.next);
  const changed = withStatuses.changed || withDiscountExpiries.changed;
  if (changed) {
    await setAdminData(withDiscountExpiries.next);
  }
  return NextResponse.json(withDiscountExpiries.next, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function PATCH(request: Request) {
  if (!(await isAuthedRequest(request))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!hasDatabase()) {
    return NextResponse.json({ ok: false, error: "No database configured" }, { status: 503 });
  }
  let body: AdminData;
  try {
    body = (await request.json()) as AdminData;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const ok = await setAdminData(body);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Failed to save" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
