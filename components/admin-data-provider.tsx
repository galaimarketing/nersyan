"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  AdminData,
  AdminBooking,
  AdminGuest,
  AdminRoom,
  BlogPost,
  MediaItem,
  AdminNotification,
  defaultAdminData,
  generateId,
  generateBookingId,
  normalizeMedia,
  isRoomBooked,
  normalizeRoomNumberKey,
  normalizeAdminData,
  normalizeAndReconcileAdminData,
  reconcileRoomStatusesWithBookings,
} from "@/lib/admin-store";

/** Align room.status with active bookings (same logic as server /api/admin/data). */
function reconciledSnapshot(next: AdminData): AdminData {
  return reconcileRoomStatusesWithBookings(normalizeAdminData(next)).next;
}

type AdminDataContextValue = {
  data: AdminData;
  setData: React.Dispatch<React.SetStateAction<AdminData>>;
  refetchFromApi: () => Promise<void>;
  // Bookings
  addBooking: (b: Omit<AdminBooking, "id" | "createdAt">) => AdminBooking;
  updateBooking: (id: string, updates: Partial<AdminBooking>) => void;
  deleteBooking: (id: string) => void;
  // Guests
  addGuest: (g: Omit<AdminGuest, "id">) => AdminGuest;
  updateGuest: (id: string, updates: Partial<AdminGuest>) => void;
  deleteGuest: (id: string) => void;
  getGuestById: (id: string) => AdminGuest | undefined;
  // Rooms
  addRoom: (r: Omit<AdminRoom, "id">) => AdminRoom;
  updateRoom: (id: string, updates: Partial<AdminRoom>) => void;
  deleteRoom: (id: string) => void;
  // Blog
  addBlogPost: (p: Omit<BlogPost, "id">) => BlogPost;
  updateBlogPost: (id: string, updates: Partial<BlogPost>) => void;
  getBlogPostById: (id: string) => BlogPost | undefined;
  getBlogPostBySlug: (slug: string) => BlogPost | undefined;
  // Media
  addMedia: (m: Omit<MediaItem, "id">) => MediaItem;
  deleteMedia: (id: string) => void;
  // Notifications
  notifications: AdminNotification[];
  markNotificationRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  // Contact messages
  deleteContactMessage: (id: string) => void;
  markContactMessageRead: (id: string) => void;
};

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

const ADMIN_DATA_API = "/api/admin/data";
const LEGACY_STORAGE_KEY = "nersian-admin-data";

function mergeById<T extends { id: string }>(fromApi: T[], fromLocal: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of fromLocal) map.set(item.id, item);
  for (const item of fromApi) map.set(item.id, item);
  return Array.from(map.values());
}

