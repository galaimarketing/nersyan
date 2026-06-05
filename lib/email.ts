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
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
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

function row(label: string, value: string): string {
  return `<tr><td style="padding:6px 0;color:#9a9189;font-size:13px;">${label}</td><td style="padding:6px 0;color:#2c2420;font-size:14px;font-weight:600;text-align:end;">${value || "—"}</td></tr>`;
}

function shell(inner: string): string {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f1ec;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ec;padding:24px 0;"><tr><td align="center">
  <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;">
    <tr><td style="background:#5b4636;padding:24px;text-align:center;">
      <div style="display:inline-block;width:44px;height:44px;line-height:44px;border-radius:50%;background:#fff;color:#5b4636;font-size:20px;font-weight:bold;">ن</div>
      <div style="color:#fff;font-size:17px;font-weight:bold;margin-top:8px;">نرسيان طيبة · Nersyan Taiba</div>
    </td></tr>
    ${inner}
    <tr><td style="background:#f4f1ec;padding:14px;text-align:center;font-size:11px;color:#9a9189;">© نرسيان طيبة · Nersyan Taiba — المدينة المنورة</td></tr>
  </table></td></tr></table></body></html>`;
}

/** Confirmation email to the guest after a successful (paid) booking. */
export function guestBookingConfirmedHtml(b: BookingEmailData): string {
  const details = `
    <table role="presentation" width="100%" style="margin-top:8px;">
      ${row("رقم الحجز · Booking ID", b.id)}
      ${row("الغرفة · Room", `${b.room ?? ""}${b.roomNumber ? ` #${b.roomNumber}` : ""}`)}
      ${row("الوصول · Check-in", b.checkIn ?? "")}
      ${row("المغادرة · Check-out", b.checkOut ?? "")}
      ${row("الضيوف · Guests", String(b.guests ?? ""))}
      ${row("المبلغ · Amount", b.amount != null ? `${b.amount} SAR` : "")}
    </table>`;
  const inner = `
    <tr><td dir="rtl" style="padding:24px 24px 4px;text-align:right;">
      <h1 style="margin:0 0 8px;font-size:20px;color:#2c2420;">تم تأكيد حجزك ✅</h1>
      <p style="margin:0;font-size:14px;color:#6b6258;line-height:1.8;">شكراً ${b.guestName ?? ""}، تم تأكيد حجزك ودفعك بنجاح. نتطلّع لاستضافتك في المدينة المنورة.</p>
    </td></tr>
    <tr><td style="padding:8px 24px 4px;">${details}</td></tr>
    <tr><td dir="ltr" style="padding:14px 24px 24px;text-align:left;border-top:1px solid #eee;">
      <h2 style="margin:14px 0 8px;font-size:17px;color:#2c2420;">Your booking is confirmed ✅</h2>
      <p style="margin:0;font-size:14px;color:#6b6258;line-height:1.6;">Thank you ${b.guestName ?? ""}, your booking and payment were successful. We look forward to hosting you in Madinah.</p>
    </td></tr>`;
  return shell(inner);
}

/** Notification to reception that a new booking arrived. */
export function receptionNewBookingHtml(b: BookingEmailData, kind: "paid" | "on_arrival"): string {
  const badge =
    kind === "paid"
      ? `<span style="background:#1f9d55;color:#fff;padding:3px 10px;border-radius:999px;font-size:12px;">مدفوع · PAID</span>`
      : `<span style="background:#c08a2d;color:#fff;padding:3px 10px;border-radius:999px;font-size:12px;">الدفع عند الوصول · PAY ON ARRIVAL</span>`;
  const details = `
    <table role="presentation" width="100%" style="margin-top:8px;">
      ${row("رقم الحجز · Booking ID", b.id)}
      ${row("الاسم · Guest", b.guestName ?? "")}
      ${row("البريد · Email", b.email ?? "")}
      ${row("الجوال · Phone", b.phone ?? "")}
      ${row("الغرفة · Room", `${b.room ?? ""}${b.roomNumber ? ` #${b.roomNumber}` : ""}`)}
      ${row("الوصول · Check-in", b.checkIn ?? "")}
      ${row("المغادرة · Check-out", b.checkOut ?? "")}
      ${row("الضيوف · Guests", String(b.guests ?? ""))}
      ${row("المبلغ · Amount", b.amount != null ? `${b.amount} SAR` : "")}
    </table>`;
  const inner = `
    <tr><td dir="rtl" style="padding:24px 24px 4px;text-align:right;">
      <div style="margin-bottom:10px;">${badge}</div>
      <h1 style="margin:0 0 8px;font-size:20px;color:#2c2420;">حجز جديد 🛎️</h1>
      <p style="margin:0;font-size:14px;color:#6b6258;line-height:1.8;">تم استلام حجز جديد. التفاصيل أدناه.</p>
    </td></tr>
    <tr><td style="padding:8px 24px 4px;">${details}</td></tr>
    <tr><td dir="ltr" style="padding:14px 24px 24px;text-align:left;border-top:1px solid #eee;">
      <h2 style="margin:14px 0 6px;font-size:17px;color:#2c2420;">New booking 🛎️</h2>
      <p style="margin:0;font-size:13px;color:#6b6258;">A new booking was received — details above.</p>
    </td></tr>`;
  return shell(inner);
}

/** Acknowledgement to the guest for a pay-on-arrival booking. */
export function guestBookingReceivedHtml(b: BookingEmailData): string {
  const inner = `
    <tr><td dir="rtl" style="padding:24px 24px 4px;text-align:right;">
      <h1 style="margin:0 0 8px;font-size:20px;color:#2c2420;">تم استلام حجزك 📝</h1>
      <p style="margin:0;font-size:14px;color:#6b6258;line-height:1.8;">شكراً ${b.guestName ?? ""}، تم استلام حجزك (الدفع عند الوصول). رقم الحجز: <b>${b.id}</b>.</p>
    </td></tr>
    <tr><td dir="ltr" style="padding:14px 24px 24px;text-align:left;border-top:1px solid #eee;">
      <h2 style="margin:14px 0 6px;font-size:17px;color:#2c2420;">Booking received 📝</h2>
      <p style="margin:0;font-size:14px;color:#6b6258;line-height:1.6;">Thank you ${b.guestName ?? ""}, your booking (pay on arrival) was received. Booking ID: <b>${b.id}</b>.</p>
    </td></tr>`;
  return shell(inner);
}
