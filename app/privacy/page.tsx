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
            <>
              <p>
                نحن في نرسيان طيبة نحترم خصوصيتك، ونلتزم بحماية بياناتك الشخصية واستخدامها فقط لتقديم
                الخدمة، إدارة الحجوزات، وتحسين تجربة العميل.
              </p>
              <h2>الالتزام النظامي والموثوقية</h2>
              <p>
                تأكيدًا على حماية المستهلك وتعزيز الثقة في التجارة الإلكترونية، نوضح التزامنا بالامتثال
                للمتطلبات النظامية ذات العلاقة، بما يشمل ممارسات الموثوقية والشفافية وحقوق المستهلك.
              </p>
              <p>
                كما نؤكد أهمية امتلاك الممارسين للتجارة الإلكترونية لسجل تجاري ساري لضمان ممارسة النشاط
                بشكل نظامي، ويمكن إصدار السجل التجاري إلكترونيًا عبر بوابة وزارة التجارة:
                {" "}
                <a href="https://e.mc.gov.sa" target="_blank" rel="noreferrer">
                  e.mc.gov.sa
                </a>
                .
              </p>
              <h2>معايير الموثوقية وحقوق المستهلك</h2>
              <p>
                نلتزم بتطبيق معايير الموثوقية في التجارة الإلكترونية، ومن ذلك:
              </p>
              <ul>
                <li>توفير رقم هاتف للتواصل.</li>
                <li>توفير بريد إلكتروني للتواصل.</li>
                <li>توفير وسيلة محادثة فورية.</li>
                <li>توفير دفع إلكتروني موثوق عبر القنوات البنكية المعتمدة.</li>
                <li>تمكين المستهلك من تقديم شكوى عبر الموقع الإلكتروني.</li>
                <li>تمكين تقديم الشكاوى عبر وسائل التواصل الاجتماعي.</li>
                <li>الإفصاح عن الوقت المحدد للرد على الشكاوى.</li>
                <li>الإفصاح عن الوقت المحدد لمعالجة الشكاوى.</li>
                <li>
                  الإفصاح عن الوقت المتوقع للتوصيل قبل إتمام الشراء، مع توضيح ذلك في الفاتورة عند
                  الاقتضاء.
                </li>
                <li>دعم اللغة العربية في آلية تقديم الشكاوى.</li>
                <li>استخدام اللغة العربية في قنوات المحادثة الفورية.</li>
                <li>عرض الخدمات والمنتجات باللغة العربية.</li>
                <li>وجود سياسة واضحة ومكتوبة للاستبدال أو الاسترجاع عند انطباقها على الخدمة.</li>
              </ul>
              <h2>استخدام البيانات</h2>
              <ul>
                <li>نستخدم بياناتك فقط لإتمام الحجز، التواصل، وتقديم الدعم.</li>
                <li>لا نبيع بياناتك الشخصية لأي طرف ثالث.</li>
                <li>نطبق ضوابط مناسبة لحماية البيانات من الاستخدام غير المصرح به.</li>
              </ul>
            </>
          ) : (
            <>
              <p>
                At Nersian Taiba, we respect your privacy and use personal data only to provide
                services, manage bookings, and improve customer experience.
              </p>
              <h2>Regulatory Commitment and Trust</h2>
              <p>
                To protect consumers and improve trust in e-commerce, we are committed to legal
                compliance, transparency, and consumer rights principles.
              </p>
              <p>
                We also highlight the importance of a valid commercial registration for e-commerce
                activity. Commercial registration can be issued electronically through:
                {" "}
                <a href="https://e.mc.gov.sa" target="_blank" rel="noreferrer">
                  e.mc.gov.sa
                </a>
                .
              </p>
              <h2>Consumer Trust Standards</h2>
              <ul>
                <li>Clear phone and email contact channels.</li>
                <li>Live chat and reliable electronic payment channels.</li>
                <li>Complaint submission through website and social media.</li>
                <li>Published response and complaint-resolution timeframes.</li>
                <li>Clear disclosure of delivery/fulfillment timelines when applicable.</li>
                <li>Arabic language support for complaint handling and communications.</li>
                <li>Arabic product/service presentation and clear return/replacement policy.</li>
              </ul>
              <h2>Data Use</h2>
              <ul>
                <li>We use your data only for booking, communication, and support.</li>
                <li>We do not sell personal data to third parties.</li>
                <li>We apply appropriate safeguards against unauthorized access.</li>
              </ul>
            </>
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
