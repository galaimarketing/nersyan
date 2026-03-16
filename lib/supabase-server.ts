import { createClient } from "@supabase/supabase-js";

function getEnv(key: string): string | undefined {
  const v = process.env[key];
  if (typeof v !== "string") return undefined;
  return v.trim().replace(/^["']|["']$/g, "").replace(/\r?\n/g, "");
}

const SUPABASE_URL = getEnv("SUPABASE_URL") ?? getEnv("NEXT_PUBLIC_SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");
const MEDIA_BUCKET = getEnv("SUPABASE_MEDIA_BUCKET") ?? "media";

export function getSupabaseStorageBucket(): string {
  return MEDIA_BUCKET;
}

export function hasSupabaseStorage(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

/** Server-only Supabase client with service role for Storage uploads. Returns null if env missing or key invalid. */
export function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  try {
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  } catch (e) {
    console.error("Supabase client init error:", e instanceof Error ? e.message : e);
    return null;
  }
}
