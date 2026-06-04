"use client";

import { usePathname } from "next/navigation";

const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "966508060816").replace(/[^0-9]/g, "");
const PREFILL = "السلام عليكم، أرغب بالاستفسار عن الحجز في نرسيان طيبة";

/**
 * Floating WhatsApp contact button. Common conversion path for the Saudi
 * market. Hidden on admin / auth / payment / bookings screens.
 */
export function WhatsAppButton() {
  const pathname = usePathname() || "/";
  const hidden = ["/admin", "/auth", "/payment", "/my-bookings"].some((p) => pathname.startsWith(p));
  if (hidden) return null;

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PREFILL)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-5 end-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/50"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="currentColor" aria-hidden="true">
        <path d="M16.004 3C9.383 3 4 8.383 4 15.004c0 2.114.553 4.174 1.602 5.992L4 29l8.184-1.566a11.95 11.95 0 0 0 3.82.628h.001C22.621 28.062 28 22.68 28 16.06 28 9.44 22.621 3 16.004 3zm0 21.785h-.001a9.86 9.86 0 0 1-5.024-1.376l-.36-.214-4.857.93.972-4.735-.235-.374a9.78 9.78 0 0 1-1.5-5.211c0-5.43 4.42-9.85 9.853-9.85 2.632 0 5.104 1.026 6.965 2.888a9.78 9.78 0 0 1 2.884 6.969c0 5.43-4.42 9.85-9.85 9.85zm5.404-7.377c-.296-.148-1.751-.864-2.022-.963-.271-.099-.469-.148-.667.148-.197.296-.765.963-.938 1.16-.173.198-.346.222-.642.074-.296-.148-1.25-.461-2.38-1.469-.88-.785-1.474-1.754-1.647-2.05-.173-.296-.018-.456.13-.604.134-.133.296-.346.444-.519.148-.173.197-.296.296-.494.099-.198.05-.371-.025-.519-.074-.148-.667-1.607-.914-2.201-.241-.578-.486-.5-.667-.51l-.568-.01c-.198 0-.519.074-.79.371-.271.296-1.036 1.013-1.036 2.471 0 1.458 1.061 2.867 1.209 3.065.148.198 2.088 3.188 5.06 4.47.707.305 1.259.487 1.689.624.71.226 1.356.194 1.866.118.569-.085 1.751-.716 1.998-1.408.247-.692.247-1.285.173-1.408-.074-.124-.271-.198-.567-.346z" />
      </svg>
    </a>
  );
}
