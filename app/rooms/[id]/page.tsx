import type { Metadata } from "next";
import { getAdminData } from "@/lib/db";
import RoomDetailClient from "./RoomDetailClient";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.nersyantaiba.com").replace(/\/+$/, "");
const FALLBACK_OG = "/%D8%A7%D9%84%D9%85%D8%B3%D8%AC%D8%AF%20%D8%A7%D9%84%D9%86%D8%A8%D9%88%D9%8A.jpg";

async function findRoom(id: string) {
  try {
    const data = await getAdminData();
    return (data?.rooms ?? []).find((r) => r.id === id) ?? null;
  } catch {
    return null;
  }
}

function roomImage(room: { images?: string[]; image?: string } | null): string {
  const url = room?.images?.[0] || room?.image || "";
  if (url && /^https?:\/\//.test(url)) return url;
  return `${SITE_URL}${FALLBACK_OG}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id?: string }>;
}): Promise<Metadata> {
  const { id = "" } = await params;
  const room = await findRoom(id);
  if (!room) {
    return { title: "غرفة", description: "تفاصيل الغرفة في نرسيان طيبة بالمدينة المنورة." };
  }
  const title = `${room.type} قرب الحرم النبوي`;
  const description = `احجز ${room.type} في نرسيان طيبة بالمدينة المنورة قرب المسجد النبوي — ${room.price} ريال/الليلة. واي فاي مجاني وتكييف وموقف سيارات.`;
  const image = roomImage(room);
  const url = `${SITE_URL}/rooms/${room.id}`;
  return {
    title,
    description,
    alternates: { canonical: `/rooms/${room.id}` },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: room.type }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const { id = "" } = await params;
  const room = await findRoom(id);

  const jsonLd = room
    ? {
        "@context": "https://schema.org",
        "@type": "HotelRoom",
        name: room.type,
        url: `${SITE_URL}/rooms/${room.id}`,
        image: roomImage(room),
        occupancy: { "@type": "QuantitativeValue", maxValue: room.capacity },
        floorSize: room.size ? { "@type": "QuantitativeValue", value: room.size, unitCode: "MTK" } : undefined,
        offers: {
          "@type": "Offer",
          price: room.price,
          priceCurrency: "SAR",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/rooms/${room.id}`,
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <RoomDetailClient id={id} />
    </>
  );
}
