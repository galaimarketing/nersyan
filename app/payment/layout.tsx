/** Avoid serving a stale cached shell for /payment (invoice flow must be current). */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
