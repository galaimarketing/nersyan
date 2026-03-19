"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

const NERSIAN_USER_KEY = "nersian-user";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    const next = searchParams.get("next") || "/";

    async function handleCallback() {
      const supabase = getSupabaseBrowser();
      if (!supabase) {
        setStatus("error");
        setTimeout(() => router.replace("/auth/signin"), 2000);
        return;
      }

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        setStatus("error");
        setTimeout(() => router.replace("/auth/signin?next=" + encodeURIComponent(next)), 2000);
        return;
      }

      if (session?.user) {
        const email = session.user.email ?? "";
        const fullName =
          session.user.user_metadata?.full_name ??
          session.user.user_metadata?.name ??
          session.user.user_metadata?.user_name ??
          "";
        const phone = session.user.user_metadata?.phone ?? session.user.phone ?? "";
        const provider = session.user.app_metadata?.provider ?? "";
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            NERSIAN_USER_KEY,
            JSON.stringify({ email, fullName, phone, provider })
          );
        }
        setStatus("ok");
        router.replace(next);
      } else {
        setStatus("error");
        setTimeout(() => router.replace("/auth/signin?next=" + encodeURIComponent(next)), 2000);
      }
    }

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground">
        {status === "loading"
          ? "جاري تسجيل الدخول… / Signing you in…"
          : status === "error"
            ? "حدث خطأ. إعادة التوجيه… / Something went wrong. Redirecting…"
            : "تم. إعادة التوجيه… / Done. Redirecting…"}
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-muted-foreground">جاري التحميل… / Loading…</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
