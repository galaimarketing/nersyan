import { NextResponse } from "next/server";
import { getAdminData, setAdminData } from "@/lib/db";

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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const paymentId = url.searchParams.get("id") ?? "";
  const bookingId = url.searchParams.get("bookingId") ?? "";
  const statusParam = url.searchParams.get("status") ?? "";

  const secretKey = getEnv("MOYASAR_SECRET_KEY");
  if (!secretKey || !paymentId || !bookingId) {
    return NextResponse.redirect(new URL("/payment", url.origin));
  }

  // 1) Verify payment status from Moyasar
  const moyasarRes = await fetch(`https://api.moyasar.com/v1/payments/${paymentId}`, {
    headers: { Authorization: getBasicAuth(secretKey) },
    cache: "no-store",
  });
  const moyasarJson = await moyasarRes.json().catch(() => null);
  const moyasarStatus = moyasarJson?.status ?? statusParam;

  const paid =
    moyasarStatus === "paid" ||
    moyasarStatus === "succeeded" ||
    moyasarStatus === "paid_out";

  // 2) Update booking in DB
  const data = await getAdminData();
  if (!data) {
    return NextResponse.redirect(new URL("/payment", url.origin));
  }

  const nextBookings = (data.bookings ?? []).map((b) => {
    if (b.id !== bookingId) return b;
    if (paid) {
      return { ...b, status: "confirmed", paymentStatus: "paid" };
    }
    return { ...b, status: "cancelled", paymentStatus: "refunded" };
  });

  const updatedCount = (data.bookings ?? []).reduce((acc, b) => acc + (b.id === bookingId ? 1 : 0), 0);
  if (!updatedCount) {
    return NextResponse.redirect(new URL("/my-bookings", url.origin));
  }

  await setAdminData({ ...data, bookings: nextBookings });

  // 3) Redirect user to his booking list
  return NextResponse.redirect(new URL("/my-bookings", url.origin));
}

