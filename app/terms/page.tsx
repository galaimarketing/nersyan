"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { ArrowLeft, ArrowRight } from "lucide-react";

function TermsContent() {
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
          {language === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}
        </h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground">
          {language === "ar" ? (
            <p>
              باستخدام خدمات نرسيان طيبة فإنك توافق على هذه الشروط. يرجى قراءة{" "}
              <Link href="/cancellation" className="text-primary hover:underline">
                سياسة الإلغاء
              </Link>{" "}
              فيما يتعلق بتعديل أو إلغاء الحجوزات.
            </p>
          ) : (
            <p>
              By using Nersian Taiba services you agree to these terms. Please refer to our
              {" "}
              <Link href="/cancellation" className="text-primary hover:underline">
                cancellation policy
              </Link>{" "}
              for modifications or cancellations of bookings.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function TermsPage() {
  return (
    <I18nProvider>
      <TermsContent />
    </I18nProvider>
  );
}