function mergeAdminData(apiData: AdminData, localData: AdminData): AdminData {
  return {
    bookings: mergeById(apiData.bookings ?? [], localData.bookings ?? []),
    guests: mergeById(apiData.guests ?? [], localData.guests ?? []),
    rooms: mergeById(apiData.rooms ?? [], localData.rooms ?? []),
    blogPosts: mergeById(apiData.blogPosts ?? [], localData.blogPosts ?? []),
    media: normalizeMedia(mergeById(apiData.media ?? [], localData.media ?? [])),
    notifications: mergeById(apiData.notifications ?? [], localData.notifications ?? []),
    contactMessages: mergeById(apiData.contactMessages ?? [], localData.contactMessages ?? []),
  };
}

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AdminData>(defaultAdminData);
  const persistToApi = useCallback(async (nextData: AdminData) => {
    const payload = reconciledSnapshot(nextData);
    try {
      const res = await fetch(ADMIN_DATA_API, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  // Load: always from API (DB). One-time migrate legacy localStorage if present.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(ADMIN_DATA_API, { cache: "no-store" });
        const rawJson = res.ok ? await res.json().catch(() => null) : null;
        if (cancelled) return;

        const normalizedApi = normalizeAdminData(rawJson);
        const apiReconciled = reconciledSnapshot(normalizedApi);
        setData(apiReconciled);

        // One-time migration from legacy localStorage
        if (typeof window !== "undefined") {
          const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
          if (raw) {
            try {
              const local = normalizeAdminData(JSON.parse(raw) as unknown);
              const merged = mergeAdminData(normalizedApi, local);
              const mergedReconciled = reconciledSnapshot(merged);
              if (JSON.stringify(mergedReconciled) !== JSON.stringify(apiReconciled)) {
                await fetch(ADMIN_DATA_API, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(mergedReconciled),
                });
                setData(mergedReconciled);
              }
              window.localStorage.removeItem(LEGACY_STORAGE_KEY);
            } catch {
              // ignore invalid legacy data
            }
          }
        }
      } catch {
        if (!cancelled) setData(normalizeAndReconcileAdminData(defaultAdminData));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refetchFromApi = useCallback(async () => {
    try {
      const res = await fetch(ADMIN_DATA_API, { cache: "no-store" });
      if (!res.ok) return;
      const raw = await res.json().catch(() => null);
      setData(normalizeAndReconcileAdminData(raw));
    } catch {
      // keep current data
    }
  }, []);

  // When returning to the tab, sync from DB so badges / occupancy stay accurate.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const onVisible = () => {
      if (typeof document === "undefined" || document.visibilityState !== "visible") return;
      clearTimeout(t);
      t = setTimeout(() => void refetchFromApi(), 400);
    };
    if (typeof window === "undefined") return undefined;
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      clearTimeout(t);
    };
  }, [refetchFromApi]);

  /**
   * Never auto-PATCH the full document on every state change — that overwrote the DB with a stale
   * in-memory snapshot (e.g. after Moyasar added a booking on the server) and dropped bookings.
   * Persist only from explicit mutations below.
   */

  const addBooking = useCallback(
    (b: Omit<AdminBooking, "id" | "createdAt">) => {
      const id = generateBookingId();
      const createdAt = new Date().toISOString().slice(0, 10);
      const created: AdminBooking = { ...b, id, createdAt };
      const notif: AdminNotification = {
        id: "N" + generateId().slice(0, 6).toUpperCase(),
        title: "New booking",
        message: "",
        time: new Date().toISOString(),
        read: false,
        type: "booking",
        link: "/admin/bookings",
      };
      setData((d) => {
        const matchedRoom = d.rooms.find(
          (r) => normalizeRoomNumberKey(r.number) === normalizeRoomNumberKey(created.roomNumber)
        );
        const normalizedCreated: AdminBooking = {
          ...created,
          roomId: created.roomId ?? matchedRoom?.id,
        };
        notif.message = `${created.guestName} - ${created.room} (${created.checkIn} → ${created.checkOut})`;
        const nextBookings = [...d.bookings, normalizedCreated];
        const key = normalizeRoomNumberKey(normalizedCreated.roomNumber);
        const nextRooms = d.rooms.map((r) =>
          normalizeRoomNumberKey(r.number) === key ? { ...r, status: "occupied" as const } : r
        );
        const next: AdminData = {
          ...d,
          bookings: nextBookings,
          rooms: nextRooms,
          notifications: [notif, ...(d.notifications ?? [])],
        };
        return reconciledSnapshot(next);
      });
      // Save manual reservations atomically on server against latest DB state.
      void fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(created),
      })
        .then((res) => (res.ok ? refetchFromApi() : Promise.reject(new Error("booking post failed"))))
        .catch(async () => {
          // Fallback for older servers without /api/admin/bookings route.
          setData((d) => {
            const reconciled = reconciledSnapshot(d);
            void persistToApi(reconciled).then((ok) => {
              if (ok) void refetchFromApi();
            });
            return d;
          });
        });
      return created;
    },
    [persistToApi, refetchFromApi]
  );

  const updateBooking = useCallback(
    (id: string, updates: Partial<AdminBooking>) => {
      setData((d) => {
        const next: AdminData = {
          ...d,
          bookings: d.bookings.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        };
        const reconciled = reconciledSnapshot(next);
        void persistToApi(reconciled);
        return reconciled;
      });
    },
    [persistToApi]
  );

  const deleteBooking = useCallback((id: string) => {
    setData((d) => {
      const nextBookings = d.bookings.filter((b) => b.id !== id);
      const snapshot: AdminData = { ...d, bookings: nextBookings };
      const nextRooms = d.rooms.map((r) => {
        if (r.status !== "occupied") return r;
        // If room no longer has any active booking, mark it available again
        return isRoomBooked(snapshot, r) ? r : { ...r, status: "available" as const };
      });
      const next = { ...d, bookings: nextBookings, rooms: nextRooms };
      // Persist immediately so other admin pages show updated room availability.
      const reconciled = reconciledSnapshot(next);
      void persistToApi(reconciled);
      return reconciled;
    });
  }, [persistToApi]);

  const addGuest = useCallback(
    (g: Omit<AdminGuest, "id">) => {
      const id = generateId().slice(0, 8);
      const guest: AdminGuest = { ...g, id };
      setData((d) => {
        const next: AdminData = { ...d, guests: [...d.guests, guest] };
        const reconciled = reconciledSnapshot(next);
        void persistToApi(reconciled);
        return reconciled;
      });
      return guest;
    },
    [persistToApi]
  );

  const updateGuest = useCallback(
    (id: string, updates: Partial<AdminGuest>) => {
      setData((d) => {
        const next: AdminData = {
          ...d,
          guests: d.guests.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        };
        const reconciled = reconciledSnapshot(next);
        void persistToApi(reconciled);
        return reconciled;
      });
    },
    [persistToApi]
  );

  const deleteGuest = useCallback((id: string) => {
    setData((d) => {
      const nextGuests = d.guests.filter((g) => g.id !== id);
      const nextBookings = d.bookings.filter((b) => b.guestId !== id);
      const snapshot: AdminData = { ...d, guests: nextGuests, bookings: nextBookings };
      const nextRooms = d.rooms.map((r) => {
        if (r.status !== "occupied") return r;
        return isRoomBooked(snapshot, r) ? r : { ...r, status: "available" as const };
      });
      const next = { ...d, guests: nextGuests, bookings: nextBookings, rooms: nextRooms };
      const reconciled = reconciledSnapshot(next);
      void persistToApi(reconciled);
      return reconciled;
    });
  }, [persistToApi]);

  const getGuestById = useCallback(
    (id: string) => data.guests.find((g) => g.id === id),
    [data.guests]
  );

  const addRoom = useCallback(
    (r: Omit<AdminRoom, "id">) => {
      const id = generateId().slice(0, 8);
      const room: AdminRoom = { ...r, id };
      setData((d) => {
        const next: AdminData = { ...d, rooms: [...d.rooms, room] };
        const reconciled = reconciledSnapshot(next);
        void persistToApi(reconciled);
        return reconciled;
      });
      return room;
    },
    [persistToApi]
  );

  const updateRoom = useCallback(
    (id: string, updates: Partial<AdminRoom>) => {
      setData((d) => {
        const next: AdminData = {
          ...d,
          rooms: d.rooms.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        };
        const reconciled = reconciledSnapshot(next);
        void persistToApi(reconciled);
        return reconciled;
      });
    },
    [persistToApi]
  );

  const deleteRoom = useCallback(
    (id: string) => {
      setData((d) => {
        const next: AdminData = { ...d, rooms: d.rooms.filter((r) => r.id !== id) };
        const reconciled = reconciledSnapshot(next);
        void persistToApi(reconciled);
        return reconciled;
      });
    },
    [persistToApi]
  );

  const addBlogPost = useCallback(
    (p: Omit<BlogPost, "id">) => {
      const id = generateId().slice(0, 8);
      const post: BlogPost = { ...p, id };
      setData((d) => {
        const next: AdminData = { ...d, blogPosts: [...d.blogPosts, post] };
        const reconciled = reconciledSnapshot(next);
        void persistToApi(reconciled);
        return reconciled;
      });
      return post;
    },
    [persistToApi]
  );

  const updateBlogPost = useCallback(
    (id: string, updates: Partial<BlogPost>) => {
      setData((d) => {
        const next: AdminData = {
          ...d,
          blogPosts: d.blogPosts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        };
        const reconciled = reconciledSnapshot(next);
        void persistToApi(reconciled);
        return reconciled;
      });
    },
    [persistToApi]
  );

  const getBlogPostById = useCallback(
    (id: string) => data.blogPosts.find((p) => p.id === id),
    [data.blogPosts]
  );

  const getBlogPostBySlug = useCallback(
    (slug: string) => data.blogPosts.find((p) => p.slug === slug),
    [data.blogPosts]
  );

  const addMedia = useCallback(
    (m: Omit<MediaItem, "id">) => {
      const id = generateId().slice(0, 8);
      const item: MediaItem = { ...m, id };
      setData((d) => {
        const next: AdminData = { ...d, media: [...d.media, item] };
        const reconciled = reconciledSnapshot(next);
        void persistToApi(reconciled);
        return reconciled;
      });
      return item;
    },
    [persistToApi]
  );

  const deleteMedia = useCallback(
    (id: string) => {
      setData((d) => {
        const next: AdminData = { ...d, media: d.media.filter((m) => m.id !== id) };
        const reconciled = reconciledSnapshot(next);
        void persistToApi(reconciled);
        return reconciled;
      });
    },
    [persistToApi]
  );

  const markNotificationRead = useCallback(
    (id: string) => {
      setData((d) => {
        const next: AdminData = {
          ...d,
          notifications: (d.notifications ?? []).map((n) => (n.id === id ? { ...n, read: true } : n)),
        };
        const reconciled = reconciledSnapshot(next);
        void persistToApi(reconciled);
        return reconciled;
      });
    },
    [persistToApi]
  );

  const deleteNotification = useCallback(
    (id: string) => {
      setData((d) => {
        const next: AdminData = {
          ...d,
          notifications: (d.notifications ?? []).filter((n) => n.id !== id),
        };
        const reconciled = reconciledSnapshot(next);
        void persistToApi(reconciled);
        return reconciled;
      });
    },
    [persistToApi]
  );

  const deleteContactMessage = useCallback((id: string) => {
    setData((d) => {
      const nextMessages = (d.contactMessages ?? []).filter((m) => m.id !== id);
      const next: AdminData = {
        ...d,
        contactMessages: nextMessages,
      };
      const reconciled = reconciledSnapshot(next);
      void persistToApi(reconciled);
      return reconciled;
    });
  }, [persistToApi]);

  const markContactMessageRead = useCallback((id: string) => {
    setData((d) => {
      const nextMessages = (d.contactMessages ?? []).map((m) => (m.id === id ? { ...m, read: true } : m));
      const next: AdminData = {
        ...d,
        contactMessages: nextMessages,
      };
      const reconciled = reconciledSnapshot(next);
      void persistToApi(reconciled);
      return reconciled;
    });
  }, [persistToApi]);

  const value: AdminDataContextValue = {
    data,
    setData,
    refetchFromApi,
    addBooking,
    updateBooking,
    deleteBooking,
    addGuest,
    updateGuest,
    deleteGuest,
    getGuestById,
    addRoom,
    updateRoom,
    deleteRoom,
    addBlogPost,
    updateBlogPost,
    getBlogPostById,
    getBlogPostBySlug,
    addMedia,
    deleteMedia,
    notifications: data.notifications ?? [],
    markNotificationRead,
    deleteNotification,
    deleteContactMessage,
    markContactMessageRead,
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used within AdminDataProvider");
  return ctx;
}
