/**
 * Public site origin for redirects and payment provider callbacks (Moyasar success_url, callback_url, back_url).
 * Prefer NEXT_PUBLIC_SITE_URL so production URLs match your registered HTTPS domain; falls back to the request URL.
 * @see https://docs.moyasar.com/api/api-introduction/
 */
export function getPublicOrigin(req: Request): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    const normalized = raw.replace(/\/+$/, "");
    if (/^https?:\/\//i.test(normalized)) {
      try {
        return new URL(normalized).origin;
      } catch {
        /* fall through */
      }
    }
  }
  return new URL(req.url).origin;
}
