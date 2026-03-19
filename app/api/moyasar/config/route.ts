import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Tells the client whether Moyasar is in test or live mode (from secret key prefix only).
 * Never exposes the key.
 */
export async function GET() {
  const raw = process.env.MOYASAR_SECRET_KEY;
  const key = typeof raw === "string" ? raw.trim() : "";

  let mode: "live" | "test" | "unset" = "unset";
  if (key.startsWith("sk_live_")) mode = "live";
  else if (key.startsWith("sk_test_")) mode = "test";

  return NextResponse.json({ mode });
}
