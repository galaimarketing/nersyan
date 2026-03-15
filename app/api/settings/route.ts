import { NextResponse } from "next/server";
import { getSettings, setSettings, hasDatabase } from "@/lib/db";
import { defaultAppSettings } from "@/lib/settings-types";
import type { AppSettings } from "@/lib/settings-types";

export const dynamic = "force-dynamic";

function mergeSettings(partial: Partial<AppSettings>): AppSettings {
  return { ...defaultAppSettings, ...partial };
}

export async function GET() {
  if (!hasDatabase()) {
    return NextResponse.json(defaultAppSettings);
  }
  const settings = await getSettings();
  if (settings === null) {
    return NextResponse.json(defaultAppSettings);
  }
  return NextResponse.json(mergeSettings(settings));
}

export async function PATCH(request: Request) {
  if (!hasDatabase()) {
    return NextResponse.json({ ok: false, error: "No database configured" }, { status: 503 });
  }
  let partial: Partial<AppSettings>;
  try {
    partial = (await request.json()) as Partial<AppSettings>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const current = await getSettings();
  const next = mergeSettings({ ...(current ?? {}), ...partial });
  const ok = await setSettings(next);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Failed to save" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, settings: next });
}
