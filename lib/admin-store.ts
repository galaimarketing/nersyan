export type BookingStatus = "pending" | "confirmed" | "cancelled" | "checked-in" | "checked-out";
export type PaymentStatus = "pending" | "paid" | "refunded";

export interface AdminBooking {
  id: string;
  guestId: string;
  guestName: string;
  email: string;
  phone: string;
  room: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  status: BookingStatus;
  amount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface AdminGuest {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface AdminRoom {
  id: string;
  number: string;
  type: string;
  price: number;
  /** Optional original price before discount; if present and > price, treated as discounted. */
  originalPrice?: number;
  capacity: number;
  /** Room size in square meters. */
  size?: number;
  status: "available" | "occupied" | "maintenance";
  image: string;
  images?: string[];
  /** Optional SEO title and description for room detail page. */
  seoTitle?: string;
  seoDescription?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  date: string;
  status: "draft" | "published";
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: string;
  /** Optional inline data URL so the image displays even when Blob URL fails. */
  dataUrl?: string;
}

function normalizeMediaItem(m: unknown, index: number): MediaItem {
  const any = m as Record<string, unknown>;
  const id = String(any?.id ?? "").trim() || `m-${index}-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    name: String(any?.name ?? "").trim() || "image",
    url: String(any?.url ?? "").trim(),
    type: String(any?.type ?? "image/jpeg"),
    dataUrl: typeof any?.dataUrl === "string" && any.dataUrl.startsWith("data:") ? any.dataUrl : undefined,
  };
}

export function normalizeMedia(media: unknown): MediaItem[] {
  if (!Array.isArray(media)) return [];
  return media.map((m, i) => normalizeMediaItem(m, i));
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "booking" | "system";
  link?: string;
}

export interface AdminData {
  bookings: AdminBooking[];
  guests: AdminGuest[];
  rooms: AdminRoom[];
  blogPosts: BlogPost[];
  media: MediaItem[];
  notifications: AdminNotification[];
}

const STORAGE_KEY = "nersian-admin-data";

export const defaultAdminData: AdminData = {
  bookings: [],
  guests: [],
  rooms: [],
  blogPosts: [],
  media: [],
  notifications: [],
};

function normalizeBlogPost(p: unknown): BlogPost {
  const any = p as Record<string, unknown>;
  if (any.slug != null && any.titleEn != null)
    return p as BlogPost;
  // Migrate old shape (title, content) to new (slug, titleEn, titleAr, contentEn, contentAr)
  const title = String(any.title ?? "");
  const content = String(any.content ?? "");
  return {
    id: String(any.id ?? ""),
    slug: String(
      any.slug ??
        (((any.id ?? title).toString().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "post"))
    ),
    titleEn: String(any.titleEn ?? title),
    titleAr: String(any.titleAr ?? title),
    contentEn: String(any.contentEn ?? content),
    contentAr: String(any.contentAr ?? content),
    date: String(any.date ?? ""),
    status: (any.status === "draft" || any.status === "published" ? any.status : "draft") as "draft" | "published",
  };
}

export function loadAdminData(): AdminData {
  if (typeof window === "undefined") return defaultAdminData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAdminData;
    const parsed = JSON.parse(raw) as AdminData;
    const blogPosts = (parsed.blogPosts ?? []).map(normalizeBlogPost);
    return {
      bookings: parsed.bookings ?? [],
      guests: parsed.guests ?? [],
      rooms: parsed.rooms ?? [],
      blogPosts,
      media: normalizeMedia(parsed.media),
      notifications: parsed.notifications ?? [],
    };
  } catch {
    return defaultAdminData;
  }
}

export function saveAdminData(data: AdminData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/** Booking row id — longer than old B+4chars to avoid duplicate keys / collisions. */
export function generateBookingId(): string {
  const time = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `B${time}${rand}`;
}

const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ["pending", "confirmed", "checked-in"];

/** True if the room has an active booking that hasn't passed checkout date. */
export function isRoomBooked(data: AdminData, room: AdminRoom): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const norm = (s: string) => String(s ?? "").trim();
  return data.bookings.some(
    (b) =>
      norm(b.roomNumber) === norm(room.number) &&
      ACTIVE_BOOKING_STATUSES.includes(b.status) &&
      b.checkOut >= today
  );
}

/**
 * Storefront availability — must match admin "effective" status:
 * - maintenance → not bookable
 * - manually available → bookable (even if legacy bookings exist)
 * - occupied → bookable only when there is NO active booking (checkOut >= today);
 *   stale "occupied" after checkout shows as available so it matches admin + landing.
 */
export function isRoomAvailableForPublic(data: AdminData, room: AdminRoom): boolean {
  if (room.status === "maintenance") return false;
  if (room.status === "available") return true;
  if (room.status === "occupied") return !isRoomBooked(data, room);
  return false;
}

/** Payload stored in nersian-pending-booking when customer goes to payment. */
export interface PendingBookingPayload {
  roomId: string;
  roomName: string;
  dateRange?: { from?: string; to?: string };
  guests?: number;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  total?: number;
  language?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
}

/**
 * Pure merge: append guest + booking and mark room occupied. Use from browser (after fetch) or server (getAdminData).
 */
export function mergeCustomerBookingIntoAdminData(
  data: AdminData,
  payload: PendingBookingPayload
): { nextData: AdminData; booking: AdminBooking } | null {
  const room = data.rooms.find((r) => r.id === payload.roomId);
  if (!room) return null;

  const from = payload.dateRange?.from;
  const to = payload.dateRange?.to;
  const checkIn = typeof from === "string" ? from.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const checkOut = typeof to === "string" ? to.slice(0, 10) : checkIn;
  const nights = from && to ? Math.max(1, Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / 86400000)) : 1;

  const guestId = generateId().slice(0, 8);
  const guest: AdminGuest = {
    id: guestId,
    name: payload.guestName?.trim() || "Guest",
    email: payload.guestEmail?.trim() || "",
    phone: payload.guestPhone?.trim() || "",
  };

  const bookingId = generateBookingId();
  const booking: AdminBooking = {
    id: bookingId,
    guestId,
    guestName: guest.name,
    email: guest.email,
    phone: guest.phone,
    room: room.type,
    roomNumber: room.number,
    checkIn,
    checkOut,
    nights,
    guests: payload.guests ?? 1,
    status: payload.status ?? "confirmed",
    amount: payload.total ?? room.price * nights,
    paymentStatus: payload.paymentStatus ?? "pending",
    createdAt: new Date().toISOString().slice(0, 10),
  };

  const notification: AdminNotification = {
    id: "N" + generateId().slice(0, 6).toUpperCase(),
    title: "New booking",
    message: `${guest.name} - ${room.type} (${checkIn} → ${checkOut})`,
    time: new Date().toISOString(),
    read: false,
    type: "booking",
    link: "/admin/bookings",
  };

  const nextData: AdminData = {
    ...data,
    guests: [...data.guests, guest],
    bookings: [...data.bookings, booking],
    notifications: [notification, ...(data.notifications ?? [])],
    rooms: data.rooms.map((r) =>
      r.id === payload.roomId ? { ...r, status: "occupied" as const } : r
    ),
  };

  return { nextData, booking };
}

/** Persist a customer booking into admin data (guest + booking). Call after payment/confirm. Browser only (uses relative /api). */
export async function addCustomerBookingToStore(
  payload: PendingBookingPayload
): Promise<AdminBooking | undefined> {
  if (typeof fetch === "undefined") return undefined;
  let data: AdminData | null = null;
  try {
    const res = await fetch("/api/admin/data", { cache: "no-store" });
    data = res.ok ? ((await res.json()) as AdminData) : null;
  } catch {
    data = null;
  }
  if (!data) return undefined;

  const merged = mergeCustomerBookingIntoAdminData(data, payload);
  if (!merged) return undefined;

  try {
    await fetch("/api/admin/data", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(merged.nextData),
    });
  } catch {
    // ignore
  }

  return merged.booking;
}
