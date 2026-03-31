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
  /** When set (e.g. online checkout), matches `AdminRoom.id` even if roomNumber formatting differs. */
  roomId?: string;
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
  /** Optional end time for active discount countdown (ISO string). */
  discountExpiresAt?: string;
  /** Controls whether discount countdown timer is enabled for this room. */
  discountTimerEnabled?: boolean;
  capacity: number;
  /** Room size in square meters. */
  size?: number;
  /** Number of beds in this room. */
  beds?: number;
  /** Number of bathrooms in this room. */
  bathrooms?: number;
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
  type: "booking" | "contact" | "system";
  link?: string;
}

export interface AdminContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  read?: boolean;
}

export type AdminReviewStatus = "pending" | "approved" | "rejected";

export interface AdminReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: AdminReviewStatus;
}

export interface AdminData {
  bookings: AdminBooking[];
  guests: AdminGuest[];
  rooms: AdminRoom[];
  blogPosts: BlogPost[];
  media: MediaItem[];
  notifications: AdminNotification[];
  contactMessages: AdminContactMessage[];
  reviews: AdminReview[];
}

const STORAGE_KEY = "nersian-admin-data";

export const defaultAdminData: AdminData = {
  bookings: [],
  guests: [],
  rooms: [],
  blogPosts: [],
  media: [],
  notifications: [],
  contactMessages: [],
  reviews: [],
};

const BOOKING_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "cancelled",
  "checked-in",
  "checked-out",
];
const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "refunded"];

function coerceBookingStatus(v: unknown): BookingStatus {
  const raw = String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");
  if (BOOKING_STATUSES.includes(raw as BookingStatus)) return raw as BookingStatus;
  return "pending";
}

function coercePaymentStatus(v: unknown): PaymentStatus {
  const raw = String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");
  if (PAYMENT_STATUSES.includes(raw as PaymentStatus)) return raw as PaymentStatus;
  return "pending";
}

