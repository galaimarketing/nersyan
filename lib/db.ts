import { neon } from "@neondatabase/serverless";
import type { AdminData } from "@/lib/admin-store";
import { normalizeAdminData, reconcileRoomStatusesWithBookings } from "@/lib/admin-store";
import type { AppSettings } from "@/lib/settings-types";

const ADMIN_DATA_KEY = "admin_data";
const SETTINGS_KEY = "settings";

// Settings change rarely and are a pure read (used in layout metadata on every
// page) — safe to cache briefly. Admin data is NOT cached here: many routes do
// read-modify-write on it, and the admin dashboard needs immediate freshness, so
// caching it risked stale reads / lost updates. Public read scalability is
// handled by ISR on /api/rooms instead.
const SETTINGS_TTL_MS = 60_000;
let settingsCache: { data: AppSettings; exp: number } | null = null;

export function getConnectionString(): string | null {
  // Vercel injects POSTGRES_URL when you connect a Postgres store; also support DATABASE_URL
  return process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? null;
}

function getSql() {
  const connectionString = getConnectionString();
  if (!connectionString) return null;
  return neon(connectionString);
}

export async function getAdminData(): Promise<AdminData | null> {
  const sql = getSql();
  if (!sql) return null;
  try {
    const rows = await sql`SELECT value FROM app_data WHERE key = ${ADMIN_DATA_KEY} LIMIT 1`;
    const row = rows[0] as { value: AdminData } | undefined;
    if (!row?.value) return null;
    return row.value as AdminData;
  } catch {
    return null;
  }
}

export async function setAdminData(data: AdminData): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  const normalized = normalizeAdminData(data);
  const { next } = reconcileRoomStatusesWithBookings(normalized);
  try {
    await sql`
      INSERT INTO app_data (key, value) VALUES (${ADMIN_DATA_KEY}, ${JSON.stringify(next)}::jsonb)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
    return true;
  } catch {
    return false;
  }
}

export async function getSettings(): Promise<AppSettings | null> {
  if (settingsCache && settingsCache.exp > Date.now()) return settingsCache.data;
  const sql = getSql();
  if (!sql) return null;
  try {
    const rows = await sql`SELECT value FROM app_data WHERE key = ${SETTINGS_KEY} LIMIT 1`;
    const row = rows[0] as { value: AppSettings } | undefined;
    if (!row?.value) return null;
    settingsCache = { data: row.value as AppSettings, exp: Date.now() + SETTINGS_TTL_MS };
    return settingsCache.data;
  } catch {
    return null;
  }
}

export async function setSettings(settings: AppSettings): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  try {
    await sql`
      INSERT INTO app_data (key, value) VALUES (${SETTINGS_KEY}, ${JSON.stringify(settings)}::jsonb)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
    settingsCache = { data: settings, exp: Date.now() + SETTINGS_TTL_MS };
    return true;
  } catch {
    return false;
  }
}

export function hasDatabase(): boolean {
  return Boolean(getConnectionString());
}
