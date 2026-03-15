"use client";

import { useState, useEffect } from "react";
import { loadAdminData } from "@/lib/admin-store";
import type { BlogPost } from "@/lib/admin-store";

export function getPublicBlogPosts(): BlogPost[] {
  const data = loadAdminData();
  return data.blogPosts.filter((p) => p.status === "published");
}

export function usePublicBlogPosts(): BlogPost[] {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    setPosts(getPublicBlogPosts());
    const onStorage = () => setPosts(getPublicBlogPosts());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return posts;
}

export function getPublicBlogPostBySlug(slug: string): BlogPost | undefined {
  return getPublicBlogPosts().find((p) => p.slug === slug);
}
