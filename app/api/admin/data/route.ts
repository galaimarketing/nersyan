import { NextResponse } from "next/server";
import { getAdminData, setAdminData, hasDatabase } from "@/lib/db";
import type { AdminData } from "@/lib/admin-store";
import {
  defaultAdminData,
  normalizeAdminData,
  normalizeAndReconcileAdminData,
  reconcileRoomStatusesWithBookings,
} from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export async function GET() {
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
  const { next, changed } = reconcileRoomStatusesWithBookings(normalized);
  if (changed) {
    await setAdminData(next);
  }
  return NextResponse.json(next, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function PATCH(request: Request) {
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
