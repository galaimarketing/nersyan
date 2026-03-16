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
  loadAdminData,
  saveAdminData,
  generateId,
  normalizeMedia,
} from "@/lib/admin-store";

type AdminDataContextValue = {
  data: AdminData;
  setData: React.Dispatch<React.SetStateAction<AdminData>>;
  refetchFromApi: () => Promise<void>;
  // Bookings
  addBooking: (b: Omit<AdminBooking, "id" | "createdAt">) => AdminBooking;
  updateBooking: (id: string, updates: Partial<AdminBooking>) => void;
  // Guests
  addGuest: (g: Omit<AdminGuest, "id">) => AdminGuest;
  updateGuest: (id: string, updates: Partial<AdminGuest>) => void;
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
};

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

const ADMIN_DATA_API = "/api/admin/data";

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AdminData>(defaultAdminData);
  const [initialized, setInitialized] = useState(false);

  // Load: prefer API, fallback to localStorage
  useEffect(() => {
    let cancelled = false;
    fetch(ADMIN_DATA_API)
      .then((res) => (res.ok ? res.json() : null))
      .then((apiData: AdminData | null) => {
        if (cancelled) return;
        if (apiData && Array.isArray(apiData.bookings)) {
          setData({
            bookings: apiData.bookings ?? [],
            guests: apiData.guests ?? [],
            rooms: apiData.rooms ?? [],
            blogPosts: apiData.blogPosts ?? [],
            media: normalizeMedia(apiData.media),
            notifications: apiData.notifications ?? [],
          });
        } else {
          setData(loadAdminData());
        }
        setInitialized(true);
      })
      .catch(() => {
        if (!cancelled) {
          setData(loadAdminData());
          setInitialized(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refetchFromApi = useCallback(async () => {
    try {
      const res = await fetch(ADMIN_DATA_API);
      const apiData = res.ok ? (await res.json()) as AdminData : null;
      if (apiData && Array.isArray(apiData.bookings)) {
        setData({
          bookings: apiData.bookings ?? [],
          guests: apiData.guests ?? [],
          rooms: apiData.rooms ?? [],
          blogPosts: apiData.blogPosts ?? [],
          media: normalizeMedia(apiData.media),
          notifications: apiData.notifications ?? [],
        });
      }
    } catch {
      // keep current data
    }
  }, []);

  // Persist: always localStorage (offline fallback), and API when available
  useEffect(() => {
    if (!initialized) return;
    saveAdminData(data);
    const t = setTimeout(() => {
      fetch(ADMIN_DATA_API, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [data, initialized]);

  const addBooking = useCallback(
    (b: Omit<AdminBooking, "id" | "createdAt">) => {
      const id = "B" + generateId().slice(0, 4).toUpperCase();
      const created: AdminBooking = {
        ...b,
        id,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      const notif: AdminNotification = {
        id: "N" + generateId().slice(0, 6).toUpperCase(),
        title: "New booking",
        message: `${created.guestName} - ${created.room} (${created.checkIn} → ${created.checkOut})`,
        time: new Date().toISOString(),
        read: false,
        type: "booking",
        link: "/admin/bookings",
      };
      setData((d) => ({
        ...d,
        bookings: [...d.bookings, created],
        notifications: [notif, ...(d.notifications ?? [])],
      }));
      return created;
    },
    []
  );

  const updateBooking = useCallback((id: string, updates: Partial<AdminBooking>) => {
    setData((d) => ({
      ...d,
      bookings: d.bookings.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
  }, []);

  const addGuest = useCallback((g: Omit<AdminGuest, "id">) => {
    const id = generateId().slice(0, 8);
    const guest: AdminGuest = { ...g, id };
    setData((d) => ({ ...d, guests: [...d.guests, guest] }));
    return guest;
  }, []);

  const updateGuest = useCallback((id: string, updates: Partial<AdminGuest>) => {
    setData((d) => ({
      ...d,
      guests: d.guests.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  }, []);

  const getGuestById = useCallback(
    (id: string) => data.guests.find((g) => g.id === id),
    [data.guests]
  );

  const addRoom = useCallback((r: Omit<AdminRoom, "id">) => {
    const id = generateId().slice(0, 8);
    const room: AdminRoom = { ...r, id };
    setData((d) => ({ ...d, rooms: [...d.rooms, room] }));
    return room;
  }, []);

  const updateRoom = useCallback((id: string, updates: Partial<AdminRoom>) => {
    setData((d) => ({
      ...d,
      rooms: d.rooms.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
  }, []);

  const deleteRoom = useCallback((id: string) => {
    setData((d) => ({ ...d, rooms: d.rooms.filter((r) => r.id !== id) }));
  }, []);

  const addBlogPost = useCallback((p: Omit<BlogPost, "id">) => {
    const id = generateId().slice(0, 8);
    const post: BlogPost = { ...p, id };
    setData((d) => ({ ...d, blogPosts: [...d.blogPosts, post] }));
    return post;
  }, []);

  const updateBlogPost = useCallback((id: string, updates: Partial<BlogPost>) => {
    setData((d) => ({
      ...d,
      blogPosts: d.blogPosts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  const getBlogPostById = useCallback(
    (id: string) => data.blogPosts.find((p) => p.id === id),
    [data.blogPosts]
  );

  const getBlogPostBySlug = useCallback(
    (slug: string) => data.blogPosts.find((p) => p.slug === slug),
    [data.blogPosts]
  );

  const addMedia = useCallback((m: Omit<MediaItem, "id">) => {
    const id = generateId().slice(0, 8);
    const item: MediaItem = { ...m, id };
    setData((d) => ({ ...d, media: [...d.media, item] }));
    return item;
  }, []);

  const deleteMedia = useCallback((id: string) => {
    setData((d) => ({ ...d, media: d.media.filter((m) => m.id !== id) }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      notifications: (d.notifications ?? []).map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const value: AdminDataContextValue = {
    data,
    setData,
    refetchFromApi,
    addBooking,
    updateBooking,
    addGuest,
    updateGuest,
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
