import { NextResponse } from "next/server";
import { getAdminData } from "@/lib/db";
import { isRoomBooked } from "@/lib/admin-store";
import type { AdminData, AdminRoom } from "@/lib/admin-store";
import type { Room } from "@/lib/rooms-data";

export const dynamic = "force-dynamic";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='16' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3ERoom image%3C/text%3E%3C/svg%3E";

function mapAdminRoomToRoom(ar: AdminRoom, data: AdminData): Room {
  const descEn = `Comfortable ${ar.type} with essential amenities.`;
  const descAr = `غرفة مريحة من نوع ${ar.type} مع وسائل الراحة الأساسية.`;
  const images = (ar.images && ar.images.length > 0 ? ar.images : ar.image ? [ar.image] : []).filter(Boolean);
  const image = images[0] ?? PLACEHOLDER_IMAGE;
  const booked = isRoomBooked(data, ar);
  const available = ar.status === "available" && !booked;
  return {
    id: ar.id,
    nameAr: ar.type,
    nameEn: ar.type,
    descriptionAr: descAr,
    descriptionEn: descEn,
    price: ar.price,
    image,
    images: images.length > 0 ? images : [image],
    capacity: ar.capacity,
    size: 0,
    amenities: ["wifi", "ac", "parking"],
    available,
    roomsLeft: available ? 1 : 0,
  };
}

export async function GET() {
  const data = await getAdminData();
  if (!data) {
    return NextResponse.json([]);
  }
  const rooms = data.rooms.map((ar) => mapAdminRoomToRoom(ar, data));
  return NextResponse.json(rooms);
}
