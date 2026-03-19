"use client";

import { getSupabaseBrowser, hasSupabaseAuth } from "@/lib/supabase-browser";

export type OAuthStartResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "client_failed" | "oauth_error"; detail?: string };

/**
 * Starts Supabase OAuth (Google / Apple). Never uses placeholder users — real profile comes back on /auth/callback.
 * Uses skipBrowserRedirect + window.location so the redirect always happens reliably.
 */
export async function startSupabaseOAuthRedirect(
  provider: "google" | "apple",
  nextPath: string
): Promise<OAuthStartResult> {
  if (typeof window === "undefined") {
    return { ok: false, reason: "client_failed", detail: "No window" };
  }
  if (!hasSupabaseAuth()) {
    return { ok: false, reason: "not_configured" };
  }
  const supabase = getSupabaseBrowser();
  if (!supabase) {
    return { ok: false, reason: "client_failed", detail: "Could not create Supabase client" };
  }

  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    return { ok: false, reason: "oauth_error", detail: error.message };
  }
  if (!data?.url) {
    return { ok: false, reason: "oauth_error", detail: "No authorization URL from Supabase" };
  }

  window.location.assign(data.url);
  return { ok: true };
}
