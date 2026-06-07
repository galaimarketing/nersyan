import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { isLikelyRealEmail } from "@/lib/local-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Creates a customer account that is ALREADY email-confirmed (via the Supabase
 * Admin API + service role). This lets the client sign in immediately after
 * signup — no confirmation email, no email-link redirect. Avoids dependence on
 * the dashboard "Confirm email" toggle and the Site URL redirect.
 */
export async function POST(req: Request) {
  let body: { email?: unknown; password?: unknown; fullName?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const fullName = String(body.fullName ?? "").trim();

  if (!isLikelyRealEmail(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: "weak_password" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 500 });
  }

  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, name: fullName },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already") || msg.includes("registered") || msg.includes("exist")) {
      return NextResponse.json({ ok: false, error: "already_exists" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: "signup_failed" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
