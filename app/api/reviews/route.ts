import { NextResponse } from "next/server";
import { defaultAdminData, generateId, normalizeAdminData } from "@/lib/admin-store";
import { getAdminData, hasDatabase, setAdminData } from "@/lib/db";

export const dynamic = "force-dynamic";

type IncomingReview = {
  name?: string;
  rating?: number;
  comment?: string;
};

export async function GET() {
  if (!hasDatabase()) {
    return NextResponse.json([]);
  }
  const current = normalizeAdminData((await getAdminData()) ?? defaultAdminData);
  const approved = (current.reviews ?? [])
    .filter((r) => r.status === "approved")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json(approved, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function POST(request: Request) {
  if (!hasDatabase()) {
    return NextResponse.json({ ok: false, error: "No database configured" }, { status: 503 });
  }

  let body: IncomingReview;
  try {
    body = (await request.json()) as IncomingReview;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const comment = String(body.comment ?? "").trim();
  const ratingNum = typeof body.rating === "number" ? body.rating : parseInt(String(body.rating ?? "0"), 10);
  const rating = Number.isFinite(ratingNum) ? Math.min(5, Math.max(1, ratingNum)) : 0;
  if (!name || !comment || !rating) {
    return NextResponse.json({ ok: false, error: "Missing review fields" }, { status: 400 });
  }

  const current = normalizeAdminData((await getAdminData()) ?? defaultAdminData);
  const next = {
    ...current,
    reviews: [
      {
        id: `R${generateId().slice(0, 8).toUpperCase()}`,
        name,
        rating,
        comment,
        createdAt: new Date().toISOString().slice(0, 10),
        status: "pending" as const,
      },
      ...(current.reviews ?? []),
    ],
    notifications: [
      {
        id: `N${generateId().slice(0, 6).toUpperCase()}`,
        title: "New review",
        message: `${name} (${rating}/5)`,
        time: new Date().toISOString(),
        read: false,
        type: "system" as const,
        link: "/admin/reviews",
      },
      ...(current.notifications ?? []),
    ],
  };

  const ok = await setAdminData(next);
  if (!ok) return NextResponse.json({ ok: false, error: "Failed to save review" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

