"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { ArrowLeft, ArrowRight } from "lucide-react";

function CancellationContent() {
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
              العودة للرئيسية
            </>
          ) : (
            <>
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </>
          )}
        </Link>
        <h1 className="mb-6 text-3xl font-bold text-foreground">
          {language === "ar" ? "سياسة الإلغاء" : "Cancellation Policy"}
        </h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground">
          {language === "ar" ? (
            <p>
              يمكنك إلغاء الحجز مجاناً قبل 48 ساعة من موعد الوصول. بعد ذلك قد يتم تطبيق رسوم إلغاء.
              تواصل معنا لأي استفسار.
            </p>
          ) : (
            <p>
              You may cancel your booking free of charge up to 48 hours before check-in. After that
              a cancellation fee may apply. Contact us for any questions.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function CancellationPage() {
  return (
    <I18nProvider>
      <CancellationContent />
    </I18nProvider>
  );
}
