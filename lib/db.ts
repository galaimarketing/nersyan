import { neon } from "@neondatabase/serverless";
import type { AdminData } from "@/lib/admin-store";
import type { AppSettings } from "@/lib/settings-types";

const ADMIN_DATA_KEY = "admin_data";
const SETTINGS_KEY = "settings";

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
  try {
    await sql`
      INSERT INTO app_data (key, value) VALUES (${ADMIN_DATA_KEY}, ${JSON.stringify(data)}::jsonb)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
    return true;
  } catch {
    return false;
  }
}

export async function getSettings(): Promise<AppSettings | null> {
  const sql = getSql();
  if (!sql) return null;
  try {
    const rows = await sql`SELECT value FROM app_data WHERE key = ${SETTINGS_KEY} LIMIT 1`;
    const row = rows[0] as { value: AppSettings } | undefined;
    if (!row?.value) return null;
    return row.value as AppSettings;
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
    return true;
  } catch {
    return false;
  }
}

export function hasDatabase(): boolean {
  return Boolean(getConnectionString());
}
