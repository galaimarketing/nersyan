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
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { I18nProvider, useI18n, LanguageToggle } from "@/lib/i18n";
import { getSupabaseBrowser, hasSupabaseAuth } from "@/lib/supabase-browser";

function SignUpForm() {
  const { t, language, dir } = useI18n();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !email || !password || !confirmPassword) {
      setError(
        language === "ar"
          ? "يرجى تعبئة جميع الحقول."
          : "Please fill in all fields."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        language === "ar"
          ? "كلمتا المرور غير متطابقتين."
          : "Passwords do not match."
      );
      return;
    }

    if (!agreeTerms) {
      setError(
        language === "ar"
          ? "يجب الموافقة على الشروط والأحكام."
          : "You must agree to the terms."
      );
      return;
    }

    setLoading(true);

    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "nersian-user",
          JSON.stringify({ fullName, email })
        );
      }

      if (typeof window !== "undefined") {
        window.alert(
          language === "ar"
            ? "تم إنشاء الحساب بنجاح."
            : "Account created successfully."
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
      {/* Left Side - Image (hidden on mobile) */}
      <div className="relative hidden lg:flex lg:flex-1">
        <Image
          src="https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1920&auto=format&fit=crop&q=80"
          alt="Madinah"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20" />
        <div className="absolute bottom-10 start-10 end-10 rounded-2xl bg-background/80 p-6 backdrop-blur-lg">
          <h2 className="text-xl font-semibold text-foreground">
            {language === "ar"
              ? "انضم إلى عائلة نرسيان طيبة"
              : "Join the Nersian Taiba Family"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {language === "ar"
              ? "احصل على عروض حصرية وخصومات خاصة للأعضاء"
              : "Get exclusive offers and special member discounts"}
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
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
            <CardContent className="flex flex-col gap-5 p-6">
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-foreground">
                  {t("auth.signUp")}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {language === "ar"
                    ? "أنشئ حسابك وابدأ رحلتك معنا"
                    : "Create your account and start your journey with us"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Full Name */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fullName">{t("auth.fullName")}</Label>
                  <div className="flex items-center gap-2 rounded-lg border px-3 h-12 focus-within:ring-2 focus-within:ring-ring">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder={language === "ar" ? "محمد أحمد" : "John Doe"}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="border-0 shadow-none focus-visible:ring-0"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <div className="flex items-center gap-2 rounded-lg border px-3 h-12 focus-within:ring-2 focus-within:ring-ring">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={language === "ar" ? "example@email.com" : "example@email.com"}
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

                {/* Confirm Password */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirmPassword">
                    {language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
                  </Label>
                  <div className="flex items-center gap-2 rounded-lg border px-3 h-12 focus-within:ring-2 focus-within:ring-ring">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder={language === "ar" ? "أعد إدخال كلمة المرور" : "Re-enter your password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="border-0 shadow-none focus-visible:ring-0"
                    />
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm font-normal leading-relaxed">
                    {language === "ar" ? (
                      <>
                        أوافق على{" "}
                        <Link href="/terms" className="text-primary hover:underline">
                          الشروط والأحكام
                        </Link>{" "}
                        و{" "}
                        <Link href="/privacy" className="text-primary hover:underline">
                          سياسة الخصوصية
                        </Link>
                      </>
                    ) : (
                      <>
                        I agree to the{" "}
                        <Link href="/terms" className="text-primary hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                      </>
                    )}
                  </Label>
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
                  disabled={!agreeTerms || loading}
                >
                  {loading
                    ? language === "ar"
                      ? "جاري إنشاء الحساب..."
                      : "Creating account..."
                    : t("auth.signUp")}
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
                        JSON.stringify({
                          fullName: language === "ar" ? "مستخدم Google" : "Google User",
                          email: "google-user@example.com",
                          provider: "google",
                        })
                      );
                      window.alert(
                        language === "ar"
                          ? "تم إنشاء الحساب عبر Google (تجريبيًا). أضف مفاتيح Supabase وفعّل Google للمسار الكامل."
                          : "Account created with Google (demo). Add Supabase keys and enable Google for full OAuth."
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
                        JSON.stringify({
                          fullName: language === "ar" ? "مستخدم Apple" : "Apple User",
                          email: "apple-user@example.com",
                          provider: "apple",
                        })
                      );
                      window.alert(
                        language === "ar"
                          ? "تم إنشاء الحساب عبر Apple (تجريبيًا). أضف مفاتيح Supabase وفعّل Apple للمسار الكامل."
                          : "Account created with Apple (demo). Add Supabase keys and enable Apple for full OAuth."
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

              {/* Login */}
              <p className="text-center text-sm text-muted-foreground">
                {t("auth.hasAccount")}{" "}
                <Link href="/auth/signin" className="text-primary font-medium hover:underline">
                  {t("auth.signIn")}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <I18nProvider>
      <SignUpForm />
    </I18nProvider>
  );
}
