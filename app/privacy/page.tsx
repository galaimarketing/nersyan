"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { ArrowLeft, ArrowRight } from "lucide-react";

function PrivacyContent() {
  const { language, dir } = useI18n();
  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />
      <main className="mx-auto max-w-3xl px-6 pb-20 pt-32">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          {language === "ar" ? (
            <>
              <ArrowRight className="h-4 w-4" />
              {language === "ar" ? "العودة للرئيسية" : "Back to Home"}
            </>
          ) : (
            <>
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </>
          )}
        </Link>
        <h1 className="mb-6 text-3xl font-bold text-foreground">
          {language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
        </h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground">
          {language === "ar" ? (
            <p>
              نحن في نرسيان طيبة نحترم خصوصيتك. لا نشارك بياناتك الشخصية مع أطراف ثالثة دون موافقتك.
              نستخدم معلوماتك فقط لإدارة الحجوزات وتحسين خدمتك.
            </p>
          ) : (
            <p>
              At Nersian Taiba we respect your privacy. We do not share your personal data with third
              parties without your consent. We use your information only to manage bookings and
              improve your experience.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <I18nProvider>
      <PrivacyContent />
    </I18nProvider>
  );
}
