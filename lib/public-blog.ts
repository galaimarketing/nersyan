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
    const load = () => {
      fetch("/api/blog")
        .then((res) => (res.ok ? res.json() : null))
        .then((api: BlogPost[] | null) => {
          if (Array.isArray(api)) setPosts(api);
          else setPosts(getPublicBlogPosts());
        })
        .catch(() => setPosts(getPublicBlogPosts()));
    };
    load();
    const onStorage = () => setPosts(getPublicBlogPosts());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return posts;
}

export function getPublicBlogPostBySlug(slug: string): BlogPost | undefined {
  return getPublicBlogPosts().find((p) => p.slug === slug);
}

/** Fetches one published post by slug from API (or localStorage fallback). */
export function usePublicBlogPostBySlug(slug: string): BlogPost | undefined | null {
  const [post, setPost] = useState<BlogPost | undefined | null>(undefined);

  useEffect(() => {
    if (!slug) {
      setPost(null);
      return;
    }
    fetch("/api/blog")
      .then((res) => (res.ok ? res.json() : null))
      .then((api: BlogPost[] | null) => {
        if (Array.isArray(api)) {
          const found = api.find((p) => p.slug === slug);
          setPost(found ?? null);
        } else {
          setPost(getPublicBlogPostBySlug(slug) ?? null);
        }
      })
      .catch(() => setPost(getPublicBlogPostBySlug(slug) ?? null));
  }, [slug]);

  return post;
}