/** Normalize checkIn/checkOut/createdAt from JSON (string, epoch ms, ISO, DD-MM-YYYY, etc.). */
function pickBookingDateSlice(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "number" && Number.isFinite(v)) {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  }
  const s = String(v).trim();
  if (!s) return "";
  const keyed = bookingDateKey(s);
  if (keyed) return keyed;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function normalizeAdminRoom(raw: unknown, index: number): AdminRoom {
  const x = raw as Record<string, unknown>;
  const st = x.status;
  const status: AdminRoom["status"] =
    st === "maintenance" || st === "occupied" || st === "available" ? st : "available";
  const price = typeof x.price === "number" ? x.price : parseFloat(String(x.price ?? "0")) || 0;
  const cap = typeof x.capacity === "number" ? x.capacity : parseInt(String(x.capacity ?? "2"), 10) || 2;
  const origRaw = x.originalPrice;
  const orig =
    origRaw != null
      ? typeof origRaw === "number"
        ? origRaw
        : parseFloat(String(origRaw))
      : undefined;
  return {
    id: String(x.id ?? "").trim() || `room-${index}`,
    number: String(x.number ?? "")
      .trim()
      .replace(/^#+/, "")
      .trim(),
    type: String(x.type ?? "").trim(),
    price,
    originalPrice:
      orig != null && Number.isFinite(orig) && orig > price ? orig : undefined,
    discountExpiresAt:
      typeof x.discountExpiresAt === "string" && x.discountExpiresAt.trim()
        ? x.discountExpiresAt.trim()
        : undefined,
    discountTimerEnabled:
      typeof x.discountTimerEnabled === "boolean" ? x.discountTimerEnabled : undefined,
    capacity: cap,
    size:
      x.size != null
        ? typeof x.size === "number"
          ? x.size
          : parseInt(String(x.size), 10) || undefined
        : undefined,
    beds:
      x.beds != null
        ? typeof x.beds === "number"
          ? x.beds
          : parseInt(String(x.beds), 10) || undefined
        : undefined,
    bathrooms:
      x.bathrooms != null
        ? typeof x.bathrooms === "number"
          ? x.bathrooms
          : parseInt(String(x.bathrooms), 10) || undefined
        : undefined,
    status,
    image: String(x.image ?? ""),
    images: Array.isArray(x.images) ? (x.images as string[]) : undefined,
    seoTitle: x.seoTitle != null ? String(x.seoTitle) : undefined,
    seoDescription: x.seoDescription != null ? String(x.seoDescription) : undefined,
  };
}

function normalizeAdminBooking(raw: unknown, index: number): AdminBooking {
  const x = raw as Record<string, unknown>;
  const roomIdRaw = x.roomId ?? x.room_id ?? x.RoomId;
  const nightsNum = typeof x.nights === "number" ? x.nights : parseInt(String(x.nights ?? "1"), 10);
  const guestsNum = typeof x.guests === "number" ? x.guests : parseInt(String(x.guests ?? "1"), 10);
  const amountNum = typeof x.amount === "number" ? x.amount : parseFloat(String(x.amount ?? "0")) || 0;
  return {
    id: String(x.id ?? "").trim() || `booking-${index}`,
    guestId: String(x.guestId ?? x.guest_id ?? "").trim(),
    guestName: String(x.guestName ?? x.guest_name ?? "").trim(),
    email: String(x.email ?? "").trim(),
    phone: String(x.phone ?? "").trim(),
    room: String(x.room ?? x.Room ?? "").trim(),
    roomNumber: String(x.roomNumber ?? x.room_number ?? x.RoomNumber ?? "")
      .trim()
      .replace(/^#+/, "")
      .trim(),
    roomId: roomIdRaw != null && String(roomIdRaw).trim() ? String(roomIdRaw).trim() : undefined,
    checkIn: pickBookingDateSlice(x.checkIn ?? x.check_in ?? x.CheckIn),
    checkOut: pickBookingDateSlice(x.checkOut ?? x.check_out ?? x.CheckOut),
    nights: Number.isFinite(nightsNum) && nightsNum > 0 ? nightsNum : 1,
    guests: Number.isFinite(guestsNum) && guestsNum > 0 ? guestsNum : 1,
    status: coerceBookingStatus(x.status),
    amount: amountNum,
    paymentStatus: coercePaymentStatus(x.paymentStatus ?? x.payment_status ?? x.PaymentStatus),
    createdAt: pickBookingDateSlice(x.createdAt ?? x.created_at ?? x.CreatedAt).slice(0, 10),
  };
}

/**
 * Coerce API / DB JSON into a full AdminData shape so missing `bookings` never wipes rooms
 * and snake_case fields from older rows still work.
 */
export function normalizeAdminData(input: unknown): AdminData {
  if (input == null || typeof input !== "object") {
    return { ...defaultAdminData, media: [] };
  }
  const o = input as Record<string, unknown>;
  const bookingsRaw = o.bookings;
  const bookings = Array.isArray(bookingsRaw)
    ? bookingsRaw.map((b, i) => normalizeAdminBooking(b, i))
    : [];
  const guests = Array.isArray(o.guests) ? (o.guests as AdminGuest[]) : [];
  const roomsRaw = o.rooms;
  const rooms = Array.isArray(roomsRaw) ? roomsRaw.map((r, i) => normalizeAdminRoom(r, i)) : [];
  const blogRaw = o.blogPosts;
  const blogPosts = Array.isArray(blogRaw) ? blogRaw.map((p) => normalizeBlogPost(p)) : [];
  const contactRaw = Array.isArray(o.contactMessages) ? o.contactMessages : [];
  const contactMessages: AdminContactMessage[] = contactRaw
    .map((c, i) => {
      const x = c as Record<string, unknown>;
      const email = String(x.email ?? "").trim();
      const message = String(x.message ?? "").trim();
      if (!email || !message) return null;
      return {
        id: String(x.id ?? "").trim() || `contact-${i}-${Math.random().toString(36).slice(2, 7)}`,
        name: String(x.name ?? "").trim() || "Guest",
        email,
        phone: String(x.phone ?? "").trim(),
        message,
        createdAt: pickBookingDateSlice(x.createdAt ?? x.created_at) || new Date().toISOString().slice(0, 10),
        read: Boolean(x.read ?? false),
      };
    })
    .filter((v): v is AdminContactMessage => Boolean(v));
  const reviewsRaw = Array.isArray(o.reviews) ? o.reviews : [];
  const reviews: AdminReview[] = reviewsRaw
    .map((r, i) => {
      const x = r as Record<string, unknown>;
      const name = String(x.name ?? "").trim();
      const comment = String(x.comment ?? "").trim();
      const rawRating = typeof x.rating === "number" ? x.rating : parseInt(String(x.rating ?? "0"), 10);
      const rating = Number.isFinite(rawRating) ? Math.min(5, Math.max(1, rawRating)) : 5;
      const rawStatus = String(x.status ?? "pending").trim().toLowerCase();
      const status: AdminReviewStatus =
        rawStatus === "approved" || rawStatus === "rejected" ? rawStatus : "pending";
      if (!name || !comment) return null;
      return {
        id: String(x.id ?? "").trim() || `review-${i}-${Math.random().toString(36).slice(2, 7)}`,
        name,
        rating,
        comment,
        createdAt: pickBookingDateSlice(x.createdAt ?? x.created_at) || new Date().toISOString().slice(0, 10),
        status,
      };
    })
    .filter((v): v is AdminReview => Boolean(v));
  return {
    bookings,
    guests,
    rooms,
    blogPosts,
    media: normalizeMedia(o.media),
    notifications: Array.isArray(o.notifications) ? (o.notifications as AdminNotification[]) : [],
    contactMessages,
    reviews,
  };
}

/** YYYY-MM-DD for comparisons; supports ISO, year-first slashes, and DD-MM-YYYY (common in KSA). */
export function bookingDateKey(s: string | undefined | null): string | null {
  if (s == null) return null;
  const t = String(s).trim();
  if (!t) return null;
  const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const compact = t.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compact) return `${compact[1]}-${compact[2]}-${compact[3]}`;
  const slash = t.match(/^(\d{4})[/.](\d{1,2})[/.](\d{1,2})/);
  if (slash) {
    return `${slash[1]}-${slash[2].padStart(2, "0")}-${slash[3].padStart(2, "0")}`;
  }
  // DD-MM-YYYY or DD/MM/YYYY (e.g. 19-03-2026) — avoid unreliable Date.parse
  const dmy = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (dmy) {
    const first = Number(dmy[1]);
    const second = Number(dmy[2]);
    const y = dmy[3];
    if (first > 12) {
      return `${y}-${String(second).padStart(2, "0")}-${String(first).padStart(2, "0")}`;
    }
    if (second > 12) {
      return `${y}-${String(first).padStart(2, "0")}-${String(second).padStart(2, "0")}`;
    }
    return `${y}-${String(second).padStart(2, "0")}-${String(first).padStart(2, "0")}`;
  }
  const d = new Date(t);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
}

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
    return normalizeAdminData(JSON.parse(raw) as unknown);
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
const ACTIVE_BOOKING_SET = new Set<string>(ACTIVE_BOOKING_STATUSES);

/** Hotel calendar "today" for date-only stay strings (avoids UTC vs local mismatches). */
const HOTEL_TIMEZONE =
  (typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_HOTEL_TIMEZONE || process.env.HOTEL_TIMEZONE)) ||
  "Asia/Riyadh";

