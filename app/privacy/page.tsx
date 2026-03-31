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
                في <strong>نرسيان طيبة</strong> (nersyantaiba.com)، نحترم خصوصيتك ونتعامل مع بياناتك
                الشخصية بمسؤولية وشفافية. توضح هذه الصفحة كيف نجمع البيانات، ولماذا نستخدمها، وكيف نحميها.
              </p>
              <p>
                باستخدامك للموقع أو إرسال طلب حجز، فإنك توافق على الممارسات الموضحة في هذه السياسة.
              </p>
              <h2>ما البيانات التي نجمعها</h2>
              <ul>
                <li>التعريف والتواصل: الاسم، البريد الإلكتروني، رقم الهاتف.</li>
                <li>الحجز: تواريخ الإقامة، نوع الغرفة، عدد الضيوف، ملاحظات الطلب.</li>
                <li>الرسائل: أي معلومات ترسلها عبر نموذج "اتصل بنا".</li>
                <li>البيانات التقنية: نوع الجهاز والمتصفح لتحسين الأداء وتجربة الاستخدام.</li>
              </ul>
              <h2>كيف نستخدم البيانات</h2>
              <ul>
                <li>الحجوزات: تأكيد الحجوزات وإدارتها والتواصل معك بخصوصها.</li>
                <li>الدعم: تقديم خدمة العملاء والرد على الاستفسارات والشكاوى.</li>
                <li>التحسين: تطوير جودة الموقع والخدمات والعمليات الداخلية.</li>
                <li>الامتثال: الالتزام بالمتطلبات النظامية والتنظيمية داخل المملكة.</li>
              </ul>
              <h2>الدفع والمعاملات</h2>
              <p>
                تتم معالجة المدفوعات عبر وسائل دفع إلكترونية موثوقة. لا نقوم بتخزين بيانات البطاقة البنكية
                الكاملة على خوادم الموقع.
              </p>
              <h2>مشاركة البيانات مع أطراف أخرى</h2>
              <p>
                لا نبيع بياناتك الشخصية. قد نشارك الحد الأدنى اللازم من البيانات مع مزودي خدمات موثوقين
                (مثل مزود الاستضافة أو الدفع) فقط لتشغيل الخدمة وبما يتوافق مع هذه السياسة.
              </p>
              <h2>مدة الاحتفاظ بالبيانات</h2>
              <p>
                نحتفظ بالبيانات فقط للمدة اللازمة لتقديم الخدمة، أو للوفاء بالمتطلبات النظامية والمحاسبية،
                ثم يتم حذفها أو تقليلها وفق ما يلزم.
              </p>
              <h2>حماية البيانات</h2>
              <ul>
                <li>الإجراءات الأمنية: نطبق ضوابط تقنية وإدارية مناسبة لحماية البيانات.</li>
                <li>التحكم بالوصول: نقيّد الوصول للبيانات للجهات المخولة فقط.</li>
                <li>التحسين المستمر: لا يوجد أمان مطلق 100%، لكننا نعمل باستمرار على رفع مستوى الحماية.</li>
              </ul>
              <h2>حقوقك</h2>
              <ul>
                <li>الوصول والتعديل: يمكنك طلب الاطلاع على بياناتك أو تحديثها أو تصحيحها.</li>
                <li>الحذف: يمكنك طلب حذف بياناتك عندما لا يمنع ذلك التزام نظامي.</li>
                <li>الاستفسارات: يمكنك التواصل معنا لأي سؤال متعلق بالخصوصية أو الشكاوى.</li>
              </ul>
              <h2>التواصل</h2>
              <p>
                للاستفسارات المتعلقة بالخصوصية، يمكنك التواصل عبر:
                <br />
                البريد الإلكتروني:{" "}
                <a href="mailto:nersyantaiba@gmail.com" dir="ltr" className="inline-block text-left">
                  nersyantaiba@gmail.com
                </a>
                <br />
                الهاتف:{" "}
                <a href="tel:+966508060816" dir="ltr" className="inline-block text-left">
                  +966 50 806 0816
                </a>
              </p>
              <h2>تحديثات السياسة</h2>
              <p>
                قد نقوم بتحديث هذه السياسة عند الحاجة. يتم نشر أي تعديل في هذه الصفحة ويُعمل به من تاريخ
                النشر.
              </p>
            </>
          ) : (
            <>
              <p>
                At <strong>Nersyan Taiba</strong> (nersyantaiba.com), we respect your privacy and
                handle personal data with transparency and care. This policy explains what data we
                collect, why we collect it, and how we protect it.
              </p>
              <p>
                By using our website or submitting a booking request, you agree to the practices
                described in this policy.
              </p>
              <h2>What We Collect</h2>
              <ul>
                <li>Identity and Contact: name, email address, and phone number.</li>
                <li>Booking Information: stay dates, room type, guest count, and booking notes.</li>
                <li>Messages: information you submit through the contact form.</li>
                <li>Technical Data: device/browser information to improve performance and usability.</li>
              </ul>
              <h2>How We Use Data</h2>
              <ul>
                <li>Bookings: to confirm and manage bookings, and communicate about your stay.</li>
                <li>Support: to respond to inquiries, requests, and complaints.</li>
                <li>Service Improvement: to improve website quality and operations.</li>
                <li>Compliance: to meet legal and regulatory requirements in Saudi Arabia.</li>
              </ul>
              <h2>Payments</h2>
              <p>
                Payments are processed through trusted electronic payment channels. We do not store
                full bank card details on our website servers.
              </p>
              <h2>Data Sharing</h2>
              <p>
                We do not sell personal data. We may share only the minimum necessary data with
                trusted service providers (such as hosting or payment providers) solely to operate
                our services and in line with this policy.
              </p>
              <h2>Data Retention</h2>
              <p>
                We retain personal data only as long as needed to deliver services or meet legal,
                accounting, and regulatory obligations, then delete or minimize it when appropriate.
              </p>
              <h2>Data Protection</h2>
              <ul>
                <li>Safeguards: we apply reasonable technical and organizational protections.</li>
                <li>Access Control: personal data is limited to authorized personnel only.</li>
                <li>
                  Continuous Improvement: no online system is 100% secure, but we continuously
                  improve our security measures.
                </li>
              </ul>
              <h2>Your Rights</h2>
              <ul>
                <li>Access and Correction: request access to, correction of, or updates to your data.</li>
                <li>Deletion: request deletion where no legal obligation prevents it.</li>
                <li>Questions and Complaints: contact us for any privacy-related request.</li>
              </ul>
              <h2>Contact Us</h2>
              <p>
                For privacy-related requests, contact us at:
                <br />
                Email:{" "}
                <a href="mailto:nersyantaiba@gmail.com" dir="ltr" className="inline-block text-left">
                  nersyantaiba@gmail.com
                </a>
                <br />
                Phone:{" "}
                <a href="tel:+966508060816" dir="ltr" className="inline-block text-left">
                  +966 50 806 0816
                </a>
              </p>
              <h2>Policy Updates</h2>
              <p>
                We may update this Privacy Policy when needed. Any updates will be posted on this
                page and will take effect from the date of publication.
              </p>
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
