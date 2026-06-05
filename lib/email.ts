/**
 * Server-side transactional email via Resend's HTTP API.
 * Best-effort: never throws — email failures must not break booking flows.
 */

function getEnv(key: string): string | undefined {
  const v = process.env[key];
  if (typeof v !== "string") return undefined;
  return v.trim().replace(/^["']|["']$/g, "").replace(/\r?\n/g, "");
}

const FROM = getEnv("EMAIL_FROM") || "Nersyan Taiba <noreply@nersyantaiba.com>";
const RECEPTION_EMAIL = getEnv("RECEPTION_EMAIL") || "nt2030n@gmail.com";
const SITE_URL = (getEnv("NEXT_PUBLIC_SITE_URL") || "https://www.nersyantaiba.com").replace(/\/+$/, "");
const WHATSAPP = (getEnv("NEXT_PUBLIC_WHATSAPP_NUMBER") || "966508060816").replace(/[^0-9]/g, "");

// Brand palette
const BROWN = "#5b4636";
const BROWN_DARK = "#4a3829";
const GOLD = "#c8a96a";
const CREAM = "#f4f1ec";
const INK = "#2c2420";
const MUTED = "#8a8178";

export function getReceptionEmail(): string {
  return RECEPTION_EMAIL;
}

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<boolean> {
  const apiKey = getEnv("RESEND_API_KEY");
  if (!apiKey) return false;
  const to = Array.isArray(opts.to) ? opts.to : [opts.to];
  if (to.length === 0 || !to[0]) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to,
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export type BookingEmailData = {
  id: string;
  guestName?: string;
  email?: string;
  phone?: string;
  room?: string;
  roomNumber?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  amount?: number;
  paymentStatus?: string;
};

function detailsTable(rows: Array<[string, string]>): string {
  const body = rows
    .map(
      ([label, value], i) => `
      <tr style="background:${i % 2 ? "#faf8f4" : "#ffffff"};">
        <td style="padding:11px 16px;color:${MUTED};font-size:12px;border-bottom:1px solid #efe9e0;white-space:nowrap;">${label}</td>
        <td style="padding:11px 16px;color:${INK};font-size:14px;font-weight:600;border-bottom:1px solid #efe9e0;text-align:end;">${value || "—"}</td>
      </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #efe9e0;border-radius:12px;overflow:hidden;margin:6px 0 4px;">${body}</table>`;
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px auto;"><tr><td style="border-radius:10px;background:${BROWN};">
    <a href="${href}" style="display:inline-block;padding:14px 38px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;border-radius:10px;">${label}</a>
  </td></tr></table>`;
}

function shell(opts: { preheader: string; badge?: string; inner: string }): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${CREAM};font-family:'Segoe UI',Tahoma,Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 4px 24px rgba(74,56,41,0.10);">

        <!-- Header -->
        <tr><td style="background:${BROWN};background-image:linear-gradient(135deg,${BROWN},${BROWN_DARK});padding:30px 24px 26px;text-align:center;">
          <img src="${SITE_URL}/logo-email.png" width="60" height="60" alt="نرسيان طيبة" style="display:inline-block;width:60px;height:60px;border:0;outline:none;" />
          <div style="color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:.3px;margin-top:12px;">نرسيان طيبة</div>
          <div style="color:${GOLD};font-size:12px;font-weight:600;letter-spacing:1px;margin-top:2px;">NERSYAN TAIBA · المدينة المنورة</div>
          ${opts.badge ? `<div style="margin-top:14px;">${opts.badge}</div>` : ""}
        </td></tr>
        <tr><td style="height:4px;background:${GOLD};"></td></tr>

        <!-- Content -->
        <tr><td style="padding:26px 26px 8px;">${opts.inner}</td></tr>

        <!-- Footer -->
        <tr><td style="background:${CREAM};padding:20px 24px;text-align:center;border-top:1px solid #ece5da;">
          <div style="font-size:12px;color:${INK};font-weight:600;margin-bottom:6px;">نرسيان طيبة · Nersyan Taiba</div>
          <div style="font-size:11px;color:${MUTED};line-height:1.8;">
            المدينة المنورة، المملكة العربية السعودية<br>
            <a href="https://wa.me/${WHATSAPP}" style="color:${BROWN};text-decoration:none;">واتساب · WhatsApp</a> &nbsp;·&nbsp;
            <a href="${SITE_URL}" style="color:${BROWN};text-decoration:none;">nersyantaiba.com</a>
          </div>
          <div style="font-size:10px;color:${MUTED};margin-top:10px;">© ${new Date().getFullYear()} نرسيان طيبة</div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

function badge(text: string, bg: string): string {
  return `<span style="display:inline-block;background:${bg};color:#ffffff;padding:5px 14px;border-radius:999px;font-size:12px;font-weight:bold;">${text}</span>`;
}

/** Confirmation email to the guest after a successful (paid) booking. */
export function guestBookingConfirmedHtml(b: BookingEmailData): string {
  const rows: Array<[string, string]> = [
    ["رقم الحجز · Booking ID", b.id],
    ["الغرفة · Room", `${b.room ?? ""}${b.roomNumber ? ` #${b.roomNumber}` : ""}`],
    ["الوصول · Check-in", b.checkIn ?? ""],
    ["المغادرة · Check-out", b.checkOut ?? ""],
    ["الضيوف · Guests", String(b.guests ?? "")],
    ["المبلغ المدفوع · Amount paid", b.amount != null ? `${b.amount} SAR` : ""],
  ];
  const inner = `
    <div dir="rtl" style="text-align:right;">
      <h1 style="margin:0 0 8px;font-size:21px;color:${INK};">تم تأكيد حجزك 🎉</h1>
      <p style="margin:0 0 14px;font-size:14px;color:#6b6258;line-height:1.9;">شكراً ${b.guestName ?? ""}، تم استلام دفعتك وتأكيد حجزك بنجاح. نتطلّع لاستضافتك في المدينة المنورة.</p>
    </div>
    ${detailsTable(rows)}
    ${button(`${SITE_URL}/my-bookings`, "عرض حجوزاتي · View my bookings")}
    <div dir="ltr" style="text-align:left;border-top:1px solid #efe9e0;margin-top:14px;padding-top:14px;">
      <h2 style="margin:0 0 6px;font-size:17px;color:${INK};">Your booking is confirmed 🎉</h2>
      <p style="margin:0;font-size:13px;color:#6b6258;line-height:1.7;">Thank you ${b.guestName ?? ""}, your payment was received and your booking is confirmed. We look forward to hosting you in Madinah.</p>
    </div>`;
  return shell({
    preheader: `تم تأكيد حجزك ${b.id} · Booking confirmed`,
    badge: badge("مدفوع · CONFIRMED", "#1f9d55"),
    inner,
  });
}

/** Acknowledgement to the guest for a pay-on-arrival booking. */
export function guestBookingReceivedHtml(b: BookingEmailData): string {
  const rows: Array<[string, string]> = [
    ["رقم الحجز · Booking ID", b.id],
    ["الغرفة · Room", `${b.room ?? ""}${b.roomNumber ? ` #${b.roomNumber}` : ""}`],
    ["الوصول · Check-in", b.checkIn ?? ""],
    ["المغادرة · Check-out", b.checkOut ?? ""],
    ["الضيوف · Guests", String(b.guests ?? "")],
    ["المبلغ · Amount", b.amount != null ? `${b.amount} SAR` : ""],
  ];
  const inner = `
    <div dir="rtl" style="text-align:right;">
      <h1 style="margin:0 0 8px;font-size:21px;color:${INK};">تم استلام حجزك 📝</h1>
      <p style="margin:0 0 14px;font-size:14px;color:#6b6258;line-height:1.9;">شكراً ${b.guestName ?? ""}، تم استلام حجزك (الدفع عند الوصول). سيتم تأكيده من قبل الاستقبال.</p>
    </div>
    ${detailsTable(rows)}
    ${button(`${SITE_URL}/my-bookings`, "عرض حجوزاتي · View my bookings")}
    <div dir="ltr" style="text-align:left;border-top:1px solid #efe9e0;margin-top:14px;padding-top:14px;">
      <h2 style="margin:0 0 6px;font-size:17px;color:${INK};">Booking received 📝</h2>
      <p style="margin:0;font-size:13px;color:#6b6258;line-height:1.7;">Thank you ${b.guestName ?? ""}, your booking (pay on arrival) was received and will be confirmed by reception.</p>
    </div>`;
  return shell({
    preheader: `تم استلام حجزك ${b.id} · Booking received`,
    badge: badge("الدفع عند الوصول · PAY ON ARRIVAL", "#c08a2d"),
    inner,
  });
}

/** Checkout-day email to the guest: warm goodbye + review CTA. */
export function guestCheckoutHtml(b: BookingEmailData): string {
  const reviewUrl = `${SITE_URL}/#reviews`;
  const inner = `
    <div dir="rtl" style="text-align:right;">
      <h1 style="margin:0 0 8px;font-size:21px;color:${INK};">نتمنّى لك سفراً آمناً 🤍</h1>
      <p style="margin:0 0 12px;font-size:14px;color:#6b6258;line-height:1.9;">
        عزيزنا ${b.guestName ?? "ضيفنا الكريم"}، نشكرك على إقامتك في <b>نرسيان طيبة</b>.
        نذكّرك بأن موعد المغادرة اليوم الساعة <b>4:00 مساءً</b>. سعدنا كثيراً باستضافتك،
        ونتطلّع لرؤيتك مرة أخرى قريباً في المدينة المنورة.
      </p>
      <p style="margin:0 0 6px;font-size:14px;color:#6b6258;line-height:1.9;">
        قبل مغادرتك، يسعدنا أن تشاركنا رأيك بتقييم بسيط — رأيك يهمّنا ويساعد ضيوفنا القادمين. 🌟
      </p>
    </div>
    ${button(reviewUrl, "أضف تقييمك · Leave a review")}
    <div dir="ltr" style="text-align:left;border-top:1px solid #efe9e0;margin-top:14px;padding-top:14px;">
      <h2 style="margin:0 0 6px;font-size:17px;color:${INK};">Safe travels 🤍</h2>
      <p style="margin:0 0 8px;font-size:13px;color:#6b6258;line-height:1.7;">
        Dear ${b.guestName ?? "guest"}, thank you for staying with <b>Nersyan Taiba</b>.
        A gentle reminder that check-out is today at <b>4:00 PM</b>. It was a pleasure hosting you,
        and we hope to welcome you back to Madinah soon.
      </p>
      <p style="margin:0;font-size:13px;color:#6b6258;line-height:1.7;">
        Before you go, we'd love a quick review — it means a lot and helps future guests. 🌟
      </p>
    </div>`;
  return shell({
    preheader: "نتمنّى لك سفراً آمناً ونسعد بتقييمك · Safe travels — we'd love your review",
    badge: badge("موعد المغادرة اليوم · CHECK-OUT TODAY", GOLD),
    inner,
  });
}

/** Notification to reception that a new booking arrived. */
export function receptionNewBookingHtml(b: BookingEmailData, kind: "paid" | "on_arrival"): string {
  const rows: Array<[string, string]> = [
    ["رقم الحجز · Booking ID", b.id],
    ["الاسم · Guest", b.guestName ?? ""],
    ["البريد · Email", b.email ?? ""],
    ["الجوال · Phone", b.phone ?? ""],
    ["الغرفة · Room", `${b.room ?? ""}${b.roomNumber ? ` #${b.roomNumber}` : ""}`],
    ["الوصول · Check-in", b.checkIn ?? ""],
    ["المغادرة · Check-out", b.checkOut ?? ""],
    ["الضيوف · Guests", String(b.guests ?? "")],
    ["المبلغ · Amount", b.amount != null ? `${b.amount} SAR` : ""],
  ];
  const inner = `
    <div dir="rtl" style="text-align:right;">
      <h1 style="margin:0 0 8px;font-size:21px;color:${INK};">حجز جديد 🛎️</h1>
      <p style="margin:0 0 14px;font-size:14px;color:#6b6258;line-height:1.9;">تم استلام حجز جديد عبر الموقع. التفاصيل أدناه.</p>
    </div>
    ${detailsTable(rows)}
    ${button(`${SITE_URL}/admin/bookings`, "فتح لوحة الحجوزات · Open bookings")}
    <div dir="ltr" style="text-align:left;border-top:1px solid #efe9e0;margin-top:14px;padding-top:14px;">
      <h2 style="margin:0 0 4px;font-size:16px;color:${INK};">New booking 🛎️</h2>
      <p style="margin:0;font-size:13px;color:#6b6258;">A new booking was received — details above.</p>
    </div>`;
  return shell({
    preheader: `حجز جديد ${b.id} · New booking`,
    badge:
      kind === "paid"
        ? badge("مدفوع · PAID", "#1f9d55")
        : badge("الدفع عند الوصول · PAY ON ARRIVAL", "#c08a2d"),
    inner,
  });
}