/**
 * Always `YYYY-MM-DD` in the hotel timezone. Never fall back to a locale string like `3/19/2026`:
 * comparing that to ISO stay dates lexicographically marks valid bookings as "past" (e.g. `"2026-03-19" < "3/19/2026"`).
 */
export function hotelCalendarTodayKey(): string {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: HOTEL_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = fmt.formatToParts(new Date());
    const y = parts.find((p) => p.type === "year")?.value;
    const m = parts.find((p) => p.type === "month")?.value;
    const d = parts.find((p) => p.type === "day")?.value;
    if (y && m && d) {
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
  } catch {
    // fall through
  }
  return new Date().toISOString().slice(0, 10);
}

/** Arabic-Indic (٠١٢…) and Persian (۰۱۲…) digits → Western, so they match stored ASCII room numbers. */
function toWesternDigits(s: string): string {
  let out = "";
  for (const c of s) {
    const cp = c.codePointAt(0)!;
    if (cp >= 0x0660 && cp <= 0x0669) out += String(cp - 0x0660);
    else if (cp >= 0x06f0 && cp <= 0x06f9) out += String(cp - 0x06f0);
    else out += c;
  }
  return out;
}

/** Compare room numbers so "010" and "10" match (common mismatch between booking vs room record). */
export function normalizeRoomNumberKey(s: string | number | undefined | null): string {
  let t = toWesternDigits(String(s ?? ""))
    .trim()
    .replace(/^#+/, "")
    .trim();
  const stripped = t.replace(/^0+/, "");
  return stripped === "" ? "0" : stripped;
}

/**
 * Whether this booking row refers to a given admin room (handles missing roomId / roomNumber from legacy rows).
 */
export function bookingTouchesRoom(data: AdminData, b: AdminBooking, room: AdminRoom): boolean {
  // JSON/DB may coerce ids differently; string compare avoids missed matches.
  if (b.roomId != null && String(b.roomId).trim() === String(room.id).trim()) return true;

  const roomKey = normalizeRoomNumberKey(room.number);
  const rn = String(b.roomNumber ?? "")
    .trim()
    .replace(/^#+/, "")
    .trim();
  if (rn && normalizeRoomNumberKey(rn) === roomKey) return true;

  /** "#010", "Room 010", "غرفة 010" in either field */
  const haystack = `${rn} ${String(b.room ?? "")}`;
  for (const m of haystack.matchAll(/#?\s*(\d{1,6})/g)) {
    if (normalizeRoomNumberKey(m[1]) === roomKey) return true;
  }

  const typeLabel = String(b.room ?? "").trim();
  const roomType = String(room.type ?? "").trim();
  const tl = typeLabel.toLowerCase();
  const rt = roomType.toLowerCase();
  if (tl && rt && tl === rt) {
    const sameTypeCount = data.rooms.filter((r) => r.type.toLowerCase() === rt).length;
    if (sameTypeCount === 1) return true;
  }

  if (!rn && typeLabel) {
    const digitGroups = typeLabel.match(/\d+/g) ?? [];
    for (const g of digitGroups) {
      if (normalizeRoomNumberKey(g) === roomKey) return true;
    }
  }

  return false;
}

/** End of stay for availability: checkout date, or check-in if checkout missing (same-day / legacy row). */
function bookingStayEndKey(b: AdminBooking): string | null {
  return bookingDateKey(b.checkOut) ?? bookingDateKey(b.checkIn);
}

/**
 * Room counts as booked until the checkout **calendar day** has passed in the hotel timezone
 * (checkout day still counts as occupied). Missing/invalid checkout falls back to check-in.
 */
export function isRoomBooked(data: AdminData, room: AdminRoom): boolean {
  const todayKey = hotelCalendarTodayKey();
  return data.bookings.some((b) => {
    const st = String(b.status ?? "")
      .trim()
      .toLowerCase()
      .replace(/_/g, "-");
    if (!ACTIVE_BOOKING_SET.has(st)) return false;
    const endKey = bookingStayEndKey(b);
    if (!endKey) return false;
    const startKey = bookingDateKey(b.checkIn);
    if (startKey && startKey > endKey) return false;
    // Stay has not ended (checkout day still counts as occupied in hotel TZ)
    if (endKey < todayKey) return false;
    return bookingTouchesRoom(data, b, room);
  });
}

/**
 * Persisted room rows: set `status` from active bookings (saved to DB on every PATCH and when GET detects drift).
 * `maintenance` is never auto-changed.
 */
export function reconcileRoomStatusesWithBookings(data: AdminData): { next: AdminData; changed: boolean } {
  let changed = false;
  const rooms = data.rooms.map((room) => {
    if (room.status === "maintenance") return room;
    const booked = isRoomBooked(data, room);
    const newStatus: AdminRoom["status"] = booked ? "occupied" : "available";
    if (newStatus !== room.status) changed = true;
    return { ...room, status: newStatus };
  });
  return { next: { ...data, rooms }, changed };
}

/**
 * Ensure discounted rooms always have an expiry timestamp.
 * This backfills older rows created before `discountExpiresAt` existed.
 */
export function reconcileRoomDiscountExpiries(data: AdminData): { next: AdminData; changed: boolean } {
  let changed = false;
  const rooms = data.rooms.map((room) => {
    const hasDiscount =
      typeof room.originalPrice === "number" &&
      Number.isFinite(room.originalPrice) &&
      room.originalPrice > room.price;
    const expiresAtMs = room.discountExpiresAt ? new Date(room.discountExpiresAt).getTime() : NaN;
    const timerEnabled = room.discountTimerEnabled;
    if (hasDiscount) {
      // Migration/default behavior for old rows: discount implies timer enabled unless explicitly disabled.
      if (timerEnabled === false) {
        if (room.discountExpiresAt) {
          changed = true;
          return { ...room, discountExpiresAt: undefined, discountTimerEnabled: false };
        }
        return room;
      }
      if (!room.discountExpiresAt || Number.isNaN(expiresAtMs)) {
        changed = true;
        return {
          ...room,
          discountTimerEnabled: true,
          discountExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
      }
      if (timerEnabled !== true) {
        changed = true;
        return { ...room, discountTimerEnabled: true };
      }
      return room;
    }
    if (room.discountExpiresAt || room.discountTimerEnabled != null) {
      changed = true;
      return { ...room, discountExpiresAt: undefined, discountTimerEnabled: undefined };
    }
    return room;
  });
  return { next: { ...data, rooms }, changed };
}

export function normalizeAndReconcileAdminData(input: unknown): AdminData {
  const normalized = normalizeAdminData(input);
  const withStatuses = reconcileRoomStatusesWithBookings(normalized).next;
  return reconcileRoomDiscountExpiries(withStatuses).next;
}

/**
 * Badge / dashboard status: active booking always shows as occupied, even if DB status was left "available".
 * Stale "occupied" with no active booking shows as available.
 */
export function getEffectiveRoomStatusForAdmin(data: AdminData, room: AdminRoom): AdminRoom["status"] {
  if (room.status === "maintenance") return "maintenance";
  if (isRoomBooked(data, room)) return "occupied";
  if (room.status === "occupied" && !isRoomBooked(data, room)) return "available";
  return room.status;
}

/**
 * Storefront: cannot book if there is an active stay, even when room row still says "available".
 * Stale "occupied" after checkout → treat as bookable.
 */
export function isRoomAvailableForPublic(data: AdminData, room: AdminRoom): boolean {
  if (room.status === "maintenance") return false;
  if (isRoomBooked(data, room)) return false;
  if (room.status === "available") return true;
  if (room.status === "occupied") return true;
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
 * Date selected in UI should be interpreted in hotel timezone.
 * Accepts:
 * - YYYY-MM-DD (kept as-is)
 * - ISO with time (converted to hotel date, avoids UTC off-by-one)
 * - other parseable values (fallback via bookingDateKey)
 */
function pendingDateToHotelDateKey(v: string | undefined): string | null {
  if (!v) return null;
  const s = String(v).trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // If an ISO timestamp is passed (legacy payload), convert to hotel local calendar date.
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    try {
      const d = new Date(s);
      if (!Number.isNaN(d.getTime())) {
        const fmt = new Intl.DateTimeFormat("en-US", {
          timeZone: HOTEL_TIMEZONE,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        const parts = fmt.formatToParts(d);
        const y = parts.find((p) => p.type === "year")?.value;
        const m = parts.find((p) => p.type === "month")?.value;
        const day = parts.find((p) => p.type === "day")?.value;
        if (y && m && day) return `${y}-${m.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
    } catch {
      // fall through
    }
  }
  return bookingDateKey(s);
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
  const checkIn = pendingDateToHotelDateKey(from) ?? hotelCalendarTodayKey();
  const checkOut = pendingDateToHotelDateKey(to) ?? checkIn;
  const nights =
    checkIn && checkOut
      ? Math.max(
          1,
          Math.ceil((new Date(`${checkOut}T00:00:00`).getTime() - new Date(`${checkIn}T00:00:00`).getTime()) / 86400000)
        )
      : 1;

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
    roomId: room.id,
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
