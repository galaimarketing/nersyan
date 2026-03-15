import { NextResponse } from "next/server";
import { getAdminData } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getAdminData();
  if (!data) {
    return NextResponse.json([]);
  }
  const posts = (data.blogPosts ?? []).filter((p) => p.status === "published");
  return NextResponse.json(posts);
}
