import { NextResponse } from "next/server";
import { get } from "@vercel/blob";

export const dynamic = "force-dynamic";

const BLOB_HOST_SUFFIX = "blob.vercel-storage.com";

/**
 * GET ?url=<encoded-blob-url>
 * Serves the image via Vercel Blob SDK (uses BLOB_READ_WRITE_TOKEN) so it works even when
 * the public Blob URL fails in the browser ("unable to handle this request").
 */
export async function GET(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Blob not configured" }, { status: 503 });
  }
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }
  let pathname: string;
  let blobUrl: string;
  try {
    const url = new URL(decodeURIComponent(rawUrl));
    if (url.protocol !== "https:" || !url.hostname.endsWith(BLOB_HOST_SUFFIX)) {
      return NextResponse.json({ error: "URL not allowed" }, { status: 403 });
    }
    pathname = url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
    blobUrl = url.toString();
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  const opts = { access: "public" as const };
  let result: Awaited<ReturnType<typeof get>> = null;
  try {
    result = await get(pathname, opts);
    if (!result && blobUrl) {
      result = await get(blobUrl, opts);
    }
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error("Media proxy get error:", err);
    return NextResponse.json({ error: "Proxy failed" }, { status: 502 });
  }
  if (!result || result.statusCode !== 200 || !result.stream) {
    return NextResponse.json({ error: "Blob not found" }, { status: 404 });
  }
  const contentType = result.blob.contentType || "image/jpeg";
  const reader = result.stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      total += value.length;
    }
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.length;
  }
  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
