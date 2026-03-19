"use client";

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let browserClient: ReturnType<typeof createClient> | null = null;

/** Browser Supabase client for Auth (OAuth). Use only in client components. */
export function getSupabaseBrowser() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (browserClient) return browserClient;
  try {
    browserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, storageKey: "nersian-supabase-auth", storage: typeof window !== "undefined" ? window.localStorage : undefined },
    });
    return browserClient;
  } catch {
    return null;
  }
}

export function hasSupabaseAuth(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
