import { NextResponse } from "next/server";
import { getAdminData, hasDatabase, setAdminData } from "@/lib/db";
import { defaultAdminData, generateId, normalizeAdminData } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

type ContactBody = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

export async function POST(request: Request) {
  if (!hasDatabase()) {
    return NextResponse.json({ ok: false, error: "No database configured" }, { status: 503 });
  }

  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  const current = normalizeAdminData((await getAdminData()) ?? defaultAdminData);
  const next = {
    ...current,
    contactMessages: [
      {
        id: `C${generateId().slice(0, 8).toUpperCase()}`,
        name,
        email,
        phone,
        message,
        createdAt: new Date().toISOString().slice(0, 10),
        read: false,
      },
      ...(current.contactMessages ?? []),
    ],
    notifications: [
      {
        id: `N${generateId().slice(0, 6).toUpperCase()}`,
        title: "New contact message",
        message: `${name} (${email})`,
        time: new Date().toISOString(),
        read: false,
        type: "contact" as const,
        link: "/admin/contact",
      },
      ...(current.notifications ?? []),
    ],
  };

  const ok = await setAdminData(next);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Failed to save" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

