"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { I18nProvider, useI18n, LanguageToggle } from "@/lib/i18n";
import { getSupabaseBrowser, hasSupabaseAuth } from "@/lib/supabase-browser";

function SignInForm() {
  const { t, language, dir } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError(
        language === "ar"
          ? "يرجى إدخال البريد الإلكتروني وكلمة المرور."
          : "Please enter your email and password."
      );
      return;
    }

    setLoading(true);

    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "nersian-user",
          JSON.stringify({ email, rememberMe })
        );
      }

      if (typeof window !== "undefined") {
        window.alert(
          language === "ar"
            ? "تم تسجيل الدخول بنجاح."
            : "Signed in successfully."
        );
      }

      const next = searchParams.get("next") || "/";
      router.push(next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen" dir={dir}>
      {/* Left Side - Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <span className="text-lg font-bold text-primary-foreground">ن</span>
              </div>
              <span className="text-lg font-semibold text-foreground">
                {language === "ar" ? "نرسيان طيبة" : "Nersian Taiba"}
              </span>
            </Link>
            <LanguageToggle />
          </div>

          <Card className="w-full rounded-2xl border bg-background shadow-lg">
            <CardContent className="flex flex-col gap-6 p-6">
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-foreground">
                  {t("auth.signIn")}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {language === "ar"
                    ? "مرحباً بعودتك! سجل دخولك للمتابعة"
                    : "Welcome back! Sign in to continue"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Email */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <div className="flex items-center gap-2 rounded-lg border px-3 h-12 focus-within:ring-2 focus-within:ring-ring">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={language === "ar" ? "أدخل بريدك الإلكتروني" : "Enter your email"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-0 shadow-none focus-visible:ring-0"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  <div className="flex items-center gap-2 rounded-lg border px-3 h-12 focus-within:ring-2 focus-within:ring-ring">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={language === "ar" ? "أدخل كلمة المرور" : "Enter your password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-0 shadow-none focus-visible:ring-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember me & Forgot */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm font-normal">
                      {t("auth.rememberMe")}
                    </Label>
                  </div>
                  <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                    {t("auth.forgotPassword")}
                  </Link>
                </div>

                {error && (
                  <p className="text-sm font-medium text-destructive">
                    {error}
                  </p>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium rounded-lg"
                  disabled={loading}
                >
                  {loading
                    ? language === "ar"
                      ? "جاري تسجيل الدخول..."
                      : "Signing in..."
                    : t("auth.signIn")}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {language === "ar" ? "أو" : "or"}
                  </span>
                </div>
              </div>

              {/* Social login buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 rounded-lg flex items-center justify-center gap-3"
                  onClick={async () => {
                    const next = searchParams.get("next") || "/";
                    if (hasSupabaseAuth() && typeof window !== "undefined") {
                      const supabase = getSupabaseBrowser();
                      if (supabase) {
                        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
                        await supabase.auth.signInWithOAuth({
                          provider: "google",
                          options: { redirectTo },
                        });
                        return;
                      }
                    }
                    if (typeof window !== "undefined") {
                      window.localStorage.setItem(
                        "nersian-user",
                        JSON.stringify({ email: "google-user@example.com", provider: "google" })
                      );
                      window.alert(
                        language === "ar"
                          ? "تم تسجيل الدخول عبر Google (تجريبيًا). أضف NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY وفعّل Google في Supabase للمسار الكامل."
                          : "Signed in with Google (demo). Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY and enable Google in Supabase for full OAuth."
                      );
                      router.push(next);
                    }
                  }}
                >
                  <Image
                    src="https://www.svgrepo.com/show/355037/google.svg"
                    alt="Google"
                    width={20}
                    height={20}
                  />
                  {t("auth.continueGoogle")}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 rounded-lg flex items-center justify-center gap-3"
                  onClick={async () => {
                    const next = searchParams.get("next") || "/";
                    if (hasSupabaseAuth() && typeof window !== "undefined") {
                      const supabase = getSupabaseBrowser();
                      if (supabase) {
                        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
                        await supabase.auth.signInWithOAuth({
                          provider: "apple",
                          options: { redirectTo },
                        });
                        return;
                      }
                    }
                    if (typeof window !== "undefined") {
                      window.localStorage.setItem(
                        "nersian-user",
                        JSON.stringify({ email: "apple-user@example.com", provider: "apple" })
                      );
                      window.alert(
                        language === "ar"
                          ? "تم تسجيل الدخول عبر Apple (تجريبيًا). أضف مفاتيح Supabase وفعّل Apple للمسار الكامل."
                          : "Signed in with Apple (demo). Add Supabase keys and enable Apple for full OAuth."
                      );
                      router.push(next);
                    }
                  }}
                >
                  <Image
                    src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                    alt="Apple"
                    width={20}
                    height={20}
                    className="dark:invert"
                    unoptimized
                  />
                  {t("auth.continueApple")}
                </Button>
              </div>

              {/* Signup */}
              <p className="text-center text-sm text-muted-foreground">
                {t("auth.noAccount")}{" "}
                <Link href="/auth/signup" className="text-primary font-medium hover:underline">
                  {t("auth.signUp")}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Image (hidden on mobile) */}
      <div className="relative hidden lg:flex lg:flex-1">
        <Image
          src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1920&auto=format&fit=crop&q=80"
          alt="Madinah"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background/20" />
        <div className="absolute bottom-10 start-10 end-10 rounded-2xl bg-background/80 p-6 backdrop-blur-lg">
          <p className="text-lg font-medium text-foreground">
            {language === "ar"
              ? '"أفضل إقامة قضيتها بالقرب من الحرم النبوي. خدمة ممتازة وموقع رائع!"'
              : '"Best stay I had near the Prophet\'s Mosque. Excellent service and great location!"'}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {language === "ar" ? "- محمد أحمد، ضيف" : "- Mohammed Ahmed, Guest"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <I18nProvider>
      <SignInForm />
    </I18nProvider>
  );
}
