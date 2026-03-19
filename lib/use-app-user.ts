"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export const NERSIAN_USER_KEY = "nersian-user";
export const NERSIAN_AUTH_CHANGED_EVENT = "nersian-auth-changed";

export type AppUser = {
  email: string;
  fullName?: string;
  phone?: string;
  provider?: string;
};

export function dispatchNersianAuthChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NERSIAN_AUTH_CHANGED_EVENT));
  }
}

/** Old demo OAuth wrote these — remove so users aren’t stuck with a fake account. */
function clearLegacyOAuthDemoFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(NERSIAN_USER_KEY);
    if (!raw) return;
    const o = JSON.parse(raw) as { email?: string };
    const email = String(o.email ?? "").toLowerCase();
    if (email === "google-user@example.com" || email === "apple-user@example.com") {
      localStorage.removeItem(NERSIAN_USER_KEY);
    }
  } catch {
    // ignore
  }
}

function readStoredUser(): AppUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(NERSIAN_USER_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Record<string, unknown>;
    const email = typeof o.email === "string" ? o.email.trim() : "";
    if (!email) return null;
    return {
      email,
      fullName: typeof o.fullName === "string" && o.fullName.trim() ? o.fullName.trim() : undefined,
      phone: typeof o.phone === "string" && o.phone.trim() ? o.phone.trim() : undefined,
      provider: typeof o.provider === "string" && o.provider.trim() ? o.provider.trim() : undefined,
    };
  } catch {
    return null;
  }
}

function persistUserFromSession(user: User): void {
  const email = user.email ?? "";
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    (user.user_metadata?.user_name as string | undefined) ??
    "";
  const phone =
    (user.user_metadata?.phone as string | undefined) ?? (user.phone as string | undefined) ?? "";
  const provider = (user.app_metadata?.provider as string | undefined) ?? "";
  localStorage.setItem(NERSIAN_USER_KEY, JSON.stringify({ email, fullName, phone, provider }));
}

function sessionToAppUser(u: User): AppUser {
  return {
    email: u.email ?? "",
    fullName:
      (u.user_metadata?.full_name as string | undefined) ??
      (u.user_metadata?.name as string | undefined) ??
      (u.user_metadata?.user_name as string | undefined) ??
      undefined,
    phone:
      (u.user_metadata?.phone as string | undefined) ?? (u.phone as string | undefined) ?? undefined,
    provider: (u.app_metadata?.provider as string | undefined) ?? undefined,
  };
}

/**
 * Signed-in user from Supabase session (preferred) or `nersian-user` localStorage (demo / email form).
 */
export function useAppUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const applyStoredFallback = useCallback(() => {
    setUser(readStoredUser());
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowser();

    async function init() {
      clearLegacyOAuthDemoFromStorage();
      if (supabase) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          persistUserFromSession(session.user);
          const next = sessionToAppUser(session.user);
          setUser(next.email ? next : null);
          setLoading(false);
          return;
        }
      }
      applyStoredFallback();
      setLoading(false);
    }

    void init();

    const onExternalAuthChange = () => {
      void init();
    };
    window.addEventListener(NERSIAN_AUTH_CHANGED_EVENT, onExternalAuthChange);
    window.addEventListener("storage", onExternalAuthChange);

    let subscription: { unsubscribe: () => void } | null = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          persistUserFromSession(session.user);
          const next = sessionToAppUser(session.user);
          setUser(next.email ? next : null);
          return;
        }
        if (event === "SIGNED_OUT") {
          localStorage.removeItem(NERSIAN_USER_KEY);
          setUser(null);
        }
      });
      subscription = data.subscription;
    }

    return () => {
      window.removeEventListener(NERSIAN_AUTH_CHANGED_EVENT, onExternalAuthChange);
      window.removeEventListener("storage", onExternalAuthChange);
      subscription?.unsubscribe();
    };
  }, [applyStoredFallback]);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem(NERSIAN_USER_KEY);
    setUser(null);
    dispatchNersianAuthChanged();
  }, []);

  return { user, loading, signOut };
}
