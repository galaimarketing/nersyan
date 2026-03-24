import BookingsPageClient from "./BookingsPageClient";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await searchParams;
  return <BookingsPageClient />;
}
