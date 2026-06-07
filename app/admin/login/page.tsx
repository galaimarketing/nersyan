"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";

const MADINAH_IMG = "/%D8%A7%D9%84%D9%85%D8%B3%D8%AC%D8%AF%20%D8%A7%D9%84%D9%86%D8%A8%D9%88%D9%8A.jpg";

export default function AdminLoginPage() {
  const { t, dir, language } = useI18n();
  const ar = language === "ar";
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("admin-auth");
        }
        router.push("/admin");
        router.refresh();
        return;
      }

      setError(t("admin.incorrectCredentials"));
    } catch {
      setError(t("admin.incorrectCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen min-h-dvh bg-[#f4f1ec]" dir={dir}>
      {/* Brand / image panel */}
      <div className="relative hidden w-1/2 lg:block">
        <img src={MADINAH_IMG} alt="المسجد النبوي" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3d2f24]/95 via-[#3d2f24]/45 to-[#3d2f24]/20" />
        <div className="absolute inset-0 flex flex-col justify-between p-10 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <img src="/logo-email.png" alt="" className="h-7 w-7" />
            </span>
            <span className="text-lg font-bold">نرسيان طيبة</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold leading-snug">
              {ar ? "لوحة إدارة نرسيان طيبة" : "Nersyan Taiba Admin"}
            </h2>
            <p className="mt-2 max-w-sm text-sm text-white/85">
              {ar
                ? "إدارة الغرف والحجوزات والضيوف لإقامة فاخرة قرب المسجد النبوي."
                : "Manage rooms, bookings, and guests for luxury stays near Al-Masjid an-Nabawi."}
            </p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          {/* Mobile brand mark */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--ring)]">
              <img src="/logo-email.png" alt="" className="h-7 w-7" />
            </span>
            <span className="text-lg font-bold text-[#2c2420]">نرسيان طيبة</span>
          </div>

          <div className="rounded-2xl border border-[#ece5da] bg-white p-8 shadow-xl">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-[#2c2420]">{t("admin.loginTitle")}</h1>
              <p className="mt-2 text-sm text-[#6b6258]">{t("admin.signInToAccess")}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username">{t("admin.email")}</Label>
                <div className="flex h-12 items-center gap-2 rounded-lg border border-input px-3 transition-colors focus-within:border-[var(--ring)] focus-within:ring-2 focus-within:ring-[var(--ring)]/20">
                  <Mail className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <Input
                    id="username"
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin@nersyantaiba.com"
                    autoComplete="username"
                    required
                    className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("admin.password")}</Label>
                <div className="flex h-12 items-center gap-2 rounded-lg border border-input px-3 transition-colors focus-within:border-[var(--ring)] focus-within:ring-2 focus-within:ring-[var(--ring)]/20">
                  <Lock className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="flex-shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="h-12 w-full text-base font-semibold shadow-md transition-all hover:shadow-lg"
                disabled={loading}
              >
                {loading ? t("admin.loggingIn") : t("admin.loginButton")}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#8a8178]">
              <ShieldCheck className="h-4 w-4 text-[#1f9d55]" />
              <span>{ar ? "دخول آمن للوحة التحكم" : "Secure admin access"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
