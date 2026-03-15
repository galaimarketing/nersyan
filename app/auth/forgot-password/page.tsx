"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { I18nProvider, useI18n, LanguageToggle } from "@/lib/i18n";

function ForgotPasswordForm() {
  const { t, language, dir } = useI18n();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4" dir={dir}>
      <div className="w-full max-w-md">
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
        <Card>
          <CardContent className="p-6">
            <h1 className="mb-2 text-center text-2xl font-semibold text-foreground">
              {language === "ar" ? "استعادة كلمة المرور" : "Forgot Password"}
            </h1>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              {language === "ar"
                ? "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين."
                : "Enter your email and we'll send you a reset link."}
            </p>
            {sent ? (
              <div className="rounded-lg bg-primary/10 p-4 text-center text-sm text-foreground">
                {language === "ar"
                  ? "تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني."
                  : "Reset link has been sent to your email."}
                <Link href="/auth/signin" className="mt-4 block text-primary hover:underline">
                  {language === "ar" ? "العودة لتسجيل الدخول" : "Back to Sign In"}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <div className="flex items-center gap-2 rounded-lg border px-3 h-12 focus-within:ring-2 focus-within:ring-ring">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-0 shadow-none focus-visible:ring-0"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? language === "ar"
                      ? "جاري الإرسال..."
                      : "Sending..."
                    : language === "ar"
                    ? "إرسال رابط الاستعادة"
                    : "Send Reset Link"}
                </Button>
              </form>
            )}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link href="/auth/signin" className="text-primary hover:underline">
                {t("auth.signIn")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <I18nProvider>
      <ForgotPasswordForm />
    </I18nProvider>
  );
}
